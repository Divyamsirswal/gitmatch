import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabaseServer';
import GoalCard from '@/components/GoalCard';
import FilterControls from '@/components/FilterControls';
import AuthButton from '@/components/AuthButton';
import SkeletonCard from '@/components/SkeletonCard';
import PaginationControls from '@/components/PaginationControls';

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
  user_id: string;
  timezone?: string | null;
  availability?: string[] | null;
};
type FormattedCard = Omit<Card, 'created_at'> & { formatted_created_at: string };

const ITEMS_PER_PAGE = 10;

async function CardListWithUser({ techFilter, levelFilter, goalFilter, currentUserId, currentPage }: {
  techFilter?: string;
  levelFilter?: string;
  goalFilter?: string;
  currentUserId?: string;
  currentPage: number;
}) {
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
      <div className="grid grid-cols-1 gap-4 md:gap-6">
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

  const page = resolvedParams?.page ? parseInt(resolvedParams.page as string, 10) : 1;
  const currentPage = isNaN(page) || page < 1 ? 1 : page;

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

  const githubRepoUrl = "https://github.com/Divyamsirswal/gitmatch";

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            <Link href="/" className="hover:text-gray-300 transition-colors">GitMatch</Link>
          </h1>
          <Link
            href={githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="View Source on GitHub"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="View Source on GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="img"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </Link>
        </div>
        <div className="flex items-center gap-3 self-center sm:self-auto">
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

      <Suspense fallback={
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      }>
        <CardListWithUser
          techFilter={techFilter}
          levelFilter={levelFilter}
          goalFilter={goalFilter}
          currentUserId={currentUserId}
          currentPage={currentPage}
        />
      </Suspense>

    </main>
  );
}