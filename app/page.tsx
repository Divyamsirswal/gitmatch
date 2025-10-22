import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import GoalCard from '@/components/GoalCard';
import FilterControls from '@/components/FilterControls';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

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

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = createClient();

  const techFilter = resolvedParams?.tech as string | undefined;
  const levelFilter = resolvedParams?.level as string | undefined;
  const goalFilter = resolvedParams?.goal as string | undefined;

  let query = supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (techFilter) {
    query = query.contains('tech_tags', [techFilter]);
  }
  if (levelFilter) {
    query = query.eq('skill_level', levelFilter);
  }
  if (goalFilter) {
    query = query.eq('goal_type', goalFilter);
  }

  const { data: cards, error } = await query;

  if (error) {
    console.error("Error fetching cards:", error);
  }

  const formattedCards: FormattedCard[] = cards?.map(card => ({
    ...card,
    formatted_created_at: new Date(card.created_at).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  })) || [];


  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">GitMatch</h1>
        <Link href="/post" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
          + Post Your Goal
        </Link>
      </div>

      <FilterControls currentFilters={{ tech: techFilter, level: levelFilter, goal: goalFilter }} />
      <hr className="my-6 border-gray-700" />

      {error && <p className="text-red-500 text-center">Error loading goals: {error.message}</p>}

      {!formattedCards || formattedCards.length === 0 && !error ? (
        <p className="text-center text-gray-400">No goals found matching your filters. Try broadening your search!</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {formattedCards.map((card: FormattedCard) => (
            <GoalCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </main>
  );
}