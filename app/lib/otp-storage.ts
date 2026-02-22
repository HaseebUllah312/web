// OTP storage using Supabase — works correctly across all Vercel serverless instances.
// Uses an `otp_verifications` table with auto-cleanup via expiry checks.

import { supabase } from '@/app/lib/supabase';

export async function storeOTP(
    email: string,
    username: string,
    otp: string,
    expiresAt: Date
): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    // Upsert — replace any existing OTP for this email
    await supabase
        .from('otp_verifications')
        .upsert(
            {
                email: normalizedEmail,
                username,
                otp,
                expires_at: expiresAt.toISOString(),
                attempts: 0,
            },
            { onConflict: 'email' }
        );

    console.log(`OTP stored in Supabase for ${normalizedEmail}`);
}

export async function verifyOTP(
    email: string,
    providedOTP: string
): Promise<{ valid: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    const { data: record, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (error || !record) {
        return { valid: false, message: 'OTP not found. Please request a new verification code.' };
    }

    if (new Date() > new Date(record.expires_at)) {
        await supabase.from('otp_verifications').delete().eq('email', normalizedEmail);
        return { valid: false, message: 'OTP has expired. Please request a new verification code.' };
    }

    if (record.attempts >= 3) {
        await supabase.from('otp_verifications').delete().eq('email', normalizedEmail);
        return { valid: false, message: 'Too many incorrect attempts. Please request a new verification code.' };
    }

    if (record.otp !== providedOTP) {
        await supabase
            .from('otp_verifications')
            .update({ attempts: record.attempts + 1 })
            .eq('email', normalizedEmail);
        return { valid: false, message: `Incorrect OTP. ${3 - record.attempts - 1} attempts remaining.` };
    }

    // OTP is valid — delete it
    await supabase.from('otp_verifications').delete().eq('email', normalizedEmail);
    return { valid: true, message: 'OTP verified successfully.' };
}

export async function getOTPRecord(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const { data } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();
    return data ?? undefined;
}

export async function clearOTP(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    await supabase.from('otp_verifications').delete().eq('email', normalizedEmail);
}
