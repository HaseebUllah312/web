import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';

export async function GET() {
    const cookie = (await cookies()).get('session')?.value;
    const session = cookie ? await verifySession(cookie) : null;

    if (!session) {
        return NextResponse.json({ user: null });
    }

    return NextResponse.json({
        user: {
            id: session.id,
            username: session.username,
            role: session.role
        }
    });
}
