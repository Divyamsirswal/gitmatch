'use client';

import { createClient } from '@/lib/supabase'; 
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        } else {
            router.push('/login'); 
            router.refresh();
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="py-2 px-3 flex rounded-md no-underline bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium transition-colors"
        >
            Logout
        </button>
    );
}