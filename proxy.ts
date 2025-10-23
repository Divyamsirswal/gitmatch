import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({ request: { headers: request.headers } });
    let supabaseClientCreated = false;

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        const value = request.cookies.get(name)?.value;
                        return value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        request.cookies.set({ name, value, ...options });
                        response = NextResponse.next({
                            request: { headers: request.headers },
                        });
                        response.cookies.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        request.cookies.set({ name, value: "", ...options });
                        response = NextResponse.next({
                            request: { headers: request.headers },
                        });
                        response.cookies.set({ name, value: "", ...options });
                    },
                },
            },
        );
        supabaseClientCreated = true;
        const requestUrl = request.nextUrl.pathname;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user && requestUrl === "/post") {
            console.log(
                "Proxy: Unauthorized access to /post detected. Redirecting to /login.",
            );
            return NextResponse.redirect(new URL("/login", request.url));
        }
    } catch (e) {
        let errorMessage = "Unknown error in proxy";
        if (e instanceof Error) errorMessage = e.message;
        console.error("Proxy: Error:", errorMessage);
        if (!supabaseClientCreated) {
            console.error(
                "Proxy: Error occurred BEFORE Supabase client was created (check env vars?)",
            );
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/).*)",
    ],
};
