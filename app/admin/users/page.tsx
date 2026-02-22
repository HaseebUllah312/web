'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    provider: string;
    created_at: string;
    is_email_verified: boolean;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [providerFilter, setProviderFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = selectedRole === 'all' || user.role === selectedRole;
        const matchProvider = providerFilter === 'all' || user.provider === providerFilter;
        return matchSearch && matchRole && matchProvider;
    });

    const handleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u.id));
        }
    };

    const handleBulkAction = async (action: string) => {
        if (!selectedUsers.length) return;

        try {
            const response = await fetch('/api/admin/users/bulk-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: selectedUsers, action })
            });

            if (response.ok) {
                fetchUsers();
                setSelectedUsers([]);
                alert(`${action} completed for ${selectedUsers.length} users`);
            }
        } catch (error) {
            console.error('Error performing bulk action:', error);
        }
    };

    return (
        <main className="page" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👥 User Management</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage platform users and permissions</p>
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

            {/* Search and Filter */}
            <div style={{
                background: 'rgba(102, 126, 234, 0.08)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px',
                alignItems: 'end'
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.95rem' }}>
                        🔍 Search Users
                    </label>
                    <input
                        type="text"
                        placeholder="Search by email or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.95rem' }}>
                        Filter by Role
                    </label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="all">All Roles</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="student">Student</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.95rem' }}>
                        🔑 Filter by Provider
                    </label>
                    <select
                        value={providerFilter}
                        onChange={(e) => setProviderFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="all">All Providers</option>
                        <option value="google">🔵 Google (Gmail) only</option>
                        <option value="email">📧 Email only</option>
                    </select>
                </div>

                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px' }}>
                        {filteredUsers.length} users found
                    </p>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <p style={{ fontWeight: '500' }}>
                        ✅ {selectedUsers.length} user(s) selected
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => handleBulkAction('suspend')}
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
                            🚫 Suspend
                        </button>
                        <button
                            onClick={() => handleBulkAction('promote-admin')}
                            style={{
                                background: 'rgba(102, 126, 234, 0.2)',
                                border: '1px solid #667eea',
                                color: '#667eea',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            ⭐ Make Admin
                        </button>
                        <button
                            onClick={() => handleBulkAction('demote')}
                            style={{
                                background: 'rgba(168, 85, 247, 0.2)',
                                border: '1px solid #a855f7',
                                color: '#a855f7',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            ⬇️ Demote
                        </button>
                    </div>
                </div>
            )}

            {/* Users Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Loading users...</p>
                </div>
            ) : (
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
                                <th style={{ padding: '15px', textAlign: 'left', width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>User Info</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Provider</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Role</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Joined</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(102, 126, 234, 0.1)' }}>
                                    <td style={{ padding: '15px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => handleSelectUser(user.id)}
                                        />
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div>
                                            <p style={{ fontWeight: '500', margin: '0 0 4px 0' }}>{user.username}</p>
                                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>{user.email}</p>
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            background: user.provider === 'google' ? 'rgba(66, 133, 244, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                            color: user.provider === 'google' ? '#4285F4' : '#22c55e',
                                            padding: '5px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.82rem',
                                            fontWeight: '500'
                                        }}>
                                            {user.provider === 'google' ? '🔵 Google' : '📧 Email'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            background: user.role === 'owner' ? 'rgba(239, 68, 68, 0.1)' :
                                                user.role === 'admin' ? 'rgba(102, 126, 234, 0.1)' :
                                                    'rgba(34, 197, 94, 0.1)',
                                            color: user.role === 'owner' ? '#ef4444' :
                                                user.role === 'admin' ? '#667eea' :
                                                    '#22c55e',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}>
                                            {user.role === 'owner' ? '👑' : user.role === 'admin' ? '⭐' : '👤'} {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            background: user.is_email_verified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: user.is_email_verified ? '#22c55e' : '#ef4444',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {user.is_email_verified ? '✅ Verified' : '⏳ Pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--primary)',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            textDecoration: 'underline'
                                        }}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredUsers.length === 0 && !loading && (
                <div style={{
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No users found</p>
                </div>
            )}
        </main>
    );
}
