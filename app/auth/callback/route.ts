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
        const { error, data } = await supabase.auth.exchangeCodeForSession(
            code,
        );

        if (error) {
            const redirectUrl = new URL("/login", origin);
            redirectUrl.searchParams.set(
                "error",
                `Could not authenticate user: ${error.message}`,
            );
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.redirect(origin);
    }

    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set(
        "error",
        "Authentication failed: No code received.",
    );
    return NextResponse.redirect(redirectUrl);
}
