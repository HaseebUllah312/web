import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Max questions Gemini can reliably generate in one call with good quality
const MAX_PER_CALL = 20;

// GET /api/quiz/data?subject=CS101&type=midterm&count=20
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const subject = searchParams.get('subject')?.toUpperCase();
    const type = searchParams.get('type') || 'midterm';
    const count = Math.min(parseInt(searchParams.get('count') || '20'), 50); // cap at 50

    if (!subject) {
        return NextResponse.json({ error: 'Subject code required' }, { status: 400 });
    }

    // 1. Try local JSON file first
    const filePath = path.join(process.cwd(), 'data', 'quizzes', `${subject}.json`);
    if (fs.existsSync(filePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            return NextResponse.json(data);
        } catch { }
    }

    // 2. Generate via Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'No quiz data available for this subject.' }, { status: 404 });
    }

    const examLabel = type === 'midterm' ? 'Midterm' : 'Final Term';

    // Split into batches of MAX_PER_CALL to avoid token limits
    // e.g. count=50 → batches of [20, 20, 10]
    const batches: number[] = [];
    let remaining = count;
    while (remaining > 0) {
        const batchSize = Math.min(remaining, MAX_PER_CALL);
        batches.push(batchSize);
        remaining -= batchSize;
    }

    try {
        // Run all batches in parallel for speed
        const batchResults = await Promise.all(
            batches.map((batchCount, batchIndex) =>
                generateBatch(apiKey, subject, examLabel, batchCount, batchIndex, batches.length)
            )
        );

        // Merge all topic arrays from all batches
        const allTopics: any[] = [];
        for (const result of batchResults) {
            if (result && result.topics) {
                for (const topic of result.topics) {
                    // Merge into existing topic if name matches, else add new
                    const existing = allTopics.find(t => t.name === topic.name);
                    if (existing) {
                        existing.questions.push(...(topic.questions || []));
                    } else {
                        allTopics.push({ ...topic });
                    }
                }
            }
        }

        if (allTopics.length === 0) {
            return NextResponse.json({ error: 'AI failed to generate questions. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({
            subject,
            term: examLabel,
            topics: allTopics,
        });

    } catch (err: any) {
        console.error('Quiz generation error:', err);
        return NextResponse.json({ error: 'Failed to generate quiz. Please try again.' }, { status: 500 });
    }
}

async function generateBatch(
    apiKey: string,
    subject: string,
    examLabel: string,
    batchCount: number,
    batchIndex: number,
    totalBatches: number
): Promise<any> {
    const easyCount = Math.floor(batchCount * 0.30);
    const mediumCount = Math.floor(batchCount * 0.45);
    const hardCount = batchCount - easyCount - mediumCount;

    // For multiple batches, tell AI to cover different topics per batch
    const topicHint = totalBatches > 1
        ? `This is batch ${batchIndex + 1} of ${totalBatches}. Cover DIFFERENT topics than other batches — focus on ${batchIndex === 0 ? 'fundamental/early' : batchIndex === 1 ? 'intermediate/middle' : 'advanced/late'} topics of the ${examLabel} syllabus.`
        : '';

    const prompt = `You are an expert VU (Virtual University of Pakistan) exam question designer.

Generate exactly ${batchCount} MCQs for VU subject **${subject}** for the **${examLabel}** exam.
${topicHint}

## Requirements:

### Difficulty (strictly follow):
- Easy (basic recall/definition): ${easyCount} questions
- Medium (requires understanding): ${mediumCount} questions
- Hard (requires analysis/application): ${hardCount} questions

### Question Types:
- 40% Conceptual (test understanding, not memorization)
- 30% Application-based (apply concept to a scenario)
- 30% Past-paper style (common VU exam pattern)

### Explanation Rules (CRITICAL):
Each explanation MUST:
- Explain WHY the correct answer is right (with the actual concept reasoning)
- Mention why the popular wrong options are incorrect
- Be educational — a student reading it should learn the concept
- Be 2-3 sentences, simple clear English

### Quality Rules:
- NO trivial questions — every question tests real understanding
- All 4 options must be plausible (wrong options = common student mistakes)
- NO repeated or similar questions within this batch
- Use VU handout terminology and VU exam style
- Be genuinely useful for exam preparation

Return ONLY valid JSON (no markdown, no extra text, no code blocks):
{
  "subject": "${subject}",
  "term": "${examLabel}",
  "topics": [
    {
      "name": "Topic Name",
      "term": "${examLabel}",
      "questions": [
        {
          "question": "Exam-quality question?",
          "options": ["Plausible A", "Plausible B", "Plausible C", "Plausible D"],
          "correct": 0,
          "explanation": "A is correct because [concept reasoning]. B/C are wrong because [misconception reason]. This matters because [relevance]."
        }
      ]
    }
  ]
}

Generate exactly ${batchCount} questions (${easyCount} easy + ${mediumCount} medium + ${hardCount} hard) across 3-4 topics.`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.65,
                    maxOutputTokens: 8192, // Max for flash — easily handles 20 questions
                    responseMimeType: 'application/json',
                    topP: 0.9,
                },
            }),
        }
    );

    if (!response.ok) {
        console.error(`Batch ${batchIndex + 1} Gemini error:`, response.status);
        return null;
    }

    const geminiData = await response.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) return null;

    try {
        return JSON.parse(rawText);
    } catch {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try { return JSON.parse(jsonMatch[0]); } catch { }
        }
        return null;
    }
}
