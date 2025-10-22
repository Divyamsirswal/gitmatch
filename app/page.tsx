
import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import GoalCard from '@/components/GoalCard';

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

type FormattedCard = Omit<Card, 'created_at'> & {
  formatted_created_at: string;
};

export default async function Home() {
  const supabase = createClient();

  const { data: cards, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching cards:", error);
  }

  const pageStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
  };

  const formattedCards: FormattedCard[] = cards?.map(card => ({
    ...card,
    formatted_created_at: new Date(card.created_at).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  })) || [];

  return (
    <main style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2em' }}>GitMatch</h1>
        <Link href="/post" style={{ padding: '10px 15px', background: '#0070f3', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
          + Post Your Goal
        </Link>
      </div>

      {error && <p style={{ color: "red" }}>Error loading goals: {error.message}</p>}

      {!formattedCards || formattedCards.length === 0 && !error ? (
        <p>No goals posted yet. Be the first!</p>
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