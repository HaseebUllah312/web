import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define paths
const uploadDir = path.join(process.cwd(), 'public/uploads');
const pendingFilePath = path.join(process.cwd(), 'data/pending_uploads.json');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const code = formData.get('code') as string;
        const title = formData.get('title') as string;
        const type = formData.get('type') as string;
        const submittedBy = formData.get('submittedBy') as string;
        const file = formData.get('file') as File;

        // Basic validation
        if (!code || !title || !type || !file) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${safeName}`;
        const filePath = path.join(uploadDir, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        fs.writeFileSync(filePath, buffer);

        // Public URL for the file
        const fileUrl = `/uploads/${filename}`;

        // Create new upload item
        const newItem = {
            id: timestamp,
            code: code.toUpperCase(),
            title,
            type,
            link: fileUrl, // Now points to local file
            submittedBy: submittedBy || 'Anonymous',
            date: new Date().toISOString().split('T')[0]
        };

        // Read existing pending uploads
        let pendingUploads = [];
        if (fs.existsSync(pendingFilePath)) {
            const fileContent = fs.readFileSync(pendingFilePath, 'utf8');
            try {
                pendingUploads = JSON.parse(fileContent);
            } catch (e) {
                pendingUploads = [];
            }
        }

        // Add to list
        pendingUploads.push(newItem);

        // Save back to file
        fs.writeFileSync(pendingFilePath, JSON.stringify(pendingUploads, null, 4));

        return NextResponse.json({ success: true, message: 'File uploaded and submitted for moderation' });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
