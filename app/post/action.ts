"use server";

import { createClient } from "@/lib/supabaseServer";

type Card = {
    id: string;
    created_at: string;
    goal_type: string;
    tech_tags: string[];
    description: string;
    skill_level: string;
    vibe: string;
    contact_handle: string;
    contact_method: string;
};


type NewCardInput = Omit<Card, 'id' | 'created_at' | 'website' | 'formatted_created_at'> & {};

export type MatchedCard = Card & { match_score: number };

export async function findMatches(newCard: NewCardInput): Promise<MatchedCard[]> {
    const supabase = createClient();
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: potentialMatches, error } = await supabase
        .from('cards')
        .select('*')
        .gt('created_at', fourteenDaysAgo)
        .limit(100);

    if (error || !potentialMatches) {
        console.error("Error fetching potential matches:", error);
        return [];
    }

    const scoredMatches = potentialMatches.map((match): MatchedCard => {
        let score = 0;

        if (match.skill_level === newCard.skill_level) {
            score += 15;
        } else if (
            (match.skill_level === 'INTERMEDIATE' && (newCard.skill_level === 'BEGINNER' || newCard.skill_level === 'ADVANCED')) ||
            (newCard.skill_level === 'INTERMEDIATE' && (match.skill_level === 'BEGINNER' || match.skill_level === 'ADVANCED'))
        ) {
            score += 5;
        }

        if (match.vibe === newCard.vibe) {
            score += 10;
        }

        if (match.goal_type === newCard.goal_type) {
            score += 5;
        }

        const commonTags = match.tech_tags.filter((tag: string) => newCard.tech_tags.includes(tag));
        if (commonTags.length > 0) {
            score += 10 * commonTags.length;
        }

        return { ...match, match_score: score };
    });

    const relevantMatches = scoredMatches
        .filter(match => match.match_score > 5)
        .filter(match => !(match.description === newCard.description && match.contact_handle === newCard.contact_handle))
        .sort((a, b) => b.match_score - a.match_score);

    return relevantMatches.slice(0, 5);
}