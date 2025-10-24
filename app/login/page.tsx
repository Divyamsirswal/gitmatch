'use client'
import { createClient } from '@/lib/supabase'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, Suspense } from 'react'
import toast from 'react-hot-toast'

function LoginForm() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const errorDescription = searchParams.get('error_description') || searchParams.get('error')
        if (errorDescription) {
            toast.error(errorDescription || 'Authentication failed. Please try again.')
        }
    }, [searchParams, router])

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
                toast.success('Login successful!')
                setTimeout(() => {
                    router.push('/')
                    router.refresh()
                }, 1000);
            }
        })

        return () => {
            subscription?.unsubscribe()
        }
    }, [supabase, router])

    return (
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                theme="dark"
                providers={['github', 'google']}
                redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`}
                onlyThirdPartyProviders={false}
                showLinks={true}
            />
        </div>
    );
}


export default function LoginPage() {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-gray-900">
            <Suspense fallback={<div className="w-full max-w-md h-[400px] bg-gray-800 rounded-lg shadow-xl border border-gray-700 animate-pulse"></div>}>
                <LoginForm />
            </Suspense>

            <div className="mt-6 text-center">
                <Link href="/" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                    &larr; Back to Homepage
                </Link>
            </div>
        </div>
    )
}