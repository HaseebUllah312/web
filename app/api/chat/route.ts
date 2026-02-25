import { NextRequest, NextResponse } from 'next/server';

const modeInstructions: Record<string, string> = {
    quick: 'Give a brief, precise answer in 3-5 sentences. Be direct, accurate, and helpful. Do not pad with unnecessary text.',
    detailed: 'Give a thorough, well-structured explanation. Use clear headings, bullet points, numbered steps, and real examples. Break complex ideas into digestible parts. End by asking if they need further clarification.',
    exam: 'Focus on VU exam preparation. Identify what is likely to be tested, provide model answers, mention marks distribution, give memory tricks/mnemonics, and highlight common mistakes students make. Keep it exam-strategic.',
    quiz: 'Generate 5 high-quality MCQs on the topic with 4 options each (A, B, C, D). Mark the correct answer with ✅ and give a 1-line explanation for why that answer is correct. Number each question clearly.',
};

export async function POST(request: NextRequest) {
    try {
        const { message, mode = 'quick', history = [] } = await request.json();

        if (!message?.trim()) {
            return NextResponse.json({ reply: 'Please type a question first.' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set.');
            return NextResponse.json({
                reply: '⚠️ AI service is temporarily unavailable. Please try again later or contact support.',
            });
        }

        const systemPrompt = `You are **VU Academic Hub AI Assistant** — a highly knowledgeable, professional, and friendly academic tutor exclusively for **Virtual University of Pakistan (VU)** students.

## Your Expertise:
You have deep knowledge of all VU courses including:
- **Computer Science**: CS101, CS201, CS301, CS302, CS401, CS403, CS408, CS501, CS502, CS504, CS506, CS601, CS605, CS606, CS610, CS615, CS619, CS620
- **IT**: IT430, IT620, IT636
- **Mathematics**: MTH001, MTH100, MTH101, MTH202, MTH301, MTH302, MTH401, MTH501, MTH601, MTH603, MTH631, MTH632, MTH634, MTH641
- **Statistics**: STA301, STA302, STA630
- **Management Sciences**: MGT101, MGT201, MGT211, MGT301, MGT401, MGT402, MGT501, MGT502, MGT503, MGT504, MGT510, MGT520, MGT601, MGT602, MGT603, MGT604, MGT610, MGT612, MGT613
- **English/Communication**: ENG001, ENG101, ENG201, ENG301, ENG401
- **Islamic Studies**: ISL201
- **General Education**: GEN001, PAK301, SOC101, PSY101, PHY101, CHE101, BIO101

## Response Style:
- **Professional yet warm** — like a brilliant senior student or university lecturer who genuinely cares
- **Precise and accurate** — never guess; if unsure, say so and suggest where to look
- **Contextually aware** — use Pakistani academic context (VU handouts, VULMS, GDB, Quiz, Assignment, MDB format)
- **Structured** — use formatting (bullet points, numbered lists, bold key terms) for clarity
- **Encouraging** — motivate students, especially when they're struggling

## Current Mode:
${modeInstructions[mode] || modeInstructions.quick}

## Important Rules:
- If asked something outside academics (e.g., personal advice, entertainment, politics), politely redirect: "I'm specialized for VU academics — let me help you with your studies!"
- If asked about a specific VU subject/code, provide accurate, course-specific information
- When giving examples, use Pakistani names, rupees, and local contexts
- Never make up marks, course content, or exam dates — say "check your VU LMS/handout for exact details"
- Format math formulas clearly using text notation (e.g., f'(x) = 2x instead of LaTeX)`;

        // Build conversation history for context
        // CRITICAL: Gemini requires the first message in contents to be from the 'user'
        let conversationHistory = history
            .filter((msg: any) => msg.text && msg.text.trim())
            .map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            }));

        // Remove any leading 'model' turns to satisfy Gemini API requirements
        while (conversationHistory.length > 0 && conversationHistory[0].role === 'model') {
            conversationHistory.shift();
        }

        // Keep only last 6 turns to keep context window clean
        conversationHistory = conversationHistory.slice(-6);

        // Add current user message
        conversationHistory.push({
            role: 'user',
            parts: [{ text: message }],
        });

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        system_instruction: {
                            parts: [{ text: systemPrompt }],
                        },
                        contents: conversationHistory,
                        generationConfig: {
                            temperature: mode === 'quiz' ? 0.6 : 0.75,
                            maxOutputTokens: mode === 'quick' ? 500 : 2000,
                            topP: 0.9,
                            topK: 40,
                        },
                        safetySettings: [
                            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                        ],
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Gemini API Error [${response.status}]:`, errorText);

                if (response.status === 429) {
                    return NextResponse.json({
                        reply: '⚠️ AI is a bit busy right now (rate limit reached). Please wait 30 seconds and try again.',
                    });
                }
                if (response.status === 400) {
                    return NextResponse.json({
                        reply: '⚠️ I had trouble understanding that request. Could you rephrase your question?',
                    });
                }

                return NextResponse.json({
                    reply: '⚠️ AI service encountered an error. Please try again in a moment.',
                });
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                console.error('No candidates in Gemini response:', JSON.stringify(data));
                return NextResponse.json({
                    reply: '⚠️ I was unable to generate a response. Please try rephrasing your question.',
                });
            }

            const reply = data.candidates[0]?.content?.parts?.[0]?.text;

            if (!reply) {
                return NextResponse.json({
                    reply: '⚠️ No response generated. Please try again.',
                });
            }

            return NextResponse.json({ reply: reply.trim() });

        } catch (fetchError) {
            console.error('Network error calling Gemini API:', fetchError);
            return NextResponse.json({
                reply: '⚠️ Network error connecting to AI service. Please check your connection and try again.',
            });
        }

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({
            reply: '⚠️ Something went wrong. Please refresh the page and try again.',
        }, { status: 500 });
    }
}
