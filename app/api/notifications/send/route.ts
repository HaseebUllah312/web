import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { sendEmail, getAnnouncementEmailTemplate } from '@/app/lib/email';

export async function POST(req: Request) {
    try {
        // Verify admin authorization
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);

        // Verify admin user (you can implement proper JWT verification)
        // For now, we'll check if the session belongs to an admin
        const { data: sessionData } = await supabase
            .from('users')
            .select('role')
            .eq('id', token)
            .maybeSingle();

        if (!sessionData || sessionData.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { title, description, category, targetAudience } = await req.json();

        if (!title || !description || !category) {
            return NextResponse.json(
                { error: 'Title, description, and category are required.' },
                { status: 400 }
            );
        }

        // Get all users with notifications enabled
        const { data: users, error: fetchError } = await supabase
            .from('users')
            .select('id, username, email')
            .eq('email_notifications_enabled', true);

        if (fetchError) {
            console.error('Error fetching users:', fetchError);
            return NextResponse.json(
                { error: 'Failed to fetch users' },
                { status: 500 }
            );
        }

        if (!users || users.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No users with notifications enabled.',
                sentCount: 0,
            });
        }

        // Send emails to all users
        let successCount = 0;
        let failureCount = 0;

        for (const user of users) {
            try {
                const html = getAnnouncementEmailTemplate(title, description, category);
                const sent = await sendEmail(
                    user.email,
                    `VU Academic Hub - ${category}: ${title}`,
                    html
                );

                if (sent) {
                    successCount++;
                } else {
                    failureCount++;
                }
            } catch (error) {
                console.error(`Error sending email to ${user.email}:`, error);
                failureCount++;
            }
        }

        // Log notification event
        const { error: logError } = await supabase.from('notification_logs').insert({
            id: crypto.randomUUID(),
            title,
            description,
            category,
            sent_by: token,
            successful_sends: successCount,
            failed_sends: failureCount,
            total_users: users.length,
            created_at: new Date().toISOString(),
        });

        if (logError) {
            console.error('Error logging notification:', logError);
        }

        return NextResponse.json({
            success: true,
            message: `Notifications sent to ${successCount} users.`,
            sentCount: successCount,
            failureCount: failureCount,
            totalUsers: users.length,
        });

    } catch (error) {
        console.error('Send notification error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
