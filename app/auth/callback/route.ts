import { createClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;

    if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(origin);
        }
    }
    console.error("Error exchanging code for session in auth callback");
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("error", "Could not authenticate user");
    return NextResponse.redirect(redirectUrl);
}
