'use client';
import { useState } from 'react';

const sampleQuestions = [
    { id: 1, title: 'How to prepare for CS101 final exam?', body: 'I have my CS101 final coming up next week. What are the best strategies?', tags: ['CS101', 'final', 'exam-prep'], votes: 24, answers: 5, author: 'Ahmed K.', date: '2 hours ago', accepted: true },
    { id: 2, title: 'Difference between Stack and Queue?', body: 'Can someone explain the key differences with examples?', tags: ['CS301', 'data-structures'], votes: 18, answers: 3, author: 'Sara M.', date: '5 hours ago', accepted: true },
    { id: 3, title: 'MGT201 Assignment 2 help needed', body: 'I\'m stuck on the NPV calculation part. Any guidance?', tags: ['MGT201', 'assignment'], votes: 12, answers: 4, author: 'Usman T.', date: '1 day ago', accepted: false },
    { id: 4, title: 'Best way to learn SQL joins?', body: 'I\'m struggling with INNER, LEFT, RIGHT, and FULL joins in CS403.', tags: ['CS403', 'SQL', 'database'], votes: 31, answers: 7, author: 'Fatima Z.', date: '2 days ago', accepted: true },
    { id: 5, title: 'STA301 probability distribution formulas', body: 'Can anyone share a summary of all probability distribution formulas for the final?', tags: ['STA301', 'statistics'], votes: 27, answers: 6, author: 'Ali H.', date: '3 days ago', accepted: true },
];

export default function QnAPage() {
    const [search, setSearch] = useState('');
    const [showAskForm, setShowAskForm] = useState(false);

    const filtered = sampleQuestions.filter(q => {
        const s = search.toLowerCase();
        return !s || q.title.toLowerCase().includes(s) || q.tags.some(t => t.toLowerCase().includes(s));
    });

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="page-header">
                    <h1>❓ Q&A Forum</h1>
                    <p>Ask questions, share answers, and help fellow VU students</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <input className="form-input" style={{ flex: 1, minWidth: '250px' }} placeholder="🔍 Search questions by topic or subject..." value={search} onChange={e => setSearch(e.target.value)} />
                    <button className="btn btn-primary" onClick={() => setShowAskForm(!showAskForm)}>{showAskForm ? '✕ Cancel' : '+ Ask Question'}</button>
                </div>

                {showAskForm && (
                    <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Ask a Question</h3>
                        <div className="form-group"><label className="form-label">Question Title</label><input className="form-input" placeholder="What do you want to know?" /></div>
                        <div className="form-group"><label className="form-label">Details</label><textarea className="form-textarea" placeholder="Provide more context..." /></div>
                        <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-input" placeholder="e.g. CS101, midterm, programming" /></div>
                        <button className="btn btn-primary">Post Question</button>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <button className="btn btn-primary btn-sm">🔥 Trending</button>
                    <button className="btn btn-secondary btn-sm">⏰ Recent</button>
                    <button className="btn btn-secondary btn-sm">✅ Answered</button>
                    <button className="btn btn-secondary btn-sm">📊 Most Votes</button>
                </div>

                {filtered.map(q => (
                    <div key={q.id} className="qa-item">
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div className="qa-votes">
                                <button className="vote-btn">▲</button>
                                <span className="vote-count">{q.votes}</span>
                                <button className="vote-btn">▼</button>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>
                                    {q.accepted && <span style={{ color: 'var(--success)', marginRight: '6px' }}>✅</span>}
                                    {q.title}
                                </h3>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>{q.body}</p>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    {q.tags.map(t => <span key={t} className="badge badge-primary">{t}</span>)}
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                        💬 {q.answers} answers • {q.author} • {q.date}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
