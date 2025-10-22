import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import GoalCard from '@/components/GoalCard';

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
type FormattedCard = Omit<Card, 'created_at'> & { formatted_created_at: string };


async function MatchResults({ matchIds }: { matchIds: string[] }) {
    if (!matchIds || matchIds.length === 0) {
        return <p>No specific matches found, but check the homepage for all goals!</p>;
    }

    const supabase = createClient();
    const { data: matchedCardsData, error } = await supabase
        .from('cards')
        .select('*')
        .in('id', matchIds);

    if (error) {
        console.error("Error fetching matched cards:", error);
        return <p>Error loading matches. Please check the homepage.</p>;
    }
    if (!matchedCardsData || matchedCardsData.length === 0) {
        return <p>Could not load match details. Check the homepage.</p>;
    }

    const formattedMatchedCards: FormattedCard[] = matchedCardsData.map(card => ({
        ...card,
        formatted_created_at: new Date(card.created_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        })
    }));

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>We found these potential matches for you:</h2>
            {formattedMatchedCards.map((card) => (
                <GoalCard key={card.id} card={card} />
            ))}
        </div>
    );
}

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams; 
    let matchIds: string[] = [];
    try {
        const matchesParam = resolvedParams?.matches;

        if (typeof matchesParam === 'string') {
            const parsedIds = JSON.parse(matchesParam);
            if (Array.isArray(parsedIds)) {
                matchIds = parsedIds.map(String);
            }
        }
    } catch (e) {
        console.error("Failed to parse match IDs from query params:", e);
    }

    const pageStyle: React.CSSProperties = {
        maxWidth: '800px',
        margin: '40px auto',
        padding: '20px',
        textAlign: 'center'
    };

    return (
        <main style={pageStyle}>
            <h1>Goal Posted Successfully! 🎉</h1>
            <p style={{ marginBottom: '30px' }}>Your goal is now live for 14 days.</p>

            <Suspense fallback={<p>Loading matches...</p>}>
                <MatchResults matchIds={matchIds} />
            </Suspense>

            <Link href="/" style={{ display: 'inline-block', marginTop: '30px', padding: '10px 20px', background: '#555', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                View All Goals
            </Link>
        </main>
    );
}