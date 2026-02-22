# 🤖 How to Generate Quizzes with AI

To fill your website with unlimited quizzes, you can use ChatGPT, Claude, or DeepSeek. 

## 1. The Prompt
Copy and paste this **exact prompt** into the AI:

```text
You are a Quiz Generator for a University Learning Management System.
I need a JSON object for the subject "[INSERT SUBJECT CODE] - [INSERT SUBJECT NAME]".

Requirements:
1. Create 2-3 "Midterm" topics and 2-3 "Final" topics.
2. Each topic must have at least 5 meaningful questions.
3. The format MUST be a valid JSON object matching this structure exactly:

{
    "subject": "CODE",
    "title": "Subject Name",
    "topics": [
        {
            "id": "topic_unique_id",
            "name": "Topic Name",
            "term": "Midterm", 
            "questions": [
                {
                    "id": 101,
                    "difficulty": "Easy",
                    "question": "Question text here?",
                    "options": ["Wrong 1", "Correct Answer", "Wrong 2", "Wrong 3"],
                    "correct": 1, 
                    "explanation": "Brief explanation of why it is correct."
                }
            ]
        }
    ]
}

IMPORTANT: 
- "correct" index must match the "options" array (0-based index).
- "difficulty" can be Easy, Medium, or Hard.
- "term" must be either "Midterm" or "Final".
- Do not output markdown code blocks, just raw text if possible, or standard single block.
```

## 2. How to Add to Website
1. Copy the JSON output from the AI.
2. Create a new file in your project: `data/quizzes/[SUBJECT_CODE].json` (e.g., `CS201.json`).
3. Paste the code.
4. **Done!** It will instantly appear in:
   - The **"Topic Wise"** Quiz Page (`/quiz/CS201`)
   - The **"MCQ Practice"** Page (`/mcq-practice`)

## 3. Example Workflow
1. User: "Generate quiz for CS201 - Introduction to Programming"
2. AI: [Generates JSON]
3. You: Save as `data/quizzes/CS201.json`
## 4. How to Reach 300 MCQs (Bulk Strategy)
AI cannot generate 300 questions in one message (it cuts off). You must do it in **batches**.

### The "Batching" Workflow
1.  **Batch 1 (Midterm Basics)**: "Generate 30 MCQs for [SUBJECT] covering Midterm Topics 1-3."
2.  **Batch 2 (Midterm Advanced)**: "Generate 30 MCQs for [SUBJECT] covering Midterm Topics 4-6."
3.  **Batch 3 (Finals)**: "Generate 30 MCQs for [SUBJECT] covering Final Term Topics."
4.  **Batch 4 (Past Papers)**: Use the **Admin JSON Tool** to convert PDF text.
5.  **Merge**: Copy the `questions` array from each batch and paste them into your main `[SUBJECT].json` file.

### "Bulk Mode" Prompt
Use this prompt to get **dense** data with less formatting overhead:

```text
Generate 30 JSON questions for [SUBJECT].
Topic: [INSERT TOPIC NAME]
Term: [Midterm/Final]
Format: JSON only (list of objects).
Required Fields: id, difficulty, question, options, correct (index), explanation.
Content: High-value academic questions. Avoid duplicates.
```

