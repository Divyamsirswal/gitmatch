import { createClient } from '@/lib/supabaseServer';
import GoalCard from '@/components/GoalCard';
import PaginationControls from '@/components/PaginationControls';

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

const ITEMS_PER_PAGE = 9;

type CardListProps = {
    techFilter?: string;
    levelFilter?: string;
    goalFilter?: string;
    currentUserId?: string;
    currentPage: number;
};

export default async function CardList({
    techFilter,
    levelFilter,
    goalFilter,
    currentUserId,
    currentPage
}: CardListProps) {
    const supabase = createClient();

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE - 1;

    let query = supabase.from('cards')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex);

    if (techFilter) query = query.contains('tech_tags', [techFilter.trim().toLowerCase()]);
    if (levelFilter) query = query.eq('skill_level', levelFilter);
    if (goalFilter) query = query.eq('goal_type', goalFilter);

    const { data: cards, error, count } = await query;
    const totalCount = count ?? 0;

    if (error) {
        console.error("Error fetching cards:", error);
        return <p className="text-red-500 text-center">Error loading goals: {error.message}</p>;
    }

    const formattedCards: FormattedCard[] = cards?.map(card => ({
        ...card,
        formatted_created_at: new Date(card.created_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        })
    })) || [];

    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;

    if (formattedCards.length === 0) {
        const hasFilters = techFilter || levelFilter || goalFilter;
        return (
            <div className="text-center py-10 px-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                    {hasFilters ? "No Matches Found" : "No Goals Posted Yet"}
                </h3>
                <p className="text-sm text-gray-400">
                    {hasFilters
                        ? "Try adjusting or clearing your filters to see more goals."
                        : "Be the first to post a goal and find a coding partner!"}
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {formattedCards.map((card: FormattedCard) => (
                    <GoalCard key={card.id} card={card} currentUserId={currentUserId} />
                ))}
            </div>
            <div className="mt-6 text-center text-gray-400 text-sm">
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            </div>
        </div>
    );
}