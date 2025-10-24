import { createClient } from '@/lib/supabaseServer';
import { notFound, redirect } from 'next/navigation';
import EditCardForm from './EditCardForm';

// Define CardData type (or import from a shared types file)
type CardData = {
    id: string;
    created_at: string;
    goal_type: string;
    tech_tags: string[];
    description: string;
    skill_level: string;
    vibe: string;
    contact_handle: string;
    contact_method: string;
    email?: string | null;
    user_id: string;
    timezone?: string | null;
    availability?: string[] | null;
};

type ResolvedParams = { cardId: string };

export default async function EditCardPage({ params }: { params: Promise<ResolvedParams> }) {
    const supabase = createClient();

    const resolvedParams = await params;
    const cardId = resolvedParams?.cardId;

    if (!cardId || typeof cardId !== 'string' || cardId === 'undefined') {
        notFound();
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    const { data: cardData, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`[Edit Page] Error fetching card ${cardId}:`, fetchError);
        throw new Error(`Failed to fetch card: ${fetchError.message}`);
    }

    if (!cardData) {
        notFound();
    }

    if (cardData.user_id !== user.id) {
        console.warn(`[Edit Page] Unauthorized attempt to edit card ${cardId} by user ${user.id}`);
        redirect('/');
    }

    return (
        // Pass the fetched, authorized card data to the form
        <EditCardForm card={cardData as CardData} />
    );
}
