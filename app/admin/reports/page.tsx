'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState('last-7-days');

    const reportTypes = [
        {
            id: 'user-growth',
            title: 'User Growth Report',
            description: 'Track user registrations, growth rate, and retention',
            icon: '📈'
        },
        {
            id: 'engagement',
            title: 'Engagement Report',
            description: 'Feature usage, session duration, and activity metrics',
            icon: '🎯'
        },
        {
            id: 'content',
            title: 'Content Report',
            description: 'Materials uploaded, downloads, and usage statistics',
            icon: '📚'
        },
        {
            id: 'performance',
            title: 'Performance Report',
            description: 'Server uptime, API response times, and error rates',
            icon: '⚡'
        },
        {
            id: 'revenue',
            title: 'Revenue Report',
            description: 'Transaction data, subscription info, and payment methods',
            icon: '💰'
        },
        {
            id: 'security',
            title: 'Security Report',
            description: 'Login attempts, security events, and anomalies',
            icon: '🔒'
        }
    ];

    return (
        <main className="page" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊 Reports Center</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Generate and view detailed reports</p>
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

            {/* Date Range Filter */}
            <div style={{
                background: 'rgba(102, 126, 234, 0.08)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px'
            }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
                    Select Date Range
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[
                        { value: 'last-7-days', label: 'Last 7 Days' },
                        { value: 'last-30-days', label: 'Last 30 Days' },
                        { value: 'last-quarter', label: 'Last Quarter' },
                        { value: 'last-year', label: 'Last Year' },
                        { value: 'custom', label: 'Custom Range' }
                    ].map(option => (
                        <button
                            key={option.value}
                            onClick={() => setDateRange(option.value)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: dateRange === option.value ? '2px solid var(--primary)' : '1px solid rgba(102, 126, 234, 0.3)',
                                background: dateRange === option.value ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Report Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
            }}>
                {reportTypes.map((report) => (
                    <div
                        key={report.id}
                        onClick={() => setSelectedReport(report.id)}
                        style={{
                            background: 'rgba(102, 126, 234, 0.08)',
                            borderRadius: '12px',
                            border: selectedReport === report.id ? '2px solid var(--primary)' : '1px solid rgba(102, 126, 234, 0.2)',
                            padding: '25px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
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
                        <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{report.icon}</div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', margin: '0 0 8px 0' }}>
                            {report.title}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
                            {report.description}
                        </p>
                        <button style={{
                            background: selectedReport === report.id ? 'var(--primary)' : 'transparent',
                            color: selectedReport === report.id ? 'white' : 'var(--primary)',
                            border: `1px solid ${selectedReport === report.id ? 'var(--primary)' : 'rgba(102, 126, 234, 0.3)'}`,
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            width: '100%'
                        }}>
                            {selectedReport === report.id ? '✅ Selected' : 'Select Report'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Generate Button */}
            {selectedReport && (
                <div style={{ marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '12px 40px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem'
                    }}>
                        📊 Generate Report
                    </button>
                    <button style={{
                        background: 'transparent',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        color: 'var(--text-primary)',
                        padding: '12px 40px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}>
                        📥 Download as CSV
                    </button>
                    <button style={{
                        background: 'transparent',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        color: 'var(--text-primary)',
                        padding: '12px 40px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}>
                        📄 Download as PDF
                    </button>
                </div>
            )}

            {selectedReport && (
                <div style={{
                    marginTop: '40px',
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    padding: '30px'
                }}>
                    <h2 style={{ marginBottom: '20px' }}>
                        {reportTypes.find(r => r.id === selectedReport)?.icon} {reportTypes.find(r => r.id === selectedReport)?.title}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        Report for {dateRange.replace('-', ' ')}
                    </p>

                    {/* Sample Report Content */}
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '20px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ marginBottom: '10px' }}>Key Metrics</h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '15px'
                            }}>
                                {[
                                    { label: 'Total', value: '5,420' },
                                    { label: 'Growth', value: '+12%' },
                                    { label: 'Active', value: '3,680' },
                                    { label: 'Avg Duration', value: '22 min' }
                                ].map((metric, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(102, 126, 234, 0.1)',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 8px 0' }}>
                                            {metric.label}
                                        </p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                                            {metric.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ marginBottom: '10px' }}>Summary</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                This report provides detailed insights into platform {selectedReport} metrics. 
                                The data is collected from all user interactions and system events during the selected period.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
