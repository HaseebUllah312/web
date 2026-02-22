export default function LeaderboardPage() {
    const topUploaders = [
        { rank: 1, name: 'Muhammad Ahmed', program: 'BSCS', uploads: 89, points: 2450, badge: '🏆' },
        { rank: 2, name: 'Fatima Zahra', program: 'BBA', uploads: 76, points: 2180, badge: '🥈' },
        { rank: 3, name: 'Ali Hassan', program: 'BSIT', uploads: 65, points: 1920, badge: '🥉' },
        { rank: 4, name: 'Ayesha Khan', program: 'BSCS', uploads: 58, points: 1750, badge: '⭐' },
        { rank: 5, name: 'Usman Tariq', program: 'MBA', uploads: 52, points: 1580, badge: '⭐' },
        { rank: 6, name: 'Sana Malik', program: 'BSCS', uploads: 47, points: 1420, badge: '⭐' },
        { rank: 7, name: 'Hassan Raza', program: 'BSIT', uploads: 43, points: 1290, badge: '⭐' },
        { rank: 8, name: 'Zainab Ali', program: 'BBA', uploads: 38, points: 1140, badge: '⭐' },
        { rank: 9, name: 'Omar Sheikh', program: 'BSCS', uploads: 35, points: 1050, badge: '⭐' },
        { rank: 10, name: 'Hira Nawaz', program: 'MBA', uploads: 31, points: 930, badge: '⭐' },
    ];

    const topAnswerers = [
        { rank: 1, name: 'Dr. Code Master', answers: 156, accepted: 89, points: 3200, badge: '🏆' },
        { rank: 2, name: 'Sara Helper', answers: 134, accepted: 78, points: 2890, badge: '🥈' },
        { rank: 3, name: 'Ali Expert', answers: 112, accepted: 65, points: 2420, badge: '🥉' },
        { rank: 4, name: 'Fatima Guide', answers: 98, accepted: 54, points: 2100, badge: '⭐' },
        { rank: 5, name: 'Usman Pro', answers: 87, accepted: 48, points: 1870, badge: '⭐' },
    ];

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>🏆 Leaderboard</h1>
                    <p>Celebrating our top contributors who help the VU community</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                    {/* Top Uploaders */}
                    <div>
                        <h2 style={{ marginBottom: '20px' }}>📤 Top Uploaders</h2>
                        {topUploaders.map(u => (
                            <div key={u.rank} className="leaderboard-item">
                                <div className={`leaderboard-rank ${u.rank === 1 ? 'gold' : u.rank === 2 ? 'silver' : u.rank === 3 ? 'bronze' : ''}`}>
                                    {u.badge}
                                </div>
                                <div className="leaderboard-info">
                                    <div className="leaderboard-name">{u.name}</div>
                                    <div className="leaderboard-stats">{u.program} • {u.uploads} uploads</div>
                                </div>
                                <div className="leaderboard-points">{u.points.toLocaleString()} pts</div>
                            </div>
                        ))}
                    </div>

                    {/* Top Answerers */}
                    <div>
                        <h2 style={{ marginBottom: '20px' }}>💬 Top Answer Contributors</h2>
                        {topAnswerers.map(u => (
                            <div key={u.rank} className="leaderboard-item">
                                <div className={`leaderboard-rank ${u.rank === 1 ? 'gold' : u.rank === 2 ? 'silver' : u.rank === 3 ? 'bronze' : ''}`}>
                                    {u.badge}
                                </div>
                                <div className="leaderboard-info">
                                    <div className="leaderboard-name">{u.name}</div>
                                    <div className="leaderboard-stats">{u.answers} answers • {u.accepted} accepted</div>
                                </div>
                                <div className="leaderboard-points">{u.points.toLocaleString()} pts</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Badge System */}
                <div style={{ marginTop: '60px' }}>
                    <div className="section-header">
                        <h2>🎖️ Badge System</h2>
                        <p>Earn badges by contributing to the community</p>
                    </div>
                    <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                        {[
                            { icon: '🌟', title: 'Newcomer', desc: 'First upload or answer', points: '10 pts' },
                            { icon: '📝', title: 'Contributor', desc: '10+ uploads', points: '100 pts' },
                            { icon: '🎯', title: 'Expert', desc: '50+ accepted answers', points: '500 pts' },
                            { icon: '👑', title: 'Legend', desc: '100+ uploads + 2000 pts', points: '2000 pts' },
                            { icon: '💎', title: 'Diamond', desc: 'Top 3 in leaderboard', points: '3000 pts' },
                            { icon: '🏅', title: 'Mentor', desc: 'Helped 100+ students', points: '1500 pts' },
                        ].map((b, i) => (
                            <div key={i} className="card" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{b.icon}</div>
                                <h3 style={{ fontSize: '1rem' }}>{b.title}</h3>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '6px 0' }}>{b.desc}</p>
                                <span className="badge badge-primary">{b.points}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
