'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  created_at?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setFormData({ username: data.username, email: data.email || '' });
        } else {
          router.push('/login');
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      setError('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <div className="alert alert-error">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
        padding: '40px',
        borderRadius: '15px',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>👤</div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Manage your account settings and preferences
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Profile Section */}
      <div style={{
        background: 'rgba(102, 126, 234, 0.08)',
        padding: '30px',
        borderRadius: '15px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Account Information</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className="btn btn-outline btn-sm"
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {!editMode ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' }}>Username</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.username}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' }}>Email</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.email || 'Not set'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' }}>Role</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '500', textTransform: 'capitalize' }}>{user.role}</p>
            </div>
            {user.created_at && (
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' }}>Member Since</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Username</label>
              <input
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <button
              onClick={() => setEditMode(false)}
              className="btn btn-primary"
              style={{ padding: '12px 30px', cursor: 'pointer' }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Security Section */}
      <div style={{
        background: 'rgba(102, 126, 234, 0.08)',
        padding: '30px',
        borderRadius: '15px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginBottom: '20px' }}>🔒 Security</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          <Link href="/forgot-password" className="btn btn-outline" style={{ textAlign: 'center', padding: '12px' }}>
            Change Password
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ padding: '12px', cursor: 'pointer', color: '#ff6b6b' }}
          >
            Logout from This Device
          </button>
        </div>
      </div>

      {/* Preferences Section */}
      <div style={{
        background: 'rgba(102, 126, 234, 0.08)',
        padding: '30px',
        borderRadius: '15px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginBottom: '20px' }}>⚙️ Preferences</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            <span>Email notifications for announcements</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            <span>Email notifications for new resources</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            <span>Marketing emails and updates</span>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{
        background: 'rgba(255, 107, 107, 0.08)',
        padding: '30px',
        borderRadius: '15px',
        border: '1px solid rgba(255, 107, 107, 0.2)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#ff6b6b' }}>⚠️ Danger Zone</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          className="btn btn-outline"
          style={{ padding: '12px 30px', cursor: 'pointer', color: '#ff6b6b', borderColor: '#ff6b6b' }}
        >
          Delete Account Permanently
        </button>
      </div>
    </div>
  );
}
