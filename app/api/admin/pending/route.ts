import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const pendingFilePath = path.join(process.cwd(), 'data/pending_uploads.json');
const subjectsFilePath = path.join(process.cwd(), 'data/subjects.json');

// Helper to read JSON
function readJson(filePath: string) {
    if (!fs.existsSync(filePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        return [];
    }
}

// GET: List all pending uploads
export async function GET() {
    const pending = readJson(pendingFilePath);
    return NextResponse.json(pending);
}

// POST: Approve an upload (Move to subjects.json)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id } = body;

        let pending = readJson(pendingFilePath);
        const itemIndex = pending.findIndex((p: any) => p.id === id);

        if (itemIndex === -1) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const item = pending[itemIndex];

        // 1. Add to subjects.json
        let subjects = readJson(subjectsFilePath);
        const subjectIndex = subjects.findIndex((s: any) => s.code === item.code);

        if (subjectIndex !== -1) {
            if (!subjects[subjectIndex].resources) {
                subjects[subjectIndex].resources = [];
            }
            // Check for duplicate before adding
            const exists = subjects[subjectIndex].resources.some((r: any) => r.link === item.link);
            if (!exists) {
                subjects[subjectIndex].resources.push({
                    title: item.title,
                    type: item.type,
                    link: item.link
                });
            }
        } else {
            // Optional: Create subject if it doesn't exist? For now, we only add to existing subjects.
            // You might want to handle this case differently.
        }

        // 2. Remove from pending.json
        pending.splice(itemIndex, 1);

        // 3. Save both files
        fs.writeFileSync(subjectsFilePath, JSON.stringify(subjects, null, 4));
        fs.writeFileSync(pendingFilePath, JSON.stringify(pending, null, 4));

        return NextResponse.json({ success: true, message: 'Approved and published' });

    } catch (error) {
        console.error('Approve error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Reject an upload (Remove from pending.json)
export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { id } = body;

        let pending = readJson(pendingFilePath);
        const newPending = pending.filter((p: any) => p.id !== id);

        fs.writeFileSync(pendingFilePath, JSON.stringify(newPending, null, 4));

        return NextResponse.json({ success: true, message: 'Rejected and removed' });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
