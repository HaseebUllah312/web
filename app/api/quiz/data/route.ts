import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Max questions Gemini can reliably generate in one call without truncation or quality loss
// 10 is the sweet spot for professional, long-explanation MCQs.
const MAX_PER_CALL = 10;

import { getSubjectByCode } from '@/data/subjects';

// GET /api/quiz/data?subject=CS101&type=midterm&count=20
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const subject = searchParams.get('subject')?.toUpperCase();
    const type = searchParams.get('type') || 'midterm';
    const lec = searchParams.get('lec');
    const topicParam = searchParams.get('topic');
    const count = Math.min(parseInt(searchParams.get('count') || '20'), 50); // cap at 50

    if (!subject) {
        return NextResponse.json({ error: 'Subject code required' }, { status: 400 });
    }

    const subjectData = getSubjectByCode(subject);
    const subjectName = subjectData ? subjectData.name : subject;

    console.log(`Quiz Request: ${subject} (${subjectName}) | ${type} | Count: ${count}`);

    // 1. Try Cache (check multiple case variations)
    const quizDir = path.join(process.cwd(), 'data', 'quizzes');
    const variations = [`${subject}.json`, `${subject.toLowerCase()}.json`].filter((v, i, a) => a.indexOf(v) === i);

    let filePath = null;
    for (const v of variations) {
        const p = path.join(quizDir, v);
        if (fs.existsSync(p)) {
            filePath = p;
            break;
        }
    }

    if (filePath && !lec && !topicParam) {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const examTerm = type === 'midterm' ? 'midterm' : 'final';

            // Check if any questions match the term
            const matchingQs = (data.topics || []).flatMap((t: any) => {
                const isMatch = t.term?.toLowerCase().includes(examTerm) ||
                    (data.term && data.term.toLowerCase().includes(examTerm));
                return isMatch ? (t.questions || []) : [];
            });

            // If we have questions, return the data even if it's less than requested count
            // This prioritizes local data as requested.
            if (matchingQs.length > 0) {
                console.log(`Using cache for ${subject} (${matchingQs.length} questions found)`);
                return NextResponse.json(data);
            }
            console.log(`Cache has no questions for ${type}. Falling back to AI.`);
        } catch (err) {
            console.error('Cache read error:', err);
        }
    }

    // 2. Generate via Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'No quiz data available for this subject.' }, { status: 404 });
    }

    const examLabel = type === 'midterm' ? 'Midterm' : 'Final Term';
    const batches: number[] = [];
    let remaining = count;
    while (remaining > 0) {
        const batchSize = Math.min(remaining, MAX_PER_CALL);
        batches.push(batchSize);
        remaining -= batchSize;
    }

    try {
        console.log(`Generating ${count} MCQs for ${subjectName} in ${batches.length} batches...`);

        // Parallel batches with individual error handling
        const batchPromises = batches.map((batchCount, idx) =>
            generateWithRetry(apiKey, subject, subjectName, examLabel, batchCount, idx, batches.length, lec, topicParam)
        );

        const batchResults = await Promise.all(batchPromises);

        // Merge results
        const allTopics: any[] = [];
        let totalQsFound = 0;

        for (const result of batchResults) {
            if (result && result.topics) {
                for (const topic of result.topics) {
                    const existing = allTopics.find(t => t.name === topic.name);
                    const questions = topic.questions || [];
                    totalQsFound += questions.length;

                    if (existing) {
                        existing.questions.push(...questions);
                    } else {
                        allTopics.push({ ...topic });
                    }
                }
            }
        }

        if (totalQsFound === 0) {
            console.error(`AI failed all batches for ${subject} (${subjectName})`);
            return NextResponse.json({ error: 'AI generation failed. The subject might be too specialized or safety filters blocked the request.' }, { status: 500 });
        }

        console.log(`Successfully generated ${totalQsFound} questions for ${subject}`);
        return NextResponse.json({
            subject,
            term: examLabel,
            topics: allTopics,
        });

    } catch (err: any) {
        console.error('Final merge error:', err);
        return NextResponse.json({ error: 'System error during quiz generation.' }, { status: 500 });
    }
}

async function generateWithRetry(
    apiKey: string, subject: string, subjectName: string, examLabel: string,
    batchCount: number, batchIndex: number, totalBatches: number,
    lec?: string | null, topicParam?: string | null,
    retries = 2
): Promise<any> {
    for (let i = 0; i <= retries; i++) {
        try {
            const result = await generateBatch(apiKey, subject, subjectName, examLabel, batchCount, batchIndex, totalBatches, lec, topicParam);
            if (result && result.topics && result.topics.length > 0) return result;
            console.warn(`Batch ${batchIndex + 1} for ${subject} attempt ${i + 1} failed, retry remaining: ${retries - i}`);
        } catch (e) {
            console.warn(`Batch ${batchIndex + 1} for ${subject} exception, retry remaining: ${retries - i}`);
        }
    }
    return null;
}

async function generateBatch(
    apiKey: string,
    subject: string,
    subjectName: string,
    examLabel: string,
    batchCount: number,
    batchIndex: number,
    totalBatches: number,
    lec?: string | null,
    topicParam?: string | null
): Promise<any> {
    const easyCount = Math.floor(batchCount * 0.20);
    const mediumCount = Math.floor(batchCount * 0.50);
    const hardCount = batchCount - easyCount - mediumCount;

    let focusText = `for the **${examLabel}** exam`;
    if (topicParam) focusText = `specifically for the topic: **"${topicParam}"**`;
    else if (lec) focusText = `strictly from VU lectures: **${lec}**`;

    const topicHint = totalBatches > 1
        ? `This is batch ${batchIndex + 1} of ${totalBatches}. Cover DIFFERENT sub-topics than previous batches.`
        : '';

    const prompt = `You are a Senior Academic Content Designer specializing in university examinations for the **Virtual University of Pakistan (VU)**.

Task: Generate exactly ${batchCount} professional MCQs for the following VU course:
Course Code: ${subject}
Course Name: ${subjectName}
Exam Focus: ${examLabel}
Context: ${focusText}
${topicHint}

## Instructions:
1. Use the official **Virtual University of Pakistan (VU)** curriculum and handout context where applicable.
2. Academic language (formal, precise English).
3. Logical distractors (misconceptions, not trivial).
4. Professional explanations (Scholarly paragraph explaining why the answer is correct and why others are wrong).
5. Difficulty: ${easyCount} Easy, ${mediumCount} Medium, ${hardCount} Hard.

Return ONLY a JSON object with this exact structure:
{
  "subject": "${subject}",
  "term": "${examLabel}",
  "topics": [
    {
      "name": "Academic Topic Name",
      "questions": [
        {
          "question": "Logically structured question?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct": 0,
          "explanation": "Detailed explanation..."
        }
      ]
    }
  ]
}`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                    responseMimeType: 'application/json',
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                ],
            }),
        }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    try {
        return JSON.parse(rawText);
    } catch {
        // If JSON.parse fails, try to extract JSON from the text
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try { return JSON.parse(jsonMatch[0]); } catch { }
        }
        return null;
    }
}
