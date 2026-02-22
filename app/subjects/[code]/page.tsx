'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { getSubjectByCode } from '@/data/subjects';

const sections = ['Midterm Files', 'Final Term Files', 'Solved Assignments', 'GDB Solutions', 'Quiz Files', 'Handwritten Notes', 'Past Papers', 'Important MCQs', 'Short Questions', 'Long Questions'];

const sampleFiles = [
    { name: 'Midterm Solved Papers 2024', teacher: 'Dr. Junaid', type: 'PDF', size: '2.4 MB', downloads: 1250, rating: 4.8, date: '2024-12-15' },
    { name: 'Complete Handwritten Notes', teacher: 'Sir Waqar', type: 'PDF', size: '8.1 MB', downloads: 980, rating: 4.6, date: '2024-11-20' },
    { name: 'Important MCQs Collection', teacher: 'Multiple', type: 'PDF', size: '1.5 MB', downloads: 2100, rating: 4.9, date: '2024-10-05' },
    { name: 'Assignment Solutions Spring 2024', teacher: 'Dr. Junaid', type: 'DOCX', size: '3.2 MB', downloads: 750, rating: 4.3, date: '2024-09-18' },
    { name: 'GDB Solutions Collection', teacher: 'Sir Imran', type: 'PDF', size: '1.8 MB', downloads: 620, rating: 4.5, date: '2024-08-22' },
];

const categoryLinks: Record<string, string> = {
    'Computer Science': 'https://drive.google.com/drive/folders/1gn9vOlBosa4sco-W_NvgGWgCV432sLdu?usp=drive_link',
    'Management': 'https://drive.google.com/drive/folders/1yLr8EX3ehDdGdhsKI0YZna9Kk2JbtjZe?usp=drive_link',
    'Mathematics': 'https://drive.google.com/drive/folders/11iCga1LlWk5EvpcZykWNr_glURgUeNeo?usp=drive_link',
    'Science': 'https://drive.google.com/drive/folders/11iCga1LlWk5EvpcZykWNr_glURgUeNeo?usp=drive_link', // Shared with Math
    'English': 'https://drive.google.com/drive/folders/1zJW41VjmF7YZJU8OfE2TWMk3jXQ0okcD',
    'General': 'https://drive.google.com/drive/folders/1QI9_QgYZU88uulylWksI3mKXECYDkSHB',
    'Others': 'https://drive.google.com/drive/folders/1i3v79NvfvB6-gCq1KgB-jwSLl3OoX9_O',
};

