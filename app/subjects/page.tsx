'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { subjects, categories } from '@/data/subjects';
// import { allSubjects } from '@/data/all_subjects';

export default function SubjectsPage() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('code');
    const [allSubjects, setAllSubjects] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/subjects').then(r => r.json()).then(setAllSubjects);
    }, []);

    // Merge detailed subjects with the master list
    const mergedSubjects = allSubjects.map(code => {
        const detail = subjects.find(s => s.code === code);
        return detail || {
            code,
            name: 'Subject Details Coming Soon',
            creditHours: 0,
            category: 'General',
            rating: 0,
            totalReviews: 0,
            totalFiles: 0,
            downloads: 0,
            difficulty: 'Medium',
            teachers: [],
            description: 'Description not available yet.'
        };
    });

    let filtered = mergedSubjects.filter(s => {
        const q = search.toLowerCase();
        // Safe check for teachers array existence
        const teachers = s.teachers || [];
        const matchesSearch = !q || s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || teachers.some(t => t.toLowerCase().includes(q));
        const matchesCat = category === 'All' || s.category === category;
        return matchesSearch && matchesCat;
    });

    filtered.sort((a, b) => {
        if (sort === 'rating') return b.rating - a.rating;
        if (sort === 'downloads') return b.downloads - a.downloads;
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'code') return a.code.localeCompare(b.code);
        return 0;
    });

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>📚 Subject Library</h1>
                    <p>Browse all VU subjects with study materials, past papers, and more</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <input className="form-input" placeholder="🔍 Search by code, name, or teacher..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="form-select" style={{ width: 'auto', minWidth: '180px' }} value={category} onChange={e => setCategory(e.target.value)}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="form-select" style={{ width: 'auto', minWidth: '150px' }} value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="rating">Sort by Rating</option>
                        <option value="downloads">Sort by Downloads</option>
                        <option value="name">Sort by Name</option>
                        <option value="code">Sort by Code</option>
                    </select>
                </div>

                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.88rem' }}>Showing {filtered.length} subjects</p>

                <div className="card-grid">
                    {filtered.map(s => (
                        <Link key={s.code} href={`/subjects/${s.code.toLowerCase()}`} className="card subject-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div className="subject-code">{s.code}</div>
                                {s.difficulty && <span className={`diff-${s.difficulty.toLowerCase().replace(' ', '')}`}>{s.difficulty}</span>}
                            </div>
                            <h3>{s.name}</h3>
                            <p>{s.description}</p>
                            <div style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                👨‍🏫 {s.teachers && s.teachers.length > 0 ? s.teachers.join(', ') : 'TBA'}
                            </div>
                            <div className="subject-meta">
                                <span>⭐ {s.rating.toFixed(1)} ({s.totalReviews})</span>
                                <span>📥 {s.downloads.toLocaleString()}</span>
                                <span>📄 {s.totalFiles} files</span>
                                <span>📖 {s.creditHours} CH</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
