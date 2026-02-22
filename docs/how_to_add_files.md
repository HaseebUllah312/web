# How to Add Study Files & Resources

This guide explains how to add specific files (Past Papers, Handouts, Solved Assignments) to a subject page so they appear in the "Midterm Files", "Final Term Files", etc. tabs.

## Step 1: Prepare Your File Link
1. Upload your file (PDF, DOCX, ZIP) to **Google Drive**.
2. Right-click the file -> **Share** -> **Share**.
3. Change General Access to: **"Anyone with the link"** -> **"Viewer"**.
4. Click **Copy Link**.

## Step 2: Open the Data File
Open the following file in your code editor:
`g:\Web\New folder\web\data\subjects.json`

## Step 3: Find the Subject
Use `Ctrl+F` to find the subject you want to update (e.g., `"code": "CS101"`).

## Step 4: Add the `resources` Section
Add a `resources` array inside the subject object. If it doesn't exist, create it.

### Example Code:

```json
    {
        "code": "CS101",
        "name": "Introduction to Computing",
        "creditHours": 3,
        "category": "Computer Science",
        "rating": 4.6,
        "totalReviews": 234,
        "totalFiles": 89,
        "downloads": 12500,
        "difficulty": "Easy",
        "teachers": ["Dr. Tanveer Afzal"],
        "description": "Fundamentals of computing...",
        
        "//": "ADD THE SECTION BELOW",
        "resources": [
            {
                "title": "CS101 Midterm Past Papers (Moaaz)",
                "type": "Midterm Files",
                "link": "https://drive.google.com/file/d/123456789/view?usp=sharing"
            },
            {
                "title": "CS101 Handouts (PDF)",
                "type": "Handouts",
                "link": "https://drive.google.com/file/d/987654321/view?usp=sharing"
            },
            {
                "title": "Assignment 1 Solution (Fall 2025)",
                "type": "Solved Assignments",
                "link": "https://drive.google.com/file/d/abcdefghi/view?usp=sharing"
            }
        ]
    },
```

## Supported Types
Make sure the `"type"` field matches one of these exactly:
- `Midterm Files`
- `Final Term Files`
- `Solved Assignments`
- `GDB Solutions`
- `Quiz Files`
- `Handouts`
- `Past Papers`

## Tips
- You can add as many files as you want in the `resources` list.
- The website will automatically categorize them into tabs based on the "type".
- If a subject has no `resources`, it will show the generic "Access Archive" button.
