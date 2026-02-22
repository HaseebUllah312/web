import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'subjects.json');

// GET: List all subjects
export async function GET() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        const subjects = JSON.parse(data);
        return NextResponse.json(subjects);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to load subjects' }, { status: 500 });
    }
}

// POST: Add new subject
export async function POST(req: Request) {
    try {
        const { code } = await req.json();
        if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

        const upperCode = code.toUpperCase();
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        let subjects = JSON.parse(data);

        if (subjects.includes(upperCode)) {
            return NextResponse.json({ error: 'Subject already exists' }, { status: 409 });
        }

        subjects.push(upperCode);
        subjects.sort();

        await fs.writeFile(DATA_FILE, JSON.stringify(subjects, null, 4));
        return NextResponse.json({ success: true, subjects });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to save subject' }, { status: 500 });
    }
}
