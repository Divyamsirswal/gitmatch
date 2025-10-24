import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token"); // Look for 'token'
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
        const nowISO = new Date().toISOString();
        const { data: tokenData, error: tokenFetchError } = await supabaseAdmin
            .from("relist_tokens")
            .select("card_id, expires_at")
            .eq("token", token)
            .gte("expires_at", nowISO)
            .single();

        if (tokenFetchError || !tokenData) {
            console.warn(
                `Relist attempt with invalid, non-existent, or expired token: ${token}`,
                tokenFetchError,
            );
            if (tokenFetchError?.code !== "PGRST116") { // PGRST116 means not found
                await supabaseAdmin.from("relist_tokens").delete().eq(
                    "token",
                    token,
                );
            }
            redirectBaseUrl.searchParams.set(
                "relist_error",
                tokenFetchError?.code === "PGRST116"
                    ? "invalid_link"
                    : "expired_link",
            );
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
            throw updateError; // Let main catch handle redirect
        }

        const { error: tokenDeleteError } = await supabaseAdmin
            .from("relist_tokens")
            .delete()
            .eq("token", token); // Delete the specific token used

        if (tokenDeleteError) {
            console.error(
                `CRITICAL: Failed to delete used relist token ${token}:`,
                tokenDeleteError.message,
            );
            // Log this failure, but proceed with success redirect as card was relisted
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
