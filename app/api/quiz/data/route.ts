import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/quiz/data?subject=CS101&type=midterm&count=20
// Returns quiz questions: first tries local JSON, then generates via Gemini AI
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const subject = searchParams.get('subject')?.toUpperCase();
    const type = searchParams.get('type') || 'midterm';
    const count = parseInt(searchParams.get('count') || '20');

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
    const easyCount = Math.floor(count * 0.30); // 30% easy
    const mediumCount = Math.floor(count * 0.45); // 45% medium
    const hardCount = count - easyCount - mediumCount; // 25% hard

    const prompt = `You are an expert VU (Virtual University of Pakistan) exam question designer with 10+ years of experience creating VU past papers.

Your task: Generate exactly ${count} MCQs for the VU subject **${subject}** for the **${examLabel}** exam.

## Quality Requirements:

### 1. Question Types — Mix all of these:
- **Conceptual** (student must understand the concept, not just memorize): ~40%
- **Application-based** (apply the concept to a real scenario or example): ~30%
- **Past-paper style** (questions that commonly appear in actual VU ${examLabel} exams): ~30%

### 2. Difficulty Distribution (strictly follow this):
- **Easy** (basic recall / definition level): ${easyCount} questions
- **Medium** (requires real understanding of the concept): ${mediumCount} questions
- **Hard** (requires analysis, comparison, or application): ${hardCount} questions

### 3. Explanation Quality — THIS IS THE MOST IMPORTANT PART:
Each explanation MUST:
- Clearly explain **WHY the correct answer is right** with reasoning
- Briefly mention **why the other options are wrong** (common misconceptions)
- **Teach the underlying concept** — a student who reads it should understand the topic better
- Be 3-5 sentences, educational, and use simple clear English
- Reference the VU course context where relevant

### 4. Question Quality Rules (strictly follow):
- NO trivial or trick questions — every question must test real understanding
- All 4 options must be plausible (wrong options = common student misconceptions)
- Cover DIFFERENT topics — no two similar questions
- Use VU handout terminology and standard academic language
- Questions must genuinely help a student prepare for their VU ${examLabel} exam

### 5. Coverage:
Group questions into 4-6 main topics/chapters of ${subject}.
Ensure all major topics of the ${examLabel} syllabus are covered.

Return ONLY valid JSON (no markdown, no extra text):
{
  "subject": "${subject}",
  "term": "${examLabel}",
  "topics": [
    {
      "name": "Topic/Chapter Name",
      "term": "${examLabel}",
      "questions": [
        {
          "question": "Clear, well-worded question that tests genuine understanding?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct": 0,
          "explanation": "Option A is correct because [specific reason with concept explanation]. Options B/C/D are wrong because [brief reason addressing common misconceptions]. This concept is important because [why it matters in ${subject}]."
        }
      ]
    }
  ]
}

Generate exactly ${count} questions total (${easyCount} easy + ${mediumCount} medium + ${hardCount} hard) across 4-6 topics. Every question must be genuinely exam-worthy and educationally valuable for a VU student.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.65, // Balanced: creative but accurate
                        maxOutputTokens: 6000,
                        responseMimeType: 'application/json',
                        topP: 0.9,
                    },
                }),
            }
        );

        if (!response.ok) {
            console.error('Gemini error:', response.status, await response.text());
            return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 503 });
        }

        const geminiData = await response.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            return NextResponse.json({ error: 'No questions generated. Try again.' }, { status: 500 });
        }

        // Parse the JSON response
        let quizData;
        try {
            quizData = JSON.parse(rawText);
        } catch {
            // Try to extract JSON from the text
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                quizData = JSON.parse(jsonMatch[0]);
            } else {
                return NextResponse.json({ error: 'Failed to parse AI response.' }, { status: 500 });
            }
        }

        return NextResponse.json(quizData);

    } catch (err: any) {
        console.error('Quiz generation error:', err);
        return NextResponse.json({ error: 'Failed to generate quiz. Please try again.' }, { status: 500 });
    }
}
