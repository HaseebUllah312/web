'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ContentItem {
    id: string;
    title: string;
    type: 'material' | 'announcement' | 'quiz';
    subject: string;
    uploadedBy: string;
    uploadDate: string;
    status: 'approved' | 'pending' | 'rejected';
    size?: string;
}

export default function ContentManagementPage() {
    const [contents, setContents] = useState<ContentItem[]>([
        {
            id: '1',
            title: 'CS101 Midterm Review',
            type: 'material',
            subject: 'CS101',
            uploadedBy: 'Ahmed Khan',
            uploadDate: '2024-01-15',
            status: 'approved',
            size: '2.4 MB'
        },
        {
            id: '2',
            title: 'Calculus Chapter 5 Solutions',
            type: 'material',
            subject: 'MTH101',
            uploadedBy: 'Fatima Ali',
            uploadDate: '2024-01-14',
            status: 'pending',
            size: '1.8 MB'
        }
    ]);

    const [filterType, setFilterType] = useState<'all' | 'material' | 'announcement' | 'quiz'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredContents = contents.filter(item => {
        const matchType = filterType === 'all' || item.type === filterType;
        const matchStatus = filterStatus === 'all' || item.status === filterStatus;
        const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchType && matchStatus && matchSearch;
    });

    const handleApproveContent = (id: string) => {
        setContents(contents.map(item =>
            item.id === id ? { ...item, status: 'approved' } : item
        ));
    };

    const handleRejectContent = (id: string) => {
        setContents(contents.map(item =>
            item.id === id ? { ...item, status: 'rejected' } : item
        ));
    };

    const handleDeleteContent = (id: string) => {
        setContents(contents.filter(item => item.id !== id));
    };

    return (
        <main className="page" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📚 Content Management</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage subjects, materials, and user uploads</p>
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

            {/* Quick Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '30px'
            }}>
                {[
                    { label: 'Total Materials', value: '1,247', icon: '📄' },
                    { label: 'Pending Review', value: '23', icon: '⏳' },
                    { label: 'Total Subjects', value: '12', icon: '📚' },
                    { label: 'Featured Content', value: '18', icon: '⭐' }
                ].map((stat, idx) => (
                    <div key={idx} style={{
                        background: 'rgba(102, 126, 234, 0.08)',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '1.5rem', margin: 0 }}>{stat.icon}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '8px 0 4px 0' }}>
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
                        Search
                    </label>
                    <input
                        type="text"
                        placeholder="Search content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    />
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
                        <option value="material">Materials</option>
                        <option value="announcement">Announcements</option>
                        <option value="quiz">Quizzes</option>
                    </select>
                </div>

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
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Content Table */}
            <div style={{
                background: 'rgba(102, 126, 234, 0.08)',
                borderRadius: '12px',
                border: '1px solid rgba(102, 126, 234, 0.2)',
                overflow: 'hidden'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.95rem'
                }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(102, 126, 234, 0.2)', background: 'rgba(102, 126, 234, 0.05)' }}>
                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Title</th>
                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Type</th>
                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Subject</th>
                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Uploaded By</th>
                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContents.map((content) => (
                            <tr key={content.id} style={{ borderBottom: '1px solid rgba(102, 126, 234, 0.1)' }}>
                                <td style={{ padding: '15px', fontWeight: '500' }}>{content.title}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        background: content.type === 'material' ? 'rgba(34, 197, 94, 0.1)' :
                                                   content.type === 'announcement' ? 'rgba(59, 130, 246, 0.1)' :
                                                   'rgba(249, 115, 22, 0.1)',
                                        color: content.type === 'material' ? '#22c55e' :
                                               content.type === 'announcement' ? '#3b82f6' :
                                               '#f97316',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem'
                                    }}>
                                        {content.type === 'material' ? '📄' : content.type === 'announcement' ? '📢' : '✅'} {content.type}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>{content.subject}</td>
                                <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>{content.uploadedBy}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        background: content.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                                                   content.status === 'pending' ? 'rgba(249, 115, 22, 0.1)' :
                                                   'rgba(239, 68, 68, 0.1)',
                                        color: content.status === 'approved' ? '#22c55e' :
                                               content.status === 'pending' ? '#f97316' :
                                               '#ef4444',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem'
                                    }}>
                                        {content.status === 'approved' ? '✅' : content.status === 'pending' ? '⏳' : '❌'} {content.status}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    {content.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApproveContent(content.id)}
                                                style={{
                                                    background: 'rgba(34, 197, 94, 0.2)',
                                                    border: '1px solid #22c55e',
                                                    color: '#22c55e',
                                                    padding: '6px 12px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    marginRight: '5px',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectContent(content.id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    border: '1px solid #ef4444',
                                                    color: '#ef4444',
                                                    padding: '6px 12px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleDeleteContent(content.id)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            fontSize: '0.85rem',
                                            marginLeft: content.status === 'pending' ? '5px' : '0'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredContents.length === 0 && (
                <div style={{
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center',
                    marginTop: '20px'
                }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No content found</p>
                </div>
            )}
        </main>
    );
}
