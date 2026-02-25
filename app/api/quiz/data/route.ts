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
            const examTerm = type === 'midterm' ? 'midterm' : 'final';

            // Filter questions by term
            const matchingQs = (data.topics || []).flatMap((t: any) => {
                const isMatch = t.term?.toLowerCase().includes(examTerm) ||
                    (data.term && data.term.toLowerCase().includes(examTerm));
                return isMatch ? (t.questions || []) : [];
            });

            // If we have enough questions in cache, use them. 
            // Otherwise, let AI generate fresh ones to meet the requested count.
            if (matchingQs.length >= count) {
                return NextResponse.json(data);
            }
            console.log(`Cache for ${subject} ${type} has only ${matchingQs.length} questions. Generating ${count} fresh MCQs via AI.`);
        } catch (err) {
            console.error('Error reading quiz cache:', err);
        }
    }

    // 2. Generate via Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'No quiz data available for this subject.' }, { status: 404 });
    }

    const examLabel = type === 'midterm' ? 'Midterm' : 'Final Term';

    // Split into batches of MAX_PER_CALL to avoid token limits
    const batches: number[] = [];
    let remaining = count;
    while (remaining > 0) {
        const batchSize = Math.min(remaining, MAX_PER_CALL);
        batches.push(batchSize);
        remaining -= batchSize;
    }

    try {
        // Run all batches in parallel
        const batchResults = await Promise.all(
            batches.map((batchCount, batchIndex) =>
                generateBatch(apiKey, subject, examLabel, batchCount, batchIndex, batches.length)
            )
        );

        // Merge results
        const allTopics: any[] = [];
        for (const result of batchResults) {
            if (result && result.topics) {
                for (const topic of result.topics) {
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
    const easyCount = Math.floor(batchCount * 0.20); // Fewer easy, more deep questions
    const mediumCount = Math.floor(batchCount * 0.50);
    const hardCount = batchCount - easyCount - mediumCount;

    const topicHint = totalBatches > 1
        ? `This is batch ${batchIndex + 1} of ${totalBatches}. Cover DIFFERENT topics than other batches — focus on ${batchIndex === 0 ? 'fundamental/early' : batchIndex === 1 ? 'intermediate/middle' : 'advanced/late'} topics of the ${examLabel} syllabus.`
        : '';

    const prompt = `You are an expert VU (Virtual University of Pakistan) exam designer specializing in "Concept Clearing" questions.

Generate exactly ${batchCount} high-quality MCQs for VU subject **${subject}** for the **${examLabel}** exam.
${topicHint}

## Core Objective: 
Every question must lead to a "Perfect" understanding of the concept. DO NOT generate trivial or simple lookup questions.

## Requirements:

### Conceptual Depth:
- Focus on logic, architecture, and "How it works" rather than simple "What is X" questions.
- Distractors (wrong options) MUST be plausible misconceptions that students often have.

### Difficulty (strictly follow):
- Easy (basic conceptual understanding): ${easyCount} questions
- Medium (requires deep understanding): ${mediumCount} questions
- Hard (requires analysis/application): ${hardCount} questions

### Explanation Style (CRITICAL for learning):
Each explanation MUST be a "mini-lesson":
1. Start with WHY the correct answer is logically right.
2. Explicitly explain WHY the significant wrong options are incorrect to clear common confusion.
3. Keep it educational and encouraging. Use 3-4 clear sentences.

### Quality Standards:
- Use standard VU terminology.
- No repeated questions.
- Ensure the JSON format is perfect.

Return ONLY valid JSON:
{
  "subject": "${subject}",
  "term": "${examLabel}",
  "topics": [
    {
      "name": "Topic Name",
      "term": "${examLabel}",
      "questions": [
        {
          "question": "Deep conceptual question?",
          "options": ["Correct Option", "Plausible Wrong A", "Plausible Wrong B", "Plausible Wrong C"],
          "correct": 0,
          "explanation": "This is correct because... On the other hand, [Option B] is a common mistake because... but in reality..."
        }
      ]
    }
  ]
}

Generate exactly ${batchCount} distinct, high-quality questions.`;

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
