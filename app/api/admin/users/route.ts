import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs';
import { verifySession } from '@/app/lib/session';

const usersFilePath = path.join(process.cwd(), 'data/users.json');

// Helper to get current user
async function getCurrentUser() {
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) return null;
    return await verifySession(cookie);
}

export async function GET() {
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!fs.existsSync(usersFilePath)) return NextResponse.json([]);

    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));

    // Return sanitized users
    const sanitizedUsers = users.map((u: any) => ({
        id: u.id,
        username: u.username,
        role: u.role,
        createdAt: u.createdAt
    }));

    return NextResponse.json(sanitizedUsers);
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

        const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
        const userIndex = users.findIndex((u: any) => u.id === userId);

        if (userIndex === -1) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent modifying other owners (if multiple exist in future) or self (though self-demotion might be valid, let's block for safety)
        if (users[userIndex].role === 'owner') {
            return NextResponse.json({ error: 'Cannot modify Owner role' }, { status: 403 });
        }

        users[userIndex].role = newRole;
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 4));

        return NextResponse.json({ success: true, message: `User role updated to ${newRole}` });

    } catch (error) {
        console.error('Update role error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
