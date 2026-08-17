import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";

PDFParse.setWorker(getPath());

export const POST = async (req: NextRequest) => {
    try {
        const supabase = await createClient()

        const {
            data: { user }, 
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: "You must be logged in"},
                { status: 401 }
            )
        }

        const formData = await req.formData()
        const file = formData.get("cv") as File | null

        if (!file) {
            return NextResponse.json(
                {error: "No file was sent."},
                { status: 400 }
            )
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json(
                {error: "Only PDF files are accepted."},
                { status: 400 }
            )
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const parser = new PDFParse( { data: buffer } )
        const result = await parser.getText()
        const extractedText = result.text
        // resource saver, awaits for the process to finish to free internal resources that the lib used
        await parser.destroy()

        if (!extractedText || extractedText.trim().length < 50) {
            return NextResponse.json(
                {
                error:
                    "Couldn't extract readable text from this PDF. Try a different file.",
                },
                { status: 400 }
            );
        }

        const filePath = `${user.id}/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase.storage
            .from("cvs")
            .upload(filePath, buffer, {
                contentType: "application/pdf",
                upsert: false
            })
        
        if (uploadError) {
        console.log("Error uploading file: ", uploadError);
        return NextResponse.json(
                { error: "Failed to upload file." },
                { status: 500 }
            );
        }

        await supabase.from ("cvs").delete().eq("user_id", user.id)

        const { data: savedCv, error: dbError } = await supabase
            .from("cvs")
            .insert({
                user_id: user.id,
                file_path: filePath,
                extracted_text: extractedText,
            })
            .select()
            .single();

        if (dbError) {
            console.log("Error saving CV record: ", dbError);
            return NextResponse.json(
                { error: "File uploaded but failed to save record." },
                { status: 500 }
            );
        }

        return NextResponse.json(savedCv);
        } catch (error) {
            console.log("Error processing CV upload: ", error);
            return NextResponse.json(
            { error: "Something went wrong while processing the file." },
            { status: 500 }
            );
        }
        };