export default function SubjectDetailPage() {
    const params = useParams();
    const code = (params.code as string || '').toUpperCase();
    const subject = getSubjectByCode(code);
    const [activeTab, setActiveTab] = useState(0);
    const [reviewTab, setReviewTab] = useState<'midterm' | 'final'>('midterm');
    const [userRating, setUserRating] = useState(0);

    if (!subject) {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
                    <h1>Subject Not Found</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>The subject code &quot;{code}&quot; was not found in our database.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>{subject.code}</span>
                        <span className={`diff-${subject.difficulty.toLowerCase().replace(' ', '')}`}>{subject.difficulty}</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: '12px' }}>{subject.name}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '700px' }}>{subject.description}</p>

                    <div className="stat-grid" style={{ marginTop: '24px' }}>
                        <div className="stat-card"><div className="stat-number">{subject.rating.toFixed(1)}</div><div className="stat-label">Rating</div></div>
                        <div className="stat-card"><div className="stat-number">{subject.totalFiles}</div><div className="stat-label">Files</div></div>
                        <div className="stat-card"><div className="stat-number">{subject.downloads.toLocaleString()}</div><div className="stat-label">Downloads</div></div>
                        <div className="stat-card"><div className="stat-number">{subject.totalReviews}</div><div className="stat-label">Reviews</div></div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <a href={`/quiz/${subject.code}`} className="btn btn-success" style={{ padding: '12px 24px', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            🧠 Start Topic-Wise Quiz
                        </a>
                    </div>

                    <div style={{ marginTop: '16px', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                        <strong>Teachers:</strong> {subject.teachers.join(' • ')} &nbsp; | &nbsp; <strong>Credit Hours:</strong> {subject.creditHours}
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    {sections.map((sec, i) => (
                        <button key={i} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                            {sec}
                        </button>
                    ))}
                </div>

                {/* Files */}
                <h3 style={{ marginBottom: '16px' }}>{sections[activeTab]}</h3>
                <div style={{ marginBottom: '40px' }}>
                    {subject.resources && subject.resources.length > 0 ? (
                        (() => {
                            // Group files by category
                            const grouped: Record<string, typeof subject.resources> = {};
                            subject.resources.forEach(f => {
                                if (!grouped[f.type]) grouped[f.type] = [];
                                grouped[f.type].push(f);
                            });

                            // Helper function to convert Google Drive link to direct download/view
                            const getDriveLinks = (link: string) => {
                                // Extract file ID from various Drive URL formats
                                let fileId = '';
                                if (link.includes('/file/d/')) {
                                    fileId = link.split('/file/d/')[1].split('/')[0];
                                } else if (link.includes('id=')) {
                                    fileId = link.split('id=')[1].split('&')[0];
                                } else if (link.includes('/d/')) {
                                    fileId = link.split('/d/')[1].split('/')[0];
                                }

                                return {
                                    view: fileId ? `https://drive.google.com/file/d/${fileId}/view` : link,
                                    download: fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : link
                                };
                            };

                            return Object.keys(grouped).map(category => (
                                <div key={category} style={{ marginBottom: '30px' }}>
                                    <h4 style={{
                                        fontSize: '1.1rem',
                                        marginBottom: '12px',
                                        color: 'var(--primary)',
                                        borderBottom: '2px solid var(--primary)',
                                        paddingBottom: '8px'
                                    }}>
                                        {category}
                                    </h4>
                                    {grouped[category].map((f, i) => {
                                        const links = getDriveLinks(f.link);
                                        return (
                                            <div key={i} className="card" style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                                gap: '12px',
                                                marginBottom: '12px',
                                                padding: '16px 20px',
                                                transition: 'transform 0.2s',
                                            }}>
                                                <div style={{ flex: 1, minWidth: '200px' }}>
                                                    <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{f.title}</h4>
                                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                                        📄 {f.type}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <a
                                                        href={links.view}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ minWidth: '80px' }}
                                                    >
                                                        👁 View
                                                    </a>
                                                    <a
                                                        href={links.download}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-primary btn-sm"
                                                        style={{ minWidth: '100px' }}
                                                    >
                                                        ⬇ Download
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ));
                        })()
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '40px', background: 'var(--card-bg-hover)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📂</div>
                            <h3>No specific files found for {subject.code}</h3>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '8px auto 24px' }}>
                                We haven&apos;t indexed individual files for this subject yet. However, you can check our comprehensive archives.
                            </p>
                            <a href={categoryLinks[subject.category] || categoryLinks['Others']} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                Access {subject.category} Archive on Drive ↗
                            </a>
                        </div>
                    )}
                </div>

                {/* Reviews */}
                <h2 style={{ marginBottom: '20px' }}>⭐ Reviews & Ratings</h2>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <button className={`btn ${reviewTab === 'midterm' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setReviewTab('midterm')}>Midterm Reviews</button>
                    <button className={`btn ${reviewTab === 'final' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setReviewTab('final')}>Final Term Reviews</button>
                </div>

                {/* Review Form */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px' }}>Write a Review ({reviewTab === 'midterm' ? 'Midterm' : 'Final Term'})</h4>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} className={`star ${userRating >= s ? 'active' : ''}`} onClick={() => setUserRating(s)} style={{ fontSize: '1.5rem', cursor: 'pointer' }}>★</span>
                        ))}
                    </div>
                    <textarea className="form-textarea" placeholder="Share your experience with this subject..." style={{ marginBottom: '12px' }} />
                    <button className="btn btn-primary">Submit Review</button>
                </div>

                {/* Sample Reviews */}
                {[
                    { name: 'Ahmed K.', rating: 5, text: 'Great subject! The past papers are very helpful. Dr. Junaid explains concepts very clearly.', helpful: 24, date: '2024-12-10' },
                    { name: 'Sara M.', rating: 4, text: 'Moderately difficult but manageable with proper preparation. Focus on past papers.', helpful: 18, date: '2024-11-25' },
                    { name: 'Usman R.', rating: 5, text: 'Excellent course material. The MCQs are mostly from past papers. Keep practicing!', helpful: 31, date: '2024-10-15' },
                ].map((r, i) => (
                    <div key={i} className="card" style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div>
                                <strong>{r.name}</strong>
                                <div className="stars" style={{ marginTop: '4px' }}>
                                    {[1, 2, 3, 4, 5].map(s => <span key={s} className={`star ${r.rating >= s ? 'active' : ''}`}>★</span>)}
                                </div>
                            </div>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.date}</span>
                        </div>
                        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{r.text}</p>
                        <button className="btn btn-outline btn-sm">👍 Helpful ({r.helpful})</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
