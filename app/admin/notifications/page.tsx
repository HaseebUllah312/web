'use client';
import { useState } from 'react';
import Link from 'next/link';

const categories = ['general', 'datesheet', 'result', 'admission', 'scholarship', 'notice', 'important'];

export default function AdminNotificationsPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('general');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [lastNotificationCount, setLastNotificationCount] = useState(0);

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title.trim() || !description.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            // Get admin ID from localStorage or session (you'll need to implement proper auth)
            const adminId = localStorage.getItem('adminId') || '';

            const res = await fetch('/api/notifications/send', {
                method: 'POST',
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    category,
                    targetAudience: 'all'
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminId}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(`✅ Notification sent to ${data.sentCount} users!`);
                setLastNotificationCount(data.sentCount);
                // Reset form
                setTitle('');
                setDescription('');
                setCategory('general');
            } else {
                setError(data.error || 'Failed to send notification');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '900px', marginBottom: '40px' }}>
                {/* Header */}
                <div className="page-header" style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <h1>📧 Email Notifications Manager</h1>
                        <Link href="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>← Back to Admin</Link>
                    </div>
                    <p>Send email notifications to all users with notifications enabled</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid rgba(102, 126, 234, 0.2)'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 8px 0' }}>Last Batch Sent</p>
                        <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary)' }}>{lastNotificationCount}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '8px 0 0 0' }}>Users notified</p>
                    </div>

                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(52, 168, 83, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid rgba(52, 168, 83, 0.2)'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 8px 0' }}>Service Status</p>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#22c55e' }}>🟢 Active</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '8px 0 0 0' }}>Ready to send</p>
                    </div>
                </div>

                {/* Form */}
                <div className="card glass-card" style={{ marginBottom: '30px' }}>
                    <h2 style={{ marginBottom: '25px', fontSize: '1.3rem' }}>📨 Send Announcement</h2>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '20px', textAlign: 'left' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert" style={{ 
                            marginBottom: '20px', 
                            textAlign: 'left',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid #22c55e',
                            color: '#22c55e',
                            padding: '12px'
                        }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSendNotification}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>🏷️ Title</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="e.g., Spring 2026 Results Announced"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                disabled={loading}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
                                maxLength={100}
                            />
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                {title.length}/100 characters
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>📝 Description</label>
                            <textarea
                                className="form-input"
                                placeholder="Write your announcement message here..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                disabled={loading}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px',
                                    minHeight: '150px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                                maxLength={500}
                            />
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                {description.length}/500 characters
                            </p>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>🏷️ Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                disabled={loading}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem'
                                }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ 
                            background: 'rgba(255, 193, 7, 0.1)',
                            border: '1px solid rgba(255, 193, 7, 0.3)',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>⚠️ Important</p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                This will send an email to all users who have enabled email notifications. The notification will be delivered to their registered email addresses.
                            </p>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-block" 
                            style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '8px' }}
                            disabled={loading || !title.trim() || !description.trim()}
                        >
                            {loading ? (
                                <>
                                    <span style={{ marginRight: '8px' }}>📤</span>
                                    Sending Notifications...
                                </>
                            ) : (
                                <>
                                    <span style={{ marginRight: '8px' }}>📧</span>
                                    Send to All Users
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Preview */}
                <div className="card glass-card">
                    <h3 style={{ marginBottom: '15px' }}>👁️ Email Preview</h3>
                    <div style={{ 
                        background: '#f9f9f9', 
                        padding: '20px', 
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)'
                    }}>
                        {title || description ? (
                            <>
                                <p><strong>Subject:</strong> VU Academic Hub - {category.toUpperCase()}: {title || '[Notification Title]'}</p>
                                <hr style={{ borderColor: 'var(--border)', margin: '15px 0' }} />
                                <p><strong>Preview:</strong></p>
                                <p>{description || 'Your announcement text will appear here...'}</p>
                                <hr style={{ borderColor: 'var(--border)', margin: '15px 0' }} />
                                <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                                    © 2026 VU Academic Hub - Powered by HSM TECH<br />
                                    You're receiving this because you have email notifications enabled.
                                </p>
                            </>
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                Fill in the form above to see a preview of your email
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
