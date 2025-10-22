import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { token } = await request.json();

    if (!token) {
        return NextResponse.json({ success: false, message: 'Missing token' }, { status: 400 });
    }

    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

    if (!secretKey) {
        console.error('Missing Cloudflare Turnstile Secret Key');
        return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            console.error('Turnstile verification failed:', result['error-codes']);
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error verifying Turnstile token:', error);
        return NextResponse.json({ success: false, message: 'Error verifying token' }, { status: 500 });
    }
}