# How to Add Study Files to Subjects

## 🚀 The Automatic Shortcut (No Setup Required!)

**Good News**: You do NOT need to add files manually for every subject!

We have already set up a **Department Archive System**.
- If a student visits **CS101**, the site automatically shows a button: **"Access Computer Science Archive"**.
- This button takes them to your main Google Drive folder where *all* CS files are located.
- This works for **ALL 200+ subjects** instantly. You don't need to do anything! 

---

## Adding Specific Files (Optional)

Only follow the steps below if you want to highlight valuable files (like a "Golden Past Paper" or "Solved Midterm") directly on the subject page.

Currently, the default behavior is that every subject links to the **Main Google Drive Archive** of its department (e.g., Computer Science Archive).

If you want to add **specific files** (like a Midterm Past Paper or Handout) directly to a subject page so students can download it immediately, follow these steps:

## 1. Open the Data File
Go to `g:\Web\New folder\web\data\subjects.ts`.

## 2. Find the Subject
Search for the subject code you want to add files to (e.g., `CS101`).

## 3. Add the `resources` Section
Add a `resources` list to the subject object. Here is an example:

```typescript
    { 
        code: 'CS101', 
        name: 'Introduction to Computing', 
        // ... (other details) ...
        description: 'Fundamentals of computing...',
        
        // ADD THIS SECTION:
        resources: [
            {
                title: 'Midterm Past Papers (Moaaz)',    // Name of the file
                type: 'Midterm Files',                   // Category (must be one of the tabs)
                link: 'https://drive.google.com/...'     // Direct Google Drive Link
            },
            {
                title: 'CS101 Handouts (PDF)',
                type: 'Handouts',
                link: 'https://drive.google.com/...'
            },
            {
                title: 'Solved Quiz 1 (2024)',
                type: 'Quiz Files',
                link: 'https://drive.google.com/...'
            }
        ]
    },
```

## Supported Categories (Types)
Ensure the `type` matches one of these exactly, or it will appear in the "Midterm Files" tab by default:
- `Midterm Files`
- `Final Term Files`
- `Solved Assignments`
- `GDB Solutions`
- `Quiz Files`
- `Handouts`
- `Past Papers`

## Important Note on Links
- The `link` should be a **Direct Download Link** or a **View Link**.
- If using Google Drive, make sure the sharing permission is set to **"Anyone with the link can view"**.
