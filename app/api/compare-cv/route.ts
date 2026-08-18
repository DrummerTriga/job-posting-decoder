
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";


const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export const POST = async (req: NextRequest) => {
    try { 
        const {jobAnalysisId} = await req.json()

        if (!jobAnalysisId ) {
            return NextResponse.json(
                { error: "Missing jobAnalysisId."},
                { status: 400}
            )
        }

        const supabase = await createClient()

        // Checking which user is it:
        const { 
            data: { user },
             } = await supabase.auth.getUser()
        
        // blocking the request if there is no User.
        if (!user) {
            return NextResponse.json(
                { error: "You must be logged in." },
                { status: 401 }
             );
        }

        const { data: jobAnalysis, error: jobError } = await supabase
            .from("job_analyses")
            .select("*")
            .eq("id", jobAnalysisId)
            .eq("user_id", user.id)
            .single();

        if (jobError || !jobAnalysis) {
            return NextResponse.json(
                { error: "Job analysis not found." },
                { status: 404 }
            );
        }

        const { data: cv, error: cvError } = await supabase
            .from("cvs")
            .select("*")
            .eq("user_id", user.id)
            .order("uploaded_at", { ascending: false })
            .limit(1)
            .single();

        if (cvError || !cv) {
            return NextResponse.json(
                { error: "No CV found. Please upload one first." },
                { status: 404 }
            );
        }

        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1500,
            messages: [
                {
                role: "user",
                content: `You are comparing a candidate's CV against a job posting to assess fit.

                    Return ONLY a valid JSON (no markdown, no \`\`\`, no text before or after) with this exact structure:
                    {
                    "match_score": <integer 0-100>,
                    "matching_skills": ["skills/technologies present in both the CV and the job posting"],
                    "missing_skills": ["skills/technologies the job requires that are not evident in the CV"],
                    "overall_assessment": "a short, honest paragraph (3-4 sentences) on how well this candidate fits, including any notable strengths or gaps"
                    }

                    Be honest and calibrated in the match_score — do not inflate it. A score of 100 would mean a near-perfect match; a score below 40 means significant gaps exist.

                    --- CV ---
                    ${cv.extracted_text}

                    --- JOB POSTING ---
                    ${jobAnalysis.raw_job_text}`,
                },
            ],
        })
        
        const responseText = 
            message.content[0].type === "text" ? message.content[0].text: "";
        
        const parsed = JSON.parse(responseText)

        const { data: savedComparison, error: dbError } = await supabase
            .from("cv_comparisons")
            .insert({
                job_analysis_id: jobAnalysisId,
                cv_id: cv.id,
                match_score: parsed.match_score,
                analysis_text: JSON.stringify({
                    matching_skills: parsed.matching_skills,
                    missing_skills: parsed.missing_skills,
                    overall_assessment: parsed.overall_assessment,
                }),
            })
            .select()
            .single();

            if (dbError) {
                console.log("Error saving comparison: ", dbError);
                return NextResponse.json(
                    { error: "Comparison succeeded but failed to save." },
                    { status: 500 }
                );
            }

        if (dbError) {
            console.log("Error saving to database: ", dbError)
            return NextResponse.json(
                {error: "Analysis succeeded but failed to save. Try again."},
                { status: 500 }
            )
        }

        return NextResponse.json({
            id: savedComparison.id,
            match_score: parsed.match_score,
            matching_skills: parsed.matching_skills,
            missing_skills: parsed.missing_skills,
            overall_assessment: parsed.overall_assessment,
        });
    } catch (error) {
        console.log("Error comparing CV to job: ", error);
        return NextResponse.json(
            { error: "Something went wrong during comparison." },
            { status: 500 }
            );
    }
};