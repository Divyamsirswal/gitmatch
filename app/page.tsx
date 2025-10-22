import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';

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

  const cardStyle: React.CSSProperties = {
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    background: '#222',
  };

  const tagStyle: React.CSSProperties = {
    display: 'inline-block',
    background: '#0070f3',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '4px',
    marginRight: '5px',
    fontSize: '0.8em',
    textTransform: 'lowercase',
  };

  return (
    <main style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2em' }}>GitMatch</h1>
        <Link href="/post" style={{ padding: '10px 15px', background: '#0070f3', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
          + Post Your Goal
        </Link>
      </div>

      {error && <p style={{ color: "red" }}>Error loading goals: {error.message}</p>}

      {!cards || cards.length === 0 && !error ? (
        <p>No goals posted yet. Be the first!</p>
      ) : (
        <div>
          {cards?.map((card: Card) => (
            <div key={card.id} style={cardStyle}>
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{card.description}</h3>
              <div style={{ marginBottom: '10px' }}>
                {card.tech_tags?.map((tag: string) => (
                  <span key={tag} style={tagStyle}>{tag}</span>
                ))}
              </div>
              <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                <span style={{ fontWeight: 'bold' }}>Level:</span> {card.skill_level} |
                <span style={{ fontWeight: 'bold' }}> Vibe:</span> {card.vibe} |
                <span style={{ fontWeight: 'bold' }}> Goal:</span> {card.goal_type}
              </p>
              <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#aaa' }}>
                <span style={{ fontWeight: 'bold' }}>Contact:</span> {card.contact_method} @ {card.contact_handle}
              </p>
              <p style={{ margin: '5px 0', fontSize: '0.8em', color: '#888' }}>
                Posted: {new Date(card.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}