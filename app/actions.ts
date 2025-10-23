"use server";

import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type Card = {
    id: string;
    created_at: string;
    goal_type: string;
    tech_tags: string[] | null;
    description: string;
    skill_level: string;
    vibe: string;
    contact_handle: string;
    contact_method: string;
    email?: string | null;
    user_id: string;
    timezone?: string | null;
    availability?: string[] | null;
};

type EditFormData = {
    goal_type: string;
    tech_tags: string[];
    description: string;
    skill_level: string;
    vibe: string;
    contact_handle: string;
    contact_method: string;
    email?: string | null;
    timezone?: string | null;
    availability?: string[] | null; // Use null if empty
};

type NewCardInput = Omit<EditFormData, "id" | "created_at" | "user_id"> & {};

export type MatchedCard = Card & { match_score: number };

const calculateSkillScore = (level1: string, level2: string): number => {
    if (level1 === level2) return 15;
    if (
        level1 === "INTERMEDIATE" &&
        (level2 === "BEGINNER" || level2 === "ADVANCED")
    ) return 8;
    if (
        level2 === "INTERMEDIATE" &&
        (level1 === "BEGINNER" || level1 === "ADVANCED")
    ) return 8;
    if (
        (level1 === "BEGINNER" && level2 === "ADVANCED") ||
        (level1 === "ADVANCED" && level2 === "BEGINNER")
    ) return 2;
    return 0;
};

const parseTimezoneOffset = (tzString?: string | null): number | null => {
    if (!tzString) return null;
    if (tzString.toUpperCase() === "IST") return 5.5;
    const match = tzString.toUpperCase().match(
        /(?:GMT|UTC)\s*([+-])(\d{1,2})(?::?(\d{2}))?/,
    );
    if (match) {
        const sign = match[1] === "-" ? -1 : 1;
        const hours = parseInt(match[2], 10);
        const minutes = parseInt(match[3] || "0", 10);
        if (!isNaN(hours)) return sign * (hours + minutes / 60);
    }
    return null;
};

const calculateAvailabilityOverlap = (
    avail1?: string[] | null,
    avail2?: string[] | null,
): number => {
    if (!avail1 || !avail2 || avail1.length === 0 || avail2.length === 0) {
        return 0;
    }
    const set1 = new Set(avail1);
    let overlapCount = 0;
    avail2.forEach((slot) => {
        if (set1.has(slot)) overlapCount++;
    });
    return Math.min(overlapCount * 2, 5);
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
    const { error: deleteError } = await supabase.from("cards").delete().eq(
        "id",
        cardId,
    ).single();
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
        timezone: formData.timezone || null,
        availability:
            (formData.availability && formData.availability.length > 0)
                ? formData.availability
                : undefined,
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

export async function findMatches(
    newCard: NewCardInput,
): Promise<MatchedCard[]> {
    const supabase = createClient();
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        .toISOString();

    const { data: potentialMatchesData, error } = await supabase
        .from("cards").select("*").gt("created_at", fourteenDaysAgo).limit(100);

    // Explicitly cast to Card[] or handle potential null
    const potentialMatches = potentialMatchesData as Card[] | null;

    if (error || !potentialMatches) {
        console.error("Error fetching potential matches:", error);
        return [];
    }

    const newCardTzOffset = parseTimezoneOffset(newCard.timezone);

    const scoredMatches = potentialMatches.map((match): MatchedCard => {
        let score = 0;
        score += calculateSkillScore(match.skill_level, newCard.skill_level);
        if (match.vibe === newCard.vibe) score += 10;
        if (match.goal_type === newCard.goal_type) score += 5;

        const matchTags = match.tech_tags || [];
        const newCardTags = newCard.tech_tags || [];
        const commonTags = matchTags.filter((tag: string) =>
            newCardTags.includes(tag)
        );
        if (commonTags.length > 0) {
            score += 10 * commonTags.length;
            if (
                commonTags.length === newCardTags.length &&
                commonTags.length === matchTags.length
            ) {
                score += 5;
            }
        }

        if (newCardTzOffset !== null) {
            const matchTzOffset = parseTimezoneOffset(match.timezone);
            if (matchTzOffset !== null) {
                const diff = Math.abs(matchTzOffset - newCardTzOffset);
                if (diff <= 3) score += 8;
                else if (diff <= 6) score += 3;
            }
        } else if (!match.timezone) score += 1;

        score += calculateAvailabilityOverlap(
            match.availability,
            newCard.availability,
        );

        return { ...match, match_score: score };
    });

    const relevantMatches = scoredMatches
        .filter((match) => match.match_score > 12)
        .filter((match) =>
            !(
                match.description === newCard.description &&
                match.contact_handle === newCard.contact_handle &&
                match.skill_level === newCard.skill_level &&
                match.goal_type === newCard.goal_type &&
                JSON.stringify((match.tech_tags || []).sort()) ===
                    JSON.stringify((newCard.tech_tags || []).sort())
            )
        )
        .sort((a, b) => b.match_score - a.match_score);

    return relevantMatches.slice(0, 5);
}
