// File: app/api/relist/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const redirectBaseUrl = new URL("/", request.url);

    if (!token) {
        console.warn("Relist attempt with missing token.");
        redirectBaseUrl.searchParams.set("relist_error", "invalid_link");
        return NextResponse.redirect(redirectBaseUrl);
    }

    if (!supabaseUrl || !serviceRoleKey) {
        console.error(
            "Missing Supabase URL or Service Role Key for relist API",
        );
        redirectBaseUrl.searchParams.set("relist_error", "server_config");
        return NextResponse.redirect(redirectBaseUrl);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
    });

    try {
        const now = new Date().toISOString();
        const { data: tokenData, error: tokenFetchError } = await supabaseAdmin
            .from("relist_tokens")
            .select("card_id, expires_at")
            .eq("token", token)
            .single();

        if (tokenFetchError || !tokenData) {
            console.warn(
                `Relist attempt with invalid or non-existent token: ${token}`,
                tokenFetchError,
            );
            redirectBaseUrl.searchParams.set("relist_error", "invalid_link");
            return NextResponse.redirect(redirectBaseUrl);
        }

        if (new Date(tokenData.expires_at) < new Date()) {
            console.warn(`Relist attempt with expired token: ${token}`);
            await supabaseAdmin.from("relist_tokens").delete().eq(
                "token",
                token,
            );
            redirectBaseUrl.searchParams.set("relist_error", "expired_link");
            return NextResponse.redirect(redirectBaseUrl);
        }

        const cardId = tokenData.card_id;
        const { error: updateError } = await supabaseAdmin
            .from("cards")
            .update({ created_at: new Date().toISOString() })
            .eq("id", cardId);

        if (updateError) {
            console.error(
                `Error relisting card ${cardId} using token ${token}:`,
                updateError.message,
            );
            throw updateError;
        }

        const { error: tokenDeleteError } = await supabaseAdmin
            .from("relist_tokens")
            .delete()
            .eq("token", token);

        if (tokenDeleteError) {
            console.error(
                `Failed to delete used relist token ${token}:`,
                tokenDeleteError.message,
            );
        }

        console.log(
            `Successfully relisted card ${cardId} using token ${token}`,
        );
        redirectBaseUrl.searchParams.set("relisted", "true");
        return NextResponse.redirect(redirectBaseUrl);
    } catch (error) {
        let errorMessage = "Unknown error during relist";
        if (error instanceof Error) errorMessage = error.message;
        console.error("Relist API failed:", errorMessage);
        redirectBaseUrl.searchParams.set("relist_error", "failed");
        return NextResponse.redirect(redirectBaseUrl);
    }
}
