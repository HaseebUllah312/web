import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { createSession } from '@/app/lib/session';
import { verifyPassword } from '@/app/lib/password';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();
        const identifier = username?.trim();
        console.log('Login attempt for:', identifier);

        if (!identifier || !password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Look up user by username OR email (case-insensitive)
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .or(`username.ilike.${identifier},email.ilike.${identifier}`)
            .maybeSingle();

        if (fetchError) {
            console.error('Database fetch error during login:', fetchError);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        if (!user) {
            console.log('User not found for identifier:', identifier);
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (!user.password_hash) {
            return NextResponse.json(
                { error: 'This account uses Google Sign-In. Please use the Google button.' },
                { status: 401 }
            );
        }

        const isValid = verifyPassword(password, user.password_hash, user.salt);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const sessionToken = await createSession({
            id: user.id,
            username: user.username,
            role: user.role,
        });

        const response = NextResponse.json({ success: true, role: user.role });
        response.cookies.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
