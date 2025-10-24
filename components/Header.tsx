import Link from 'next/link';
import { Suspense } from 'react';
import AuthButton from './AuthButton';
import { createClient } from '@/lib/supabaseServer';

export default async function Header() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const githubRepoUrl = "https://github.com/Divyamsirswal/gitmatch";

    return (
        <header className="w-full border-b border-gray-700 bg-gray-800/30 backdrop-blur-sm sticky top-0 z-50">
            <nav className="max-w-6xl mx-auto flex justify-between items-center p-4">

                <div className="flex items-center gap-3">
                    <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300 transition-colors">
                        GitMatch
                    </Link>
                    <Link
                        href={githubRepoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View Source on GitHub"
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="View Source on GitHub"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            role="img"
                        >
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {user && (
                        <Link
                            href="/post"
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs sm:text-sm font-medium transition-colors"
                        >
                            + Post Goal
                        </Link>
                    )}
                    <Suspense fallback={<div className="h-9 w-20 rounded-md bg-gray-700 animate-pulse"></div>}>
                        <AuthButton />
                    </Suspense>
                </div>
            </nav>
        </header>
    );
}