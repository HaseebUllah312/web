import * as fs from 'fs';
import * as path from 'path';

interface OTPRecord {
    otp: string;
    email: string;
    username: string;
    expiresAt: string;
    attempts: number;
}

const OTP_FILE_PATH = path.join(process.cwd(), 'data', 'otp-storage.json');

// Ensure data directory exists
function ensureStorageFile() {
    const dir = path.dirname(OTP_FILE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(OTP_FILE_PATH, JSON.stringify({}));
    }
    if (!fs.existsSync(OTP_FILE_PATH)) {
        fs.writeFileSync(OTP_FILE_PATH, JSON.stringify({}));
    }
}

function readStorage(): Record<string, OTPRecord> {
    try {
        ensureStorageFile();
        const data = fs.readFileSync(OTP_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading OTP storage:', error);
        return {};
    }
}

function writeStorage(storage: Record<string, OTPRecord>) {
    try {
        ensureStorageFile();
        fs.writeFileSync(OTP_FILE_PATH, JSON.stringify(storage, null, 2));
    } catch (error) {
        console.error('Error writing OTP storage:', error);
    }
}

export function storeOTP(email: string, username: string, otp: string, expiresAt: Date) {
    const normalizedEmail = email.toLowerCase().trim();
    const storage = readStorage();
    
    storage[normalizedEmail] = {
        otp,
        email: normalizedEmail,
        username,
        expiresAt: expiresAt.toISOString(),
        attempts: 0,
    };
    
    writeStorage(storage);
    console.log(`OTP stored for ${normalizedEmail}`);
}

export function verifyOTP(email: string, providedOTP: string): { valid: boolean; message: string } {
    const normalizedEmail = email.toLowerCase().trim();
    const storage = readStorage();
    const record = storage[normalizedEmail];

    if (!record) {
        return { valid: false, message: 'OTP not found. Please request a new verification code.' };
    }

    if (new Date() > new Date(record.expiresAt)) {
        delete storage[normalizedEmail];
        writeStorage(storage);
        return { valid: false, message: 'OTP has expired. Please request a new verification code.' };
    }

    if (record.attempts >= 3) {
        delete storage[normalizedEmail];
        writeStorage(storage);
        return { valid: false, message: 'Too many incorrect attempts. Please request a new verification code.' };
    }

    if (record.otp !== providedOTP) {
        record.attempts++;
        writeStorage(storage);
        return { valid: false, message: `Incorrect OTP. ${3 - record.attempts} attempts remaining.` };
    }

    delete storage[normalizedEmail];
    writeStorage(storage);
    return { valid: true, message: 'OTP verified successfully.' };
}

export function getOTPRecord(email: string): OTPRecord | undefined {
    const normalizedEmail = email.toLowerCase().trim();
    const storage = readStorage();
    return storage[normalizedEmail];
}

export function clearOTP(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const storage = readStorage();
    delete storage[normalizedEmail];
    writeStorage(storage);
}
