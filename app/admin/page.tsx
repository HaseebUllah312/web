'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { verifySession } from '@/app/lib/session';

export default function AdminPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check authentication
        async function checkAuth() {
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                
                if (!data.user || (data.user.role !== 'admin' && data.user.role !== 'owner')) {
                    router.push('/dashboard');
                } else {
                    setCurrentUser(data.user);
                }
            } catch (error) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        }
        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <main className="page">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Loading admin dashboard...</p>
                </div>
            </main>
        );
    }

    if (!currentUser) {
        return null;
    }

    return (
        <main className="page" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Admin Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '40px',
                borderRadius: '15px',
                marginBottom: '40px'
            }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚙️ Admin Dashboard</h1>
                <p style={{ fontSize: '1.1rem', opacity: 0.9, margin: '0 0 15px 0' }}>Welcome back, {currentUser.username}. Manage your platform here.</p>
            </div>

            {/* Key Metrics */}
            <section style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>📊 Platform Overview</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        padding: '30px',
                        borderRadius: '15px',
                        border: '1px solid rgba(102, 126, 234, 0.2)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👥</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' }}>Total Users</p>
                        <p style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>5,420</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>↑ 12% from last month</p>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                        padding: '30px',
                        borderRadius: '15px',
                        border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📁</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' }}>Study Materials</p>
                        <p style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>12,847</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>↑ 234 uploaded this month</p>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                        padding: '30px',
                        borderRadius: '15px',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' }}>Quizzes Taken</p>
                        <p style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>28,956</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>↑ 18% increase</p>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
                        padding: '30px',
                        borderRadius: '15px',
                        border: '1px solid rgba(236, 72, 153, 0.2)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⭐</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' }}>Avg Rating</p>
                        <p style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>4.8/5</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>Based on 2,340 reviews</p>
                    </div>
                </div>
            </section>

            {/* Admin Tools */}
            <section style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>🛠️ Admin Tools</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                }}>
                    {[
                        { icon: '👥', label: 'User Management', href: '/admin/users', color: 'rgba(102, 126, 234, 0.1)', borderColor: 'rgba(102, 126, 234, 0.2)' },
                        { icon: '📊', label: 'Analytics', href: '/admin/analytics', color: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' },
                        { icon: '📄', label: 'Reports', href: '/admin/reports', color: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' },
                        { icon: '📚', label: 'Content Manager', href: '/admin/content', color: 'rgba(236, 72, 153, 0.1)', borderColor: 'rgba(236, 72, 153, 0.2)' },
                        { icon: '🔔', label: 'Notifications', href: '/admin/notifications', color: 'rgba(249, 115, 22, 0.1)', borderColor: 'rgba(249, 115, 22, 0.2)' },
                        { icon: '⚙️', label: 'Settings', href: '/admin/settings', color: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.2)' },
                        { icon: '📋', label: 'Activity Log', href: '/admin/activity', color: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.2)' },
                        { icon: '🚨', label: 'Moderation', href: '/admin/moderation', color: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }
                    ].map((tool, idx) => (
                        <div
                            key={idx}
                            onClick={() => router.push(tool.href)}
                            style={{
                                background: tool.color,
                                border: `1px solid ${tool.borderColor}`,
                                padding: '25px',
                                borderRadius: '12px',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e: any) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e: any) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ fontSize: '2rem' }}>{tool.icon}</div>
                            <p style={{ margin: 0, fontWeight: '500', textAlign: 'center' }}>{tool.label}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
