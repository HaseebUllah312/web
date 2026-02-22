'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ModerationItem {
    id: string;
    type: 'content' | 'user' | 'comment';
    title: string;
    reportedBy: string;
    reason: string;
    description: string;
    reportDate: string;
    status: 'pending' | 'reviewed' | 'approved' | 'rejected';
}

export default function ModerationPage() {
    const [items, setItems] = useState<ModerationItem[]>([
        {
            id: '1',
            type: 'content',
            title: 'CS101 Study Material',
            reportedBy: 'Ali Hassan',
            reason: 'Inappropriate Content',
            description: 'Contains offensive language and inappropriate jokes',
            reportDate: '2024-01-15',
            status: 'pending'
        },
        {
            id: '2',
            type: 'user',
            title: 'User: Ahmad Khan',
            reportedBy: 'Fatima Ali',
            reason: 'Harassment',
            description: 'User made harassing comments in forum',
            reportDate: '2024-01-14',
            status: 'reviewed'
        },
        {
            id: '3',
            type: 'comment',
            title: 'Q&A Forum Comment',
            reportedBy: 'System Auto-flag',
            reason: 'Spam',
            description: 'Multiple promotional links and spam content',
            reportDate: '2024-01-13',
            status: 'pending'
        }
    ]);

    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'approved' | 'rejected'>('all');
    const [filterType, setFilterType] = useState<'all' | 'content' | 'user' | 'comment'>('all');

    const filteredItems = items.filter(item => {
        const statusMatch = filterStatus === 'all' || item.status === filterStatus;
        const typeMatch = filterType === 'all' || item.type === filterType;
        return statusMatch && typeMatch;
    });

    const handleApprove = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, status: 'approved' } : item
        ));
    };

    const handleReject = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, status: 'rejected' } : item
        ));
    };

    return (
        <main className="page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🚨 Moderation Center</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Review and manage community reports</p>
                </div>
                <Link href="/admin">
                    <button style={{
                        background: 'transparent',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}>
                        ← Back to Dashboard
                    </button>
                </Link>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '30px'
            }}>
                {[
                    { label: 'Pending Review', value: '12', icon: '⏳', color: 'rgba(249, 115, 22, 0.1)' },
                    { label: 'Reviewed', value: '45', icon: '👀', color: 'rgba(59, 130, 246, 0.1)' },
                    { label: 'Approved', value: '23', icon: '✅', color: 'rgba(34, 197, 94, 0.1)' },
                    { label: 'Rejected', value: '22', icon: '🚫', color: 'rgba(239, 68, 68, 0.1)' }
                ].map((stat, idx) => (
                    <div key={idx} style={{
                        background: stat.color,
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '1.5rem', margin: '0 0 8px 0' }}>{stat.icon}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 4px 0' }}>
                            {stat.label}
                        </p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{
                background: 'rgba(102, 126, 234, 0.08)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                        Status
                    </label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending Review</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                        Type
                    </label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="all">All Types</option>
                        <option value="content">Content</option>
                        <option value="user">User</option>
                        <option value="comment">Comment</option>
                    </select>
                </div>
            </div>

            {/* Moderation Queue */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '20px'
            }}>
                {filteredItems.length === 0 ? (
                    <div style={{
                        background: 'rgba(102, 126, 234, 0.08)',
                        borderRadius: '12px',
                        padding: '40px',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No items to review</p>
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const typeColor = item.type === 'content' ? '#3b82f6' :
                                        item.type === 'user' ? '#ef4444' :
                                        '#f97316';
                        const typeIcon = item.type === 'content' ? '📄' :
                                       item.type === 'user' ? '👤' :
                                       '💬';

                        const statusColor = item.status === 'pending' ? 'rgba(249, 115, 22, 0.1)' :
                                          item.status === 'reviewed' ? 'rgba(59, 130, 246, 0.1)' :
                                          item.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                                          'rgba(239, 68, 68, 0.1)';

                        return (
                            <div
                                key={item.id}
                                style={{
                                    background: statusColor,
                                    borderRadius: '12px',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                    padding: '25px'
                                }}
                            >
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.5rem' }}>{typeIcon}</span>
                                            <div>
                                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{item.title}</h3>
                                                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                                                    Reported by: <strong>{item.reportedBy}</strong>
                                                </p>
                                            </div>
                                        </div>
                                        <span style={{
                                            background: typeColor,
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}>
                                            {item.type}
                                        </span>
                                    </div>

                                    <div style={{
                                        background: 'rgba(102, 126, 234, 0.1)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        marginBottom: '15px'
                                    }}>
                                        <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>
                                            Reason: <span style={{ color: '#f97316', fontWeight: 'bold' }}>{item.reason}</span>
                                        </p>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {item.description}
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                                        Reported: {item.reportDate} | Status: <strong>{item.status}</strong>
                                    </p>

                                    {item.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => handleApprove(item.id)}
                                                style={{
                                                    background: 'rgba(34, 197, 94, 0.2)',
                                                    border: '1px solid #22c55e',
                                                    color: '#22c55e',
                                                    padding: '8px 16px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                ✅ Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(item.id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    border: '1px solid #ef4444',
                                                    color: '#ef4444',
                                                    padding: '8px 16px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                ❌ Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </main>
    );
}
