import { createClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default async function AuthButton() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return user ? (
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300 hidden sm:block">
                Hey, {user.email}
            </span>
            <LogoutButton />
        </div>
    ) : (
        <Link
            href="/login"
            className="py-2 px-3 flex rounded-md no-underline bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
            Login
        </Link>
    );
}