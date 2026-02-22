'use client';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const navItems = [
    { href: '/subjects', label: 'Subjects' },
    { href: '/mcq-practice', label: 'MCQ Practice' },
    { href: '/ai-assistant', label: 'AI Assistant' },
    { href: '/resources', label: 'Resources' },
    { href: '/qna', label: 'Q&A' },
    { href: '/leaderboard', label: 'Leaderboard' },
];

interface User {
    id: string;
    username: string;
    email?: string;
}

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <>
            <header className="header">
                <div className="header-inner">
                    <Link href="/" className="logo">
                        <div className="logo-icon">VU</div>
                        <div>
                            VU Academic Hub
                            <span className="logo-subtitle">Powered by HSM Tech</span>
                        </div>
                    </Link>

                    <nav className="nav-links">
                        {navItems.map(item => (
                            <Link key={item.href} href={item.href}>{item.label}</Link>
                        ))}
                    </nav>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>

                        {!loading && (
                            <div style={{ position: 'relative' }}>
                                {user ? (
                                    <>
                                        <button
                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                            style={{
                                                background: 'var(--primary)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            👤 {user.username}
                                        </button>

                                        {userMenuOpen && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: 0,
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '8px',
                                                padding: '8px 0',
                                                marginTop: '8px',
                                                minWidth: '200px',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                                zIndex: 1000
                                            }}>
                                                <Link href="/dashboard" style={{
                                                    display: 'block',
                                                    padding: '12px 16px',
                                                    color: 'var(--text-primary)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.95rem',
                                                    transition: 'background 0.2s'
                                                }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                    📊 Dashboard
                                                </Link>
                                                <Link href="/profile" style={{
                                                    display: 'block',
                                                    padding: '12px 16px',
                                                    color: 'var(--text-primary)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.95rem',
                                                    transition: 'background 0.2s'
                                                }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                    👤 My Profile
                                                </Link>
                                                <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                                                <button
                                                    onClick={handleLogout}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#ff6b6b',
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        fontSize: '0.95rem',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    🚪 Logout
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="btn btn-outline btn-sm">
                                            Sign In
                                        </Link>
                                        <Link href="/register" className="btn btn-primary btn-sm">
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}

                        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                            <span /><span /><span />
                        </button>
                    </div>
                </div>
            </header>

            <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                        {item.label}
                    </Link>
                ))}
                {user ? (
                    <>
                        <Link href="/dashboard" onClick={() => setMobileOpen(false)}>📊 Dashboard</Link>
                        <Link href="/profile" onClick={() => setMobileOpen(false)}>👤 My Profile</Link>
                        <button onClick={handleLogout} style={{
                            width: '100%',
                            padding: '12px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}>
                            🚪 Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
                        <Link href="/register" onClick={() => setMobileOpen(false)}>Register</Link>
                    </>
                )}
                <Link href="/about" onClick={() => setMobileOpen(false)}>About</Link>
                <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
            </div>
        </>
    );
}
