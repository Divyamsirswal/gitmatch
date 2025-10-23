import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabaseServer';
import GoalCard from '@/components/GoalCard';
import FilterControls from '@/components/FilterControls';
import AuthButton from '@/components/AuthButton';

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
  email?: string;
  user_id: string; // Ensure user_id is included
};
type FormattedCard = Omit<Card, 'created_at'> & { formatted_created_at: string };


async function CardListWithUser({ techFilter, levelFilter, goalFilter, currentUserId }: {
  techFilter?: string;
  levelFilter?: string;
  goalFilter?: string;
  currentUserId?: string;
}) {
  const supabase = createClient();
  let query = supabase.from('cards').select('*').order('created_at', { ascending: false });

  if (techFilter) query = query.contains('tech_tags', [techFilter.trim().toLowerCase()]);
  if (levelFilter) query = query.eq('skill_level', levelFilter);
  if (goalFilter) query = query.eq('goal_type', goalFilter);

  const { data: cards, error } = await query;

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

  if (formattedCards.length === 0) {
    return (
      <p className="text-center text-gray-400">
        {techFilter || levelFilter || goalFilter ? 'No goals found matching your filters. Try broadening your search!' : 'No goals posted yet. Be the first!'}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6">
      {formattedCards.map((card: FormattedCard) => (
        <GoalCard key={card.id} card={card} currentUserId={currentUserId} />
      ))}
    </div>
  );
}

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {

  const resolvedParams = await searchParams;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  const techFilter = resolvedParams?.tech as string | undefined;
  const levelFilter = resolvedParams?.level as string | undefined;
  const goalFilter = resolvedParams?.goal as string | undefined;
  const relisted = resolvedParams?.relisted === 'true';
  const relistError = resolvedParams?.relist_error;

  let errorMessage = null;
  if (relistError) {
    switch (relistError) {
      case 'missing_id':
      case 'server_config':
      case 'failed':
        errorMessage = "Sorry, there was an error relisting your card. Please try posting again if needed.";
        break;
      default:
        errorMessage = "An unknown error occurred during relisting.";
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">GitMatch</h1>
        <div className="flex items-center gap-3">
          {user && (
            <Link
              href="/post"
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs sm:text-sm font-medium transition-colors"
            >
              + Post Goal
            </Link>
          )}
          <Suspense fallback={<div className="h-9 w-20 rounded-md bg-gray-700 animate-pulse"></div>}>
            <AuthButton />
          </Suspense>
        </div>
      </div>

      {relisted && (
        <p className="p-3 mb-4 text-center text-sm text-green-800 bg-green-100 rounded-md border border-green-200">
          Your goal card has been successfully relisted for another 14 days!
        </p>
      )}
      {errorMessage && !relisted && (
        <p className="p-3 mb-4 text-center text-sm text-red-800 bg-red-100 rounded-md border border-red-200">
          {errorMessage}
        </p>
      )}

      <FilterControls currentFilters={{ tech: techFilter, level: levelFilter, goal: goalFilter }} />
      <hr className="my-6 border-gray-700" />

      <Suspense fallback={<p className="text-center text-gray-400">Loading goals...</p>}>
        <CardListWithUser
          techFilter={techFilter}
          levelFilter={levelFilter}
          goalFilter={goalFilter}
          currentUserId={currentUserId}
        />
      </Suspense>

    </main>
  );
}