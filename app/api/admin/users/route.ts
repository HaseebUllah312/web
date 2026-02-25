import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/app/lib/supabase';
import { verifySession } from '@/app/lib/session';

const getCurrentUser = async () => {
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) return null;
    return await verifySession(cookie);
}

export async function GET() {
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, email, role, provider, created_at, is_email_verified')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase fetch users error:', error);
            return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
        }

        return NextResponse.json(users);
    } catch (error) {
        console.error('Admin users GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const currentUser = await getCurrentUser();

    // Only Owner can promote/demote
    if (!currentUser || currentUser.role !== 'owner') {
        return NextResponse.json({ error: 'Forbidden: Only Owner can manage roles' }, { status: 403 });
    }

    try {
        const { userId, newRole } = await req.json();

        // Validate role
        if (!['admin', 'student'].includes(newRole)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Update in Supabase
        const { error: updateError } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', userId)
            // Safety: cannot demote an owner
            .neq('role', 'owner');

        if (updateError) {
            console.error('Supabase update role error:', updateError);
            return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: `User role updated to ${newRole}` });

    } catch (error) {
        console.error('Update role error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
