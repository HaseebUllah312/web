import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the path to the pending questions file
const DATA_FILE = path.join(process.cwd(), 'data', 'pending_questions.json');

// Ensure the data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { subject, question, options, correct, explanation } = body;

        // Validation
        if (!subject || !question || options?.length < 2 || correct === undefined || !explanation) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Read existing data
        let submissions = [];
        if (fs.existsSync(DATA_FILE)) {
            const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
            try {
                submissions = JSON.parse(fileContent);
            } catch (e) {
                // If file is empty or invalid, start fresh
                submissions = [];
            }
        }

        // Create new entry
        const newSubmission = {
            id: Date.now().toString(),
            submittedAt: new Date().toISOString(),
            status: 'pending',
            subject,
            question,
            options,
            correct,
            explanation
        };

        // Add to list and save
        submissions.push(newSubmission);
        fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));

        return NextResponse.json({ success: true, message: 'Question submitted for review' });

    } catch (error) {
        console.error('Error submitting question:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
