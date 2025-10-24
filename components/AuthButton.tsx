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
            <Link href="/profile" className="text-sm text-gray-300 hover:text-white hidden sm:block" title="View Your Cards">
                Hey, {user.email}
            </Link>
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