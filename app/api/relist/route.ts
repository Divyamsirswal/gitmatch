import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
        return NextResponse.json({ success: false, message: 'Missing card identifier' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    try {
        const { error: updateError } = await supabaseAdmin
            .from('cards')
            .update({ created_at: new Date().toISOString() })
            .eq('id', cardId);

        if (updateError) {
            console.error(`Error relisting card ${cardId}:`, updateError);
            throw updateError;
        }

        const redirectUrl = new URL('/', request.url);
        redirectUrl.searchParams.set('relisted', 'true');
        return NextResponse.redirect(redirectUrl);

    } catch (error) {
        console.error('Relist failed:', error);
        const errorUrl = new URL('/', request.url);
        errorUrl.searchParams.set('relist_error', 'true');
        return NextResponse.redirect(errorUrl);
    }
}