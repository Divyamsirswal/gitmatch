import { createClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import GoalCard from '@/components/GoalCard';
import Link from 'next/link';

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
    email?: string;
    user_id: string;
    timezone?: string | null;
    availability?: string[] | null;
};
type FormattedCard = Omit<Card, 'created_at'> & { formatted_created_at: string };

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.log("Profile page: User not logged in, redirecting.");
        redirect('/login');
    }

    const { data: userCards, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (fetchError) {
        console.error("Error fetching user's cards:", fetchError);
    }

    const formattedCards: FormattedCard[] = userCards?.map(card => ({
        ...card,
        formatted_created_at: new Date(card.created_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        })
    })) || [];

    return (
        <main className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white">Your Goal Cards</h1>
                <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
                    &larr; Back to All Goals
                </Link>
            </div>

            {fetchError && (
                <p className="p-3 mb-4 text-center text-sm text-red-800 bg-red-100 rounded-md border border-red-200">
                    Error loading your cards: {fetchError.message}
                </p>
            )}

            {formattedCards.length === 0 && !fetchError ? (
                <div className="text-center py-12 px-6 bg-gray-800 rounded-lg border border-gray-700">
                    <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-300">No Goal Cards Yet</h3>
                    <p className="mt-1 text-sm text-gray-400">You haven't posted any goals. Get started by creating one!</p>
                    <div className="mt-6">
                        <Link
                            href="/post"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
                        >
                            + Post Your First Goal
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {formattedCards.map((card) => (
                        <GoalCard
                            key={card.id}
                            card={card}
                            currentUserId={user.id}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}