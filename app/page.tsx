import { Suspense } from 'react';
import { createClient } from '@/lib/supabaseServer';
import FilterControls from '@/components/FilterControls';
import SkeletonCard from '@/components/SkeletonCard';
import CardList from '@/components/CardList';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

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
      case 'expired_link':
      case 'invalid_link':
        errorMessage = "Sorry, there was an error relisting your card. Please try posting again if needed.";
        break;
      default:
        errorMessage = "An unknown error occurred during relisting.";
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      }>
        <CardList
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