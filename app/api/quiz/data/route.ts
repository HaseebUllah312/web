import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const subject = searchParams.get('subject');

    if (!subject) {
        return NextResponse.json({ error: 'Subject code required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'quizzes', `${subject}.json`);

    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(fileContent);
            return NextResponse.json(data);
        } else {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
