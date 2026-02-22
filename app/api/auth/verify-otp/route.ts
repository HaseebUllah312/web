import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { hashPassword, generateSalt } from '@/app/lib/password';
import { verifyOTP, clearOTP } from '@/app/lib/otp-storage';
import { sendEmail, getWelcomeEmailTemplate } from '@/app/lib/email';

export async function POST(req: Request) {
    try {
        const { email, username, password, otp } = await req.json();

        if (!email || !username || !password || !otp) {
            return NextResponse.json(
                { error: 'Missing required fields.' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long.' },
                { status: 400 }
            );
        }

        // Verify OTP
        const otpVerification = await verifyOTP(email, otp);
        if (!otpVerification.valid) {
            return NextResponse.json(
                { error: otpVerification.message },
                { status: 400 }
            );
        }

        // Check if username already exists (double-check)
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', username.trim())
            .maybeSingle();

        if (existingUser) {
            await clearOTP(email);
            return NextResponse.json(
                { error: 'Username already taken.' },
                { status: 409 }
            );
        }

        // Check if email is already registered (double-check)
        const { data: existingEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();

        if (existingEmail) {
            await clearOTP(email);
            return NextResponse.json(
                { error: 'Email already registered.' },
                { status: 409 }
            );
        }

        // Create new user
        const salt = generateSalt();
        const passwordHash = hashPassword(password, salt);
        const userId = crypto.randomUUID();

        const { error: insertError, data: insertData } = await supabase.from('users').insert({
            id: userId,
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password_hash: passwordHash,
            salt,
            role: 'student',
            provider: 'local',
            email_notifications_enabled: true,
            is_email_verified: true,
            created_at: new Date().toISOString(),
        });

        if (insertError) {
            console.error('Supabase insert error:', insertError);
            await clearOTP(email);

            // Check if it's a column missing error
            if (insertError.message?.includes('email') || insertError.message?.includes('column')) {
                return NextResponse.json(
                    { error: 'Database schema error. Please contact administrator. Missing column: ' + (insertError.message || 'email') },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { error: 'Failed to create account: ' + (insertError.message || 'Unknown error') },
                { status: 500 }
            );
        }

        // Send welcome email
        const html = getWelcomeEmailTemplate(username, email);
        await sendEmail(
            email,
            'Welcome to VU Academic Hub! 🎓',
            html
        );

        // Clear OTP after successful registration
        await clearOTP(email);

        return NextResponse.json({
            success: true,
            message: 'Registration successful! Please login with your credentials.',
            userId,
        });

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error. Please try again.' },
            { status: 500 }
        );
    }
}
