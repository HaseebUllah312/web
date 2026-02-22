import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifyOTP } from '@/app/lib/otp-storage';
import { hashPassword, generateSalt } from '@/app/lib/password';

export async function POST(req: Request) {
    try {
        const { email, otp, newPassword, confirmPassword } = await req.json();

        if (!email || !otp || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { error: 'All fields are required.' },
                { status: 400 }
            );
        }

        // Validate password length
        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters.' },
                { status: 400 }
            );
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { error: 'Passwords do not match.' },
                { status: 400 }
            );
        }

        // Verify OTP
        const otpResult = verifyOTP(email.toLowerCase().trim(), otp);

        if (!otpResult.valid) {
            return NextResponse.json(
                { error: otpResult.message || 'Invalid or expired reset code.' },
                { status: 400 }
            );
        }

        // Hash new password
        const salt = generateSalt();
        const hash = hashPassword(newPassword, salt);

        // Update password in database
        const { error: updateError } = await supabase
            .from('users')
            .update({
                password_hash: hash,
                salt: salt,
                updated_at: new Date().toISOString()
            })
            .eq('email', email.toLowerCase().trim());

        if (updateError) {
            console.error('Password update error:', updateError);
            return NextResponse.json(
                { error: 'Failed to update password. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Password reset successfully! You can now login with your new password.'
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
