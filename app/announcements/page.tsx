'use client';
import { announcements, categoryLabels } from '@/data/announcements';
import { useState } from 'react';

export default function AnnouncementsPage() {
    const [filter, setFilter] = useState('all');
    const cats = ['all', ...Object.keys(categoryLabels)];
    const filtered = filter === 'all' ? announcements : announcements.filter(a => a.category === filter);

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header">
                    <h1>📢 Announcements & Updates</h1>
                    <p>Stay updated with the latest VU news and notifications</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                    {cats.map(c => (
                        <button key={c} className={`btn ${filter === c ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(c)}>
                            {c === 'all' ? '📌 All' : categoryLabels[c]}
                        </button>
                    ))}
                </div>
                {filtered.map(a => (
                    <div key={a.id} className={`announcement-card ${a.important ? 'important' : ''}`}>
                        <div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span className="badge badge-primary">{categoryLabels[a.category]}</span>
                                {a.important && <span className="badge badge-warning">⚠️ Important</span>}
                            </div>
                            <h3 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>{a.title}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{a.description}</p>
                            <div className="announcement-date">📅 {a.date}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
