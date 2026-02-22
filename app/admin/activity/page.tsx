'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ActivityLog {
    id: string;
    type: 'user' | 'content' | 'system' | 'security';
    title: string;
    description: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    actor?: string;
}

export default function ActivityPage() {
    const [activities] = useState<ActivityLog[]>([
        {
            id: '1',
            type: 'user',
            title: 'User Registration',
            description: 'Ahmed Khan registered as a new student',
            timestamp: '2024-01-15 10:30:00',
            severity: 'success',
            actor: 'Ahmed Khan'
        },
        {
            id: '2',
            type: 'content',
            title: 'File Upload',
            description: 'MTH101 Study Guide uploaded - 1.2 MB',
            timestamp: '2024-01-15 09:45:00',
            severity: 'success',
            actor: 'Fatima Ali'
        },
        {
            id: '3',
            type: 'system',
            title: 'Backup Completed',
            description: 'Daily database backup completed successfully',
            timestamp: '2024-01-15 08:00:00',
            severity: 'info'
        },
        {
            id: '4',
            type: 'security',
            title: 'Failed Login Attempt',
            description: '5 failed login attempts from 192.168.1.100',
            timestamp: '2024-01-15 07:30:00',
            severity: 'warning',
            actor: 'Unknown'
        },
        {
            id: '5',
            type: 'user',
            title: 'Account Suspended',
            description: 'User account suspended due to policy violation',
            timestamp: '2024-01-15 06:15:00',
            severity: 'error',
            actor: 'Admin'
        },
        {
            id: '6',
            type: 'content',
            title: 'Content Approved',
            description: 'Quiz material approved and published',
            timestamp: '2024-01-15 05:00:00',
            severity: 'success',
            actor: 'Content Moderator'
        }
    ]);

    const [filterType, setFilterType] = useState<'all' | 'user' | 'content' | 'system' | 'security'>('all');
    const [filterSeverity, setFilterSeverity] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

    const filteredActivities = activities.filter(activity => {
        const typeMatch = filterType === 'all' || activity.type === filterType;
        const severityMatch = filterSeverity === 'all' || activity.severity === filterSeverity;
        return typeMatch && severityMatch;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'success': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', icon: '✅' };
            case 'info': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', icon: 'ℹ️' };
            case 'warning': return { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316', icon: '⚠️' };
            case 'error': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', icon: '❌' };
            default: return { bg: 'rgba(102, 126, 234, 0.1)', text: '#667eea', icon: '•' };
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'user': return '👤';
            case 'content': return '📄';
            case 'system': return '⚙️';
            case 'security': return '🔒';
            default: return '•';
        }
    };

    return (
        <main className="page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📋 Activity Log</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>View all platform activities and events</p>
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
                        Activity Type
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
                        <option value="user">User Activity</option>
                        <option value="content">Content Activity</option>
                        <option value="system">System Activity</option>
                        <option value="security">Security Events</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                        Severity Level
                    </label>
                    <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value as any)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="all">All Severities</option>
                        <option value="success">Success</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <button style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        width: '100%'
                    }}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Activity Timeline */}
            <div style={{
                position: 'relative',
                paddingLeft: '40px'
            }}>
                {filteredActivities.map((activity, idx) => {
                    const colors = getSeverityColor(activity.severity);
                    return (
                        <div
                            key={activity.id}
                            style={{
                                marginBottom: '30px',
                                paddingBottom: idx < filteredActivities.length - 1 ? '30px' : '0',
                                borderLeft: idx < filteredActivities.length - 1 ? '2px solid rgba(102, 126, 234, 0.2)' : 'none',
                                position: 'relative'
                            }}
                        >
                            {/* Timeline dot */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '-48px',
                                    top: '0',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: colors.bg,
                                    border: `2px solid ${colors.text}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px'
                                }}
                            >
                                {colors.icon}
                            </div>

                            {/* Activity Card */}
                            <div
                                style={{
                                    background: 'rgba(102, 126, 234, 0.08)',
                                    border: `1px solid ${colors.bg}`,
                                    borderRadius: '12px',
                                    padding: '20px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start', flex: 1 }}>
                                        <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(activity.type)}</span>
                                        <div>
                                            <h3 style={{ fontWeight: '600', margin: '0 0 4px 0', fontSize: '1.1rem' }}>
                                                {activity.title}
                                            </h3>
                                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                                                {activity.description}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            background: colors.bg,
                                            color: colors.text,
                                            padding: '4px 12px',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {activity.severity}
                                    </span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '12px',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <span>{activity.timestamp}</span>
                                    {activity.actor && <span>👤 {activity.actor}</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredActivities.length === 0 && (
                <div style={{
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No activities found</p>
                </div>
            )}
        </main>
    );
}
