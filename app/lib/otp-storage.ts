// In-memory OTP store — works on Vercel serverless (no fs/disk writes)
// OTPs are short-lived (10 min) so in-memory is perfectly safe.

interface OTPRecord {
    otp: string;
    email: string;
    username: string;
    expiresAt: string;
    attempts: number;
}

const otpStore = new Map<string, OTPRecord>();

export function storeOTP(email: string, username: string, otp: string, expiresAt: Date) {
    const normalizedEmail = email.toLowerCase().trim();
    otpStore.set(normalizedEmail, {
        otp,
        email: normalizedEmail,
        username,
        expiresAt: expiresAt.toISOString(),
        attempts: 0,
    });
    console.log(`OTP stored for ${normalizedEmail}`);
}

export function verifyOTP(email: string, providedOTP: string): { valid: boolean; message: string } {
    const normalizedEmail = email.toLowerCase().trim();
    const record = otpStore.get(normalizedEmail);

    if (!record) {
        return { valid: false, message: 'OTP not found. Please request a new verification code.' };
    }

    if (new Date() > new Date(record.expiresAt)) {
        otpStore.delete(normalizedEmail);
        return { valid: false, message: 'OTP has expired. Please request a new verification code.' };
    }

    if (record.attempts >= 3) {
        otpStore.delete(normalizedEmail);
        return { valid: false, message: 'Too many incorrect attempts. Please request a new verification code.' };
    }

    if (record.otp !== providedOTP) {
        record.attempts++;
        return { valid: false, message: `Incorrect OTP. ${3 - record.attempts} attempts remaining.` };
    }

    otpStore.delete(normalizedEmail);
    return { valid: true, message: 'OTP verified successfully.' };
}

export function getOTPRecord(email: string): OTPRecord | undefined {
    const normalizedEmail = email.toLowerCase().trim();
    return otpStore.get(normalizedEmail);
}

export function clearOTP(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    otpStore.delete(normalizedEmail);
}
