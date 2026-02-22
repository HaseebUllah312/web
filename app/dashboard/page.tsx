import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';
import { redirect } from 'next/navigation';
import DashboardNavGrid from '@/components/dashboard/DashboardNavGrid';

export default async function DashboardPage() {
    const cookie = (await cookies()).get('session')?.value;
    const session = cookie ? await verifySession(cookie) : null;

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="page">
            {/* Welcome Section */}
            <section style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                padding: '40px',
                borderRadius: '15px',
                marginBottom: '50px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                        👋 Welcome, {session.username}!
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Welcome back to VU Academic Hub. Let's continue your learning journey.
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📚</div>
                    <p style={{ color: 'var(--text-secondary)' }}>Student</p>
                </div>
            </section>

            {/* Quick Stats */}
            <section style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Your Activity</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px'
                }}>
                    <div style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '25px',
                        borderRadius: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📖</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Materials Viewed</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>0</p>
                    </div>

                    <div style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '25px',
                        borderRadius: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Quizzes Taken</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>0</p>
                    </div>

                    <div style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '25px',
                        borderRadius: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📤</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Files Uploaded</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>0</p>
                    </div>

                    <div style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '25px',
                        borderRadius: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⭐</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Study Points</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>0 XP</p>
                    </div>
                </div>
            </section>

            {/* Quick Access */}
            <section style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Quick Access</h2>
                <DashboardNavGrid items={[
                    { icon: '📚', label: 'Subjects', href: '/subjects' },
                    { icon: '✅', label: 'MCQ Practice', href: '/mcq-practice' },
                    { icon: '📖', label: 'Resources', href: '/resources' },
                    { icon: '🤖', label: 'AI Assistant', href: '/ai-assistant' },
                    { icon: '❓', label: 'Q&A Forum', href: '/qna' },
                    { icon: '🏆', label: 'Leaderboard', href: '/leaderboard' },
                    { icon: '📤', label: 'Upload Files', href: '/upload' },
                    { icon: '�️', label: 'Services', href: '/services' },
                    { icon: '�👤', label: 'My Profile', href: '/profile' }
                ]} />
            </section>

            {/* Recommendations */}
            <section style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>📚 Recommended for You</h2>
                <div style={{
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    padding: '40px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)'
                }}>
                    <p style={{ marginBottom: '20px' }}>Start exploring your subjects to get personalized recommendations!</p>
                    <Link href="/subjects" className="btn btn-primary" style={{ padding: '12px 30px' }}>
                        Browse Subjects →
                    </Link>
                </div>
            </section>
        </div>
    );
}
