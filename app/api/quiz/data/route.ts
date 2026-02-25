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
    const lec = searchParams.get('lec');
    const topicParam = searchParams.get('topic');
    const count = Math.min(parseInt(searchParams.get('count') || '20'), 50); // cap at 50

    if (!subject) {
        return NextResponse.json({ error: 'Subject code required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'quizzes', `${subject}.json`);
    // Only use cache for general exam TERM requests (midterm/final)
    // For specific lectures or topics, always use AI for precision
    if (fs.existsSync(filePath) && !lec && !topicParam) {
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
    const focusLabel = topicParam ? `Topic: ${topicParam}` : lec ? `Lectures: ${lec}` : examLabel;

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
                generateBatch(apiKey, subject, examLabel, batchCount, batchIndex, batches.length, lec, topicParam)
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
    totalBatches: number,
    lec?: string | null,
    topicParam?: string | null
): Promise<any> {
    const easyCount = Math.floor(batchCount * 0.20); // Fewer easy, more deep questions
    const mediumCount = Math.floor(batchCount * 0.50);
    const hardCount = batchCount - easyCount - mediumCount;

    let focusText = `for the **${examLabel}** exam`;
    if (topicParam) focusText = `specifically for the topic: **"${topicParam}"**`;
    else if (lec) focusText = `strictly from VU lectures: **${lec}**`;

    const topicHint = totalBatches > 1
        ? `This is batch ${batchIndex + 1} of ${totalBatches}. Cover DIFFERENT sub-topics than other batches.`
        : '';

    const prompt = `You are a Senior Academic Content Designer specializing in high-stakes university examinations (VU style).

Generate exactly ${batchCount} professional, high-quality MCQs for subject **${subject}** ${focusText}.
${topicHint}

## Core Directive:
Produce content that is academically rigorous, logically sound, and perfectly formatted. Avoid all triviality.

## Quality Standards:

### 1. Academic Rigor & Tone:
- Use formal, precise university-level English.
- Focus on conceptual logic, "how/why" mechanisms, and theoretical frameworks.
- For technical subjects, include specific terminology and (where applicable) markdown-formatted code snippets or mathematical expressions.

### 2. Option Neutrality & Balance:
- Distractors (wrong options) must be highly plausible misconceptions or related but incorrect concepts.
- Avoid "None of the above" or "All of the above" unless absolutely necessary.
- **Length Neutrality**: Ensure all 4 options are approximately the same length. Avoid making the correct answer significantly longer or more detailed than distractors.
- **Logical Ordering**: If options are numerical or chronological, list them in ascending/descending order.

### 3. Difficulty Mapping (Strict):
- Easy (Conceptual Foundation): ${easyCount} questions
- Medium (Analytical Understanding): ${mediumCount} questions
- Hard (Complex Application/Synthesis): ${hardCount} questions

### 4. Professional Explanations (The "Mini-Lesson"):
Each explanation must be a self-contained scholarly paragraph:
- Start with the definitive logical proof of the correct answer.
- Explicitly deconstruct the main distractors to clarify common confusion.
- Use professional terms. Format important concepts in **bold**.

### 5. Markdown Precision:
- Use \`inline code\` for variables, functions, or small technical terms.
- Use fenced code blocks (\`\`\`language) for any code snippets.
- Use high-quality markdown for emphasis.

Return ONLY valid JSON (no preamble, no markdown formatting outside the JSON):
{
  "subject": "${subject}",
  "term": "${examLabel}",
  "topics": [
    {
      "name": "Academic Topic Name",
      "term": "${examLabel}",
      "questions": [
        {
          "question": "Logically structured, professional question?",
          "options": ["Balanced Option A", "Balanced Option B", "Balanced Option C", "Balanced Option D"],
          "correct": 0,
          "explanation": "The correct answer is [Option A] because... Traditionally, students confuse this with [Option B], however..."
        }
      ]
    }
  ]
}

Ensure exactly ${batchCount} distinct, exam-tier questions.`;

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
