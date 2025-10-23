"use server";

import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type EditFormData = {
    goal_type: string;
    tech_tags: string[];
    description: string;
    skill_level: string;
    vibe: string;
    contact_handle: string;
    contact_method: string;
    email?: string | null;
};

export async function deleteCard(
    cardId: string,
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        console.error("Delete Error: Unauthorized", authError);
        return {
            success: false,
            error: "Unauthorized: You must be logged in.",
        };
    }

    const { error: deleteError } = await supabase
        .from("cards")
        .delete()
        .eq("id", cardId)
        .single();

    if (deleteError) {
        console.error(`Delete Error for card ${cardId}:`, deleteError.message);
        return {
            success: false,
            error: `Database error: ${deleteError.message}`,
        };
    }

    revalidatePath("/");
    return { success: true };
}

export async function updateCard(
    cardId: string,
    formData: EditFormData,
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        console.error("Update Error: Unauthorized", authError);
        return {
            success: false,
            error: "Unauthorized: You must be logged in.",
        };
    }

    const dataToUpdate = {
        goal_type: formData.goal_type,
        tech_tags: formData.tech_tags,
        description: formData.description.trim(),
        skill_level: formData.skill_level,
        vibe: formData.vibe,
        contact_handle: formData.contact_handle.trim(),
        contact_method: formData.contact_method,
        email: formData.email?.trim() || null,
    };

    const { error: updateError } = await supabase
        .from("cards")
        .update(dataToUpdate)
        .eq("id", cardId)
        .select("id") 
        .single(); 

    if (updateError) {
        console.error(`Update Error for card ${cardId}:`, updateError.message);
        return {
            success: false,
            error: `Database error: ${updateError.message}`,
        };
    }

    revalidatePath("/"); 
    revalidatePath(`/edit/${cardId}`); 
    redirect("/"); 

}
