import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h4>📚 VU Academic Hub</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            Your all-in-one academic companion for Virtual University of Pakistan. Access study materials, practice MCQs, and boost your grades.
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Powered by HSM Tech</p>
                    </div>
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link href="/subjects">Subject Library</Link></li>
                            <li><Link href="/mcq-practice">MCQ Practice</Link></li>
                            <li><Link href="/tools">Academic Tools</Link></li>
                            <li><Link href="/upload">Upload Files</Link></li>
                            <li><Link href="/qna">Q&A Forum</Link></li>
                            <li><Link href="/ai-assistant">AI Assistant</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Resources</h4>
                        <ul className="footer-links">
                            <li><Link href="/announcements">Announcements</Link></li>
                            <li><Link href="/leaderboard">Leaderboard</Link></li>
                            <li><Link href="/lms-guide">LMS Guides</Link></li>
                            <li><Link href="/tough-subjects">Tough Subjects</Link></li>
                            <li><Link href="/semester-planner">Semester Planner</Link></li>
                            <li><Link href="/past-paper-analyzer">Past Paper Analyzer</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Contact HSM Tech</h4>
                        <ul className="footer-links">
                            <li>📱 <a href="https://wa.me/923177180123" target="_blank" rel="noopener">+92 317 7180123</a></li>
                            <li>📧 <a href="mailto:haseebsaleem312@gmail.com">haseebsaleem312@gmail.com</a></li>
                            <li><Link href="/services">Our Services</Link></li>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>© 2026 VU Academic Hub. Powered by HSM Tech. All rights reserved.</span>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms & Conditions</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
