'use client';
import { useState } from 'react';

const modes = [
    { id: 'quick', label: '⚡ Quick Answer', desc: 'Short, direct answers' },
    { id: 'detailed', label: '📖 Detailed', desc: 'In-depth explanations' },
    { id: 'exam', label: '📝 Exam Prep', desc: 'Exam-focused guidance' },
    { id: 'quiz', label: '🧠 Quiz Mode', desc: 'Practice questions' },
];

export default function AIAssistantPage() {
    const [mode, setMode] = useState('quick');
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! 👋 I\'m your VU AI Study Assistant powered by HSM Tech. I can help you with:\n\n📚 Concept clarification\n🧠 MCQ practice\n📝 Assignment guidance\n❓ Quiz preparation\n📊 Exam tips & strategies\n📄 Past paper analysis\n\nSelect a mode above and ask me anything!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, mode }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'bot', text: data.reply || 'Sorry, I could not process that.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: 'Connection error. Please try again.' }]);
        }
        setLoading(false);
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header">
                    <h1>🤖 AI Study Assistant</h1>
                    <p>Your personal AI tutor for VU subjects — powered by Gemini AI</p>
                </div>

                {/* Mode Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                    {modes.map(m => (
                        <button key={m.id} className={`card ${mode === m.id ? '' : ''}`} onClick={() => setMode(m.id)}
                            style={{ padding: '14px', cursor: 'pointer', textAlign: 'center', border: mode === m.id ? '2px solid var(--accent-primary)' : undefined, background: mode === m.id ? 'var(--accent-glow)' : undefined }}>
                            <div style={{ fontSize: '1.2rem' }}>{m.label}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.desc}</div>
                        </button>
                    ))}
                </div>

                {/* Chat Area */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', background: 'var(--accent-gradient)', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                        <strong>🤖 VU AI Assistant ({modes.find(m => m.id === mode)?.label})</strong>
                        <button onClick={() => setMessages([messages[0]])} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.82rem' }}>Clear Chat</button>
                    </div>

                    <div style={{ minHeight: '400px', maxHeight: '500px', overflowY: 'auto', padding: '20px' }}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.role === 'user' ? 'user' : 'bot'}`}>
                                <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-msg bot">
                                <div className="chat-bubble">Thinking... ✨</div>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
                        <input className="form-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask me anything about your VU subjects..." disabled={loading} style={{ borderRadius: 'var(--radius-full)' }} />
                        <button className="btn btn-primary" onClick={sendMessage} disabled={loading}>Send ➤</button>
                    </div>
                </div>

                {/* Suggestion Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                    {['Explain OOP concepts', 'CS101 midterm tips', 'Practice MCQs for STA301', 'How to solve NPV problems?', 'Important topics CS403'].map(s => (
                        <button key={s} className="quick-btn" onClick={() => { setInput(s); }}>{s}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}
