// This file contains detailed metadata for the UI (Ratings, Names, etc.)
// The dynamic list of ALL valid codes is in subjects.json and accessed via API.

export interface Subject {
    code: string;
    name: string;
    creditHours: number;
    category: string;
    rating: number;
    totalReviews: number;
    totalFiles: number;
    downloads: number;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
    teachers: string[];
    description: string;
    resources?: { title: string; type: string; link: string; }[];
}

export const subjects: Subject[] = [
    {
        code: "CS101",
        name: "Introduction to Computing",
        creditHours: 3,
        category: "Computer Science",
        rating: 4.8,
        totalReviews: 342,
        totalFiles: 156,
        downloads: 12500,
        difficulty: "Easy",
        teachers: ["Dr. Ayesha Khan", "Sir Ali"],
        description: "Basics of computer systems, software, and programming.",
    },
    {
        code: "MGT101",
        name: "Financial Accounting",
        creditHours: 3,
        category: "Management",
        rating: 4.5,
        totalReviews: 210,
        totalFiles: 98,
        downloads: 8900,
        difficulty: "Medium",
        teachers: ["Sir Bilal", "Mam Hina"],
        description: "Fundamentals of financial accounting principles.",
    },
    {
        code: "MTH101",
        name: "Calculus and Analytical Geometry",
        creditHours: 3,
        category: "Mathematics",
        rating: 4.2,
        totalReviews: 450,
        totalFiles: 205,
        downloads: 15600,
        difficulty: "Hard",
        teachers: ["Dr. Noman"],
        description: "Limits, continuity, derivatives, and integration.",
    },
    {
        code: "ENG101",
        name: "English Comprehension",
        creditHours: 3,
        category: "English",
        rating: 4.9,
        totalReviews: 120,
        totalFiles: 45,
        downloads: 5400,
        difficulty: "Easy",
        teachers: ["Mam Amna"],
        description: "Improving reading and writing skills.",
    },
    {
        code: "ISL201",
        name: "Islamic Studies",
        creditHours: 2,
        category: "General",
        rating: 4.7,
        totalReviews: 89,
        totalFiles: 34,
        downloads: 3200,
        difficulty: "Easy",
        teachers: ["Hafiz Ahmed"],
        description: "Basic teachings of Islam and Quranic studies.",
    },
    {
        code: "CS201",
        name: "Introduction to Programming",
        creditHours: 3,
        category: "Computer Science",
        rating: 4.6,
        totalReviews: 280,
        totalFiles: 112,
        downloads: 9800,
        difficulty: "Medium",
        teachers: ["Sir Faizan"],
        description: "C++ programming fundamentals and logic building.",
    },
    {
        code: "PHY101",
        name: "Physics 101",
        creditHours: 3,
        category: "Science",
        rating: 4.1,
        totalReviews: 150,
        totalFiles: 78,
        downloads: 6700,
        difficulty: "Hard",
        teachers: ["Dr. Shoaib"],
        description: "Mechanics, waves, and thermodynamics.",
    },
    {
        code: "PAK301",
        name: "Pakistan Studies",
        creditHours: 2,
        category: "General",
        rating: 4.8,
        totalReviews: 95,
        totalFiles: 40,
        downloads: 4100,
        difficulty: "Easy",
        teachers: ["Sir Kamran"],
        description: "History and culture of Pakistan.",
    },
    {
        code: "CS301",
        name: "Data Structures",
        creditHours: 3,
        category: "Computer Science",
        rating: 4.3,
        totalReviews: 310,
        totalFiles: 130,
        downloads: 11200,
        difficulty: "Very Hard",
        teachers: ["Dr. Zafar"],
        description: "Arrays, stacks, queues, trees, and graphs.",
    },
    {
        code: "CS302",
        name: "Digital Logic Design",
        creditHours: 3,
        category: "Computer Science",
        rating: 4.4,
        totalReviews: 180,
        totalFiles: 85,
        downloads: 7500,
        difficulty: "Hard",
        teachers: ["Sir Adeel"],
        description: "Boolean algebra, logic gates, and circuits.",
    },
    {
        code: "ACC501",
        name: "Business Finance",
        creditHours: 3,
        category: "Management",
        rating: 4.6,
        totalReviews: 150,
        totalFiles: 60,
        downloads: 4500,
        difficulty: "Medium",
        teachers: ["Dr. Ishfaq"],
        description: "Introduction to business finance, time value of money, and financial analysis.",
    },
    {
        code: "ACC311",
        name: "Fundamentals of Auditing",
        creditHours: 3,
        category: "Management",
        rating: 4.7,
        totalReviews: 180,
        totalFiles: 45,
        downloads: 6200,
        difficulty: "Medium",
        teachers: ["Sir Haseeb", "Mam Sara"],
        description: "Principles and practices of auditing, internal controls, and ethical standards for auditors.",
    }
];

export const categories = ['All', 'Computer Science', 'Mathematics', 'Management', 'English', 'General', 'Science'];

import allSubjects from './subjects.json';

export function getSubjectByCode(code: string): Subject | undefined {
    // 1. Try to find detailed subject
    const detailed = subjects.find(s => s.code.toLowerCase() === code.toLowerCase());
    if (detailed) return detailed;

    // 2. If not found, check if it's a valid code in the large list
    const validCode = allSubjects.find(c => c.toLowerCase() === code.toLowerCase());

    if (validCode) {
        // 3. Return a placeholder subject
        return {
            code: validCode,
            name: `${validCode} - Subject`, // Placeholder name
            creditHours: 3, // Default
            category: "General", // Default
            rating: 0,
            totalReviews: 0,
            totalFiles: 0,
            downloads: 0,
            difficulty: "Medium", // Default
            teachers: [],
            description: "No detailed description available regarding this subject yet.",
        };
    }

    return undefined;
}

export function getSubjectsByCategory(category: string): Subject[] {
    if (category === 'All') return subjects;
    return subjects.filter(s => s.category === category);
}
