import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { createSession } from '@/app/lib/session';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=Google login failed', req.url));
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID || '',
                client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) {
            console.error('Google token error:', tokenData.error);
            return NextResponse.redirect(new URL('/login?error=Google login failed', req.url));
        }

        // Get User Info from Google
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const googleUser = await userResponse.json();

        if (!googleUser.email) {
            return NextResponse.redirect(new URL('/login?error=Could not get Google account info', req.url));
        }

        // Find or create user
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', googleUser.email)
            .maybeSingle();

        let userId: string;
        let username: string;
        let role: string;

        if (!existingUser) {
            console.log('Creating new Google user:', googleUser.email);
            userId = crypto.randomUUID();
            username = googleUser.name;
            role = 'student';

            const { error } = await supabase.from('users').insert({
                id: userId,
                username,
                email: googleUser.email,
                image: googleUser.picture,
                provider: 'google',
                role,
                created_at: new Date().toISOString(),
            });

            if (error) {
                console.error('Supabase insert error:', error);
                return NextResponse.redirect(new URL('/login?error=Account creation failed', req.url));
            }
        } else {
            console.log('Google user found:', existingUser.email);
            userId = existingUser.id;
            username = existingUser.username;
            role = existingUser.role;
        }

        const sessionToken = await createSession({ id: userId, username, role: role as any });

        const response = NextResponse.redirect(new URL('/dashboard', req.url));
        response.cookies.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(new URL('/login?error=An error occurred', req.url));
    }
}
