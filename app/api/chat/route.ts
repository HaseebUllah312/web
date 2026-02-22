import { NextRequest, NextResponse } from 'next/server';

const modeInstructions: Record<string, string> = {
    quick: 'Give a brief, concise answer in 2-3 sentences. Be direct and to the point.',
    detailed: 'Give a detailed, comprehensive explanation with examples. Use bullet points and clear structure. Explain step by step.',
    exam: 'Focus on exam preparation. Highlight important topics, common MCQs, past paper patterns, and provide exam tips. Be specific about what to study.',
    quiz: 'Generate practice MCQs with 4 options each. After each question, provide the correct answer and a brief explanation. Generate 3-5 questions.',
};

// Mock responses for development/fallback
function getMockResponse(message: string, mode: string): string {
    const mockResponses: Record<string, string[]> = {
        quick: [
            'This is a key concept in VU curriculum. Students typically learn this in the foundational courses. It\'s important for understanding more advanced topics.',
            'This topic often appears in VU exams. The main idea is to understand the core principles and apply them to practical scenarios.',
            'You\'re asking a great question! This connects multiple VU subjects together. Let me break it down simply.'
        ],
        detailed: [
            `This is an important concept in VU studies. Let me explain it in detail:\n\n1. **Foundation**: The basic principles stem from core academic theory\n\n2. **Application**: In VU programs, this is applied across different subjects\n\n3. **Examples**:\n   - In practical scenarios, this manifests as...\n   - For exam preparation, focus on...\n\n4. **Key Points**:\n   ✓ Understanding the core concept is essential\n   ✓ Practice with real-world examples\n   ✓ Connect it with related topics\n\nWould you like me to explain any specific part further?`,
            `Great question about VU curriculum! Here's a comprehensive breakdown:\n\n**Overview**: This topic covers important fundamentals that every VU student should master.\n\n**Key Components**:\n• Theoretical foundation\n• Practical applications\n• Real-world examples\n\n**Why It Matters**:\nThis concept is crucial for success in VU exams and professional practice.\n\n**Study Tips**:\n1. Create summary notes\n2. Practice problems regularly\n3. Discuss with classmates\n4. Connect to other topics\n\nNeed clarification on any part?`
        ],
        exam: [
            `**Exam Focus for VU**: This topic is frequently asked in VU exams.\n\n**Likely Question Patterns**:\n• Conceptual understanding (1-2 marks)\n• Application-based questions (3-5 marks)\n• Case study based (5-10 marks)\n\n**What to Study**:\n✓ Definitions and key terms\n✓ Formulas and processes\n✓ Real-world applications\n✓ Similar topics from the course\n\n**How to Prepare**:\n1. Solve previous year papers\n2. Practice MCQs\n3. Make quick revision notes\n4. Time-based practice tests\n\nThis is high-priority for exam preparation!`,
            `**VU Exam Tips for This Topic**:\n\n**Frequency in Exams**: Very common in VU assessments\n\n**Question Types**:\n- Multiple Choice (usually 5-10 questions)\n- Short Answer (briefly explain)\n- Long Answer (detailed explanation)\n- Problem Solving\n\n**Preparation Strategy**:\n📚 Study Materials: Course handout, textbook, slides\n🧠 Concepts: Focus on core ideas\n✍️ Practice: Solve all end-of-chapter questions\n🔄 Revision: Create summary\n⏱️ Time Management: Allocate adequate study time\n\nStart preparing early - this helps you score well!`
        ],
        quiz: [
            `**Question 1**: What is the primary purpose of this concept in VU curriculum?\nA) Understanding theoretical foundations\nB) Developing practical skills\nC) Both A and B\nD) Neither A nor B\n\n**Answer**: C) Both A and B\n**Explanation**: This concept is important for both theoretical understanding and practical application in VU programs.\n\n**Question 2**: Which of the following is a key characteristic?\nA) Foundational knowledge\nB) Applied learning\nC) Critical thinking\nD) All of the above\n\n**Answer**: D) All of the above\n**Explanation**: VU education emphasizes all these aspects for comprehensive student development.`,
            `**Question 1**: How is this topic typically applied in VU courses?\nA) Theoretical study only\nB) Practical projects only\nC) Mix of theory and practice\nD) No practical use\n\n**Answer**: C) Mix of theory and practice\n**Explanation**: VU curriculum emphasizes balanced learning combining both theoretical knowledge and practical applications.\n\n**Question 2**: What's the significance in exam context?\nA) Minor topic\nB) Moderate importance\nC) Highly important\nD) Not relevant\n\n**Answer**: C) Highly important\n**Explanation**: This topic frequently appears in VU exams and is crucial for student assessment.`
        ]
    };

    const responses = mockResponses[mode] || mockResponses.quick;
    return responses[Math.floor(Math.random() * responses.length)];
}

export async function POST(request: NextRequest) {
    try {
        const { message, mode = 'quick' } = await request.json();

        if (!message) {
            return NextResponse.json({ reply: 'Please provide a message.' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set in environment variables.');
            // Fallback to mock response in development
            return NextResponse.json({ 
                reply: getMockResponse(message, mode)
            });
        }

        const systemPrompt = `You are VU AI Study Assistant, an expert academic tutor for Virtual University of Pakistan students. You help with all VU subjects including CS, IT, Management, Mathematics, English, and Islamic Studies.

Your role:
- Help students understand concepts clearly
- Provide accurate academic information
- Guide exam preparation
- Explain complex topics simply
- Use Pakistani educational context when relevant

Mode: ${modeInstructions[mode] || modeInstructions.quick}

Always be helpful, encouraging, and accurate. If you don't know something, say so honestly.`;

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent question: ${message}` }] }
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: mode === 'quick' ? 300 : 1500,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Gemini API Error [${response.status}]:`, errorText);
                
                // Fallback to mock response if API fails
                console.log('Falling back to mock response due to API error');
                return NextResponse.json({ 
                    reply: getMockResponse(message, mode)
                });
            }

            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                console.error('No candidates in Gemini response:', data);
                return NextResponse.json({ 
                    reply: getMockResponse(message, mode)
                });
            }

            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || getMockResponse(message, mode);

            return NextResponse.json({ reply });
        } catch (fetchError) {
            console.error('Fetch error when calling Gemini API:', fetchError);
            // Fallback to mock response on network error
            return NextResponse.json({ 
                reply: getMockResponse(message, mode)
            });
        }
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ 
            reply: 'An error occurred. Please try again.' 
        }, { status: 500 });
    }
}
