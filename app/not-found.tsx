import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Page Not Found | VU Academic Hub',
};

export default function NotFound() {
    return (
        <div className="page" style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
        }}>
            <div className="container">
                <div style={{
                    fontSize: '6rem',
                    fontWeight: '900',
                    background: 'var(--accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '20px'
                }}>
                    404
                </div>
                <h1 style={{ marginBottom: '16px', fontSize: '2rem' }}>Oops! Page Not Found</h1>
                <p style={{
                    color: 'var(--text-secondary)',
                    maxWidth: '500px',
                    margin: '0 auto 32px',
                    fontSize: '1.1rem'
                }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link href="/" className="btn btn-primary btn-lg">
                    Go Back Home
                </Link>
            </div>
        </div>
    );
}
