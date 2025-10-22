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

  const pageStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
  };

  return (
    <main style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2em' }}>GitMatch</h1>
        <Link href="/post" style={{ padding: '10px 15px', background: '#0070f3', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
          + Post Your Goal
        </Link>
      </div>

      <FilterControls currentFilters={{ tech: techFilter, level: levelFilter, goal: goalFilter }} />
      <hr style={{ margin: '20px 0', borderColor: '#444' }} />

      {error && <p style={{ color: "red" }}>Error loading goals: {error.message}</p>}

      {!formattedCards || formattedCards.length === 0 && !error ? (
        <p>No goals found matching your filters. Try broadening your search!</p>
      ) : (
        <div>
          {formattedCards.map((card: FormattedCard) => (
            <GoalCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </main>
  );
}