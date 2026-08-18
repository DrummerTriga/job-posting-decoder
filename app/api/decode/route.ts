
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { MODEL } from "@/lib/model";
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
            model: MODEL,
            max_tokens: 1024,
            messages: [
                {
                role: "user",
                content: `Analyse this open position and answer in exactly two parts.

                        Your answer shall always start with a title about this position, for example: "Full Stack Developer at ADOBE". If you dont see the
                        company name, try to create a title based on the position. Keep it to a single short line, with no quotes and no label.

                        Then leave one blank line and return ONLY a valid JSON (without markdown,  \`\`\`, no text after) with this exact structure:
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

        // Claude answers with a one-line title, then the JSON. Split the two so
        // the JSON still parses, and keep the title as the first line of
        // raw_job_text — there is no separate column for it.
        const jsonStart = responseText.indexOf("{")
        const jsonEnd = responseText.lastIndexOf("}")

        // Only the first real line is the title — ignore a code fence if Claude
        // adds one despite being asked not to.
        const title =
            jsonStart > 0
                ? (responseText
                      .slice(0, jsonStart)
                      .split("\n")
                      .map((line) => line.trim())
                      .find((line) => line && !line.startsWith("\`\`\`")) ?? "")
                      .replace(/^["'#\s-]+|["'\s]+$/g, "")
                : ""

        const parsed = JSON.parse(
            jsonStart >= 0 ? responseText.slice(jsonStart, jsonEnd + 1) : responseText
        )

        // Falls back to the pasted text alone if Claude skipped the title.
        const rawJobText = title ? `${title}\n\n${jobPosting}` : jobPosting

        const { data: savedAnalysis, error: dbError } = await supabase
            .from("job_analyses")
            .insert({
                user_id: user.id,
                raw_job_text: rawJobText,
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
