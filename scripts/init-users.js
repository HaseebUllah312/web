const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- Quick Hash Utility (Same logic as auth.ts to ensure compatibility) ---
function generateSalt(length = 16) {
    return crypto.randomBytes(length).toString('hex');
}

function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

// Ensure data directory exists
const dataDir = path.dirname(usersFilePath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Check if users.json already exists
if (!fs.existsSync(usersFilePath)) {
    console.log('Initializing users.json with default owner...');

    const salt = generateSalt();
    const hash = hashPassword('admin123', salt); // Default password

    const defaultOwner = {
        id: crypto.randomUUID(),
        username: 'admin',
        passwordHash: hash,
        salt: salt,
        role: 'owner',
        createdAt: new Date().toISOString()
    };

    fs.writeFileSync(usersFilePath, JSON.stringify([defaultOwner], null, 4));
    console.log('Done! Default credentials: admin / admin123');
} else {
    console.log('users.json already exists. Skipping initialization.');
}
