import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
    req: NextRequest,
    {params}: { params: Promise<{ id: string}> }
) => {
    try {
        const { id } = await params
        const { category } = await req.json()

        //  Category validation to prevent "garbage"
        const validCategories = ["apply", "red_flag", "not_for_me"]
        if (!validCategories.includes(category)) {
            return NextResponse.json(
            { error: "Invalid category." },
            { status: 400 }
        );
    }

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
        .from("job_analyses")
        .update({ category })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        console.log("Error updating category: ", error);
        return NextResponse.json(
            { error: "Failed to update category." },
            { status: 500 }
      );
    }
    
    return NextResponse.json(data)
    } catch (error) {
        console.log("Error in category route: ", error);
        return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 }
        );
  }
}