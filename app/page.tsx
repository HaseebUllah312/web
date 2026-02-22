'use client';
import Link from 'next/link';
import { subjects } from '@/data/subjects';
import { announcements } from '@/data/announcements';

const quickLinks = [
  { href: '/subjects', label: '📚 Subjects', color: '#6366f1' },
  { href: '/mcq-practice', label: '🧠 MCQ Practice', color: '#8b5cf6' },
  { href: '/tools', label: '🧮 Tools', color: '#a78bfa' },
  { href: '/upload', label: '📤 Upload Files', color: '#6366f1' },
  { href: '/ai-assistant', label: '🤖 AI Assistant', color: '#8b5cf6' },
  { href: '/services', label: '💼 Services', color: '#a78bfa' },
  { href: '/lms-guide', label: '🗂 LMS Guide', color: '#6366f1' },
  { href: '/qna', label: '❓ Q&A Forum', color: '#8b5cf6' },
];

const topSubjects = [...subjects].sort((a, b) => b.rating - a.rating).slice(0, 6);
const topDownloaded = [...subjects].sort((a, b) => b.downloads - a.downloads).slice(0, 6);

const leaderboard = [
  { name: 'Muhammad Ahmed', points: 2450, uploads: 89, badge: '🏆' },
  { name: 'Fatima Zahra', points: 2180, uploads: 76, badge: '🥈' },
  { name: 'Ali Hassan', points: 1920, uploads: 65, badge: '🥉' },
  { name: 'Ayesha Khan', points: 1750, uploads: 58, badge: '⭐' },
  { name: 'Usman Tariq', points: 1580, uploads: 52, badge: '⭐' },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge animate-in">🎓 Virtual University of Pakistan</div>
          <h1 className="animate-in stagger-1">
            All-in-One <span className="gradient-text">Academic Solution</span> for VU Students
          </h1>
          <p className="animate-in stagger-2">
            Access past papers, solved assignments, MCQ practice, AI-powered study assistance, and everything you need to excel at VU — completely free.
          </p>

          <div className="search-container animate-in stagger-3">
            <div className="search-box">
              <span style={{ fontSize: '1.2rem' }}>🔍</span>
              <input type="text" placeholder="Search by subject code, teacher name, or topic..." />
              <button>Search</button>
            </div>
          </div>

          <div className="quick-access animate-in stagger-4">
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href} className="quick-btn">{link.label}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section">
        <div className="container">
          <div className="stat-grid">
            <div className="stat-card animate-in stagger-1">
              <div className="stat-number">28+</div>
              <div className="stat-label">Subjects Covered</div>
            </div>
            <div className="stat-card animate-in stagger-2">
              <div className="stat-number">2,500+</div>
              <div className="stat-label">Study Files</div>
            </div>
            <div className="stat-card animate-in stagger-3">
              <div className="stat-number">150,000+</div>
              <div className="stat-label">Total Downloads</div>
            </div>
            <div className="stat-card animate-in stagger-4">
              <div className="stat-number">5,000+</div>
              <div className="stat-label">Active Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>📢 Latest Announcements</h2>
            <p>Stay updated with important VU news and notifications</p>
          </div>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {announcements.slice(0, 4).map(a => (
              <div key={a.id} className={`announcement-card ${a.important ? 'important' : ''}`}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span className={`badge ${a.important ? 'badge-primary' : 'badge-info'}`}>
                      {a.category === 'datesheet' ? '📅' : a.category === 'result' ? '📊' : a.category === 'admission' ? '🎓' : '📢'} {a.category}
                    </span>
                    {a.important && <span className="badge badge-warning">Important</span>}
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>{a.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{a.description}</p>
                  <div className="announcement-date">{a.date}</div>
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link href="/announcements" className="btn btn-outline">View All Announcements →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TOP RATED SUBJECTS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>⭐ Top Rated Subjects</h2>
            <p>Most loved courses by VU students</p>
          </div>
          <div className="card-grid">
            {topSubjects.map((s, i) => (
              <Link key={s.code} href={`/subjects/${s.code.toLowerCase()}`} className="card subject-card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="subject-code">{s.code}</div>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <div className="subject-meta">
                  <span>⭐ {s.rating.toFixed(1)}</span>
                  <span>📥 {s.downloads.toLocaleString()}</span>
                  <span>📄 {s.totalFiles} files</span>
                  <span className={`diff-${s.difficulty.toLowerCase().replace(' ', '')}`}>{s.difficulty}</span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/subjects" className="btn btn-primary btn-lg">Browse All Subjects →</Link>
          </div>
        </div>
      </section>

      {/* MOST DOWNLOADED */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>📥 Most Downloaded</h2>
            <p>Popular study materials among VU students</p>
          </div>
          <div className="card-grid">
            {topDownloaded.map((s, i) => (
              <Link key={s.code} href={`/subjects/${s.code.toLowerCase()}`} className="card subject-card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="card-badge">🔥 Popular</div>
                <div className="subject-code">{s.code}</div>
                <h3>{s.name}</h3>
                <div className="subject-meta">
                  <span>📥 {s.downloads.toLocaleString()} downloads</span>
                  <span>⭐ {s.rating.toFixed(1)}</span>
                  <span>📄 {s.totalFiles} files</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TOP CONTRIBUTORS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>🏆 Top Contributing Students</h2>
            <p>Our community heroes who share knowledge</p>
          </div>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {leaderboard.map((s, i) => (
              <div key={i} className="leaderboard-item animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`leaderboard-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                  {s.badge}
                </div>
                <div className="leaderboard-info">
                  <div className="leaderboard-name">{s.name}</div>
                  <div className="leaderboard-stats">{s.uploads} uploads</div>
                </div>
                <div className="leaderboard-points">{s.points.toLocaleString()} pts</div>
              </div>
            ))}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link href="/leaderboard" className="btn btn-outline">View Full Leaderboard →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: '16px' }}>
            Ready to <span className="gradient-text">Ace Your Exams</span>?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 32px' }}>
            Join thousands of VU students who trust VU Academic Hub for their academic success.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/subjects" className="btn btn-primary btn-lg">Explore Subjects</Link>
            <Link href="/services" className="btn btn-secondary btn-lg">HSM Tech Services</Link>
          </div>
        </div>
      </section>
    </>
  );
}
