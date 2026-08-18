
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";


const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export const POST = async (req: NextRequest) => {
    try { 
        const {jobPosting} = await req.json()

        if (!jobPosting || jobPosting.trim().length < 20) {
            return NextResponse.json(
                { error: "Please paste the complete text of the job posting"},
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

        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            messages: [
                {
                role: "user",
                content: `Analyse this open position and return ONLY a valid JSON (without markdown,  \`\`\`, no text before or after) with this exact structure:
                        {
                        "technologies_required": ["array of the mentioned technologies"],
                        "seniority_advertised": "What the position says, ex: Senior",
                        "seniority_estimated_real": "my honest estimate based on the described requirements",
                        "red_flags": ["phrases or patterns that suggest a toxic culture or unrealistic expectations, with a brief explanation of each"],
                        "buzzwords_detected": ["empty words like ninja, rockstar, fast-paced, work hard play hard"]
                        }
                        Job Position: ${jobPosting}`,
                }
            ]
        })
        
        const responseText = 
            message.content[0].type === "text" ? message.content[0].text: "";
        
        const parsed = JSON.parse(responseText)

        const { data: savedAnalysis, error: dbError } = await supabase
            .from("job_analyses")
            .insert({
                user_id: user.id,
                raw_job_text: jobPosting,
                technologies_required: parsed.technologies_required,
                seniority_advertised: parsed.seniority_advertised,
                seniority_estimated_real: parsed.seniority_estimated_real,
                red_flags: parsed.red_flags,
                buzzwords_detected: parsed.buzzwords_detected,
            })
            .select()
            .single()

        if (dbError) {
            console.log("Error saving to database: ", dbError)
            return NextResponse.json(
                {error: "Analysis succeeded but failed to save. Try again."},
                { status: 500 }
            )
        }

        return NextResponse.json(savedAnalysis)

        } catch (error) {
        console.log("Error while processing the job position: ", error)
        return NextResponse.json(
            { error: "Error while analysing the position. Please try again." },
            { status: 500 }
            );
    }
} 
