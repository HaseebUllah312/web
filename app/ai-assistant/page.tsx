'use client';
import { useState, useRef, useEffect } from 'react';

const modes = [
    { id: 'quick', label: '⚡ Quick Answer', desc: 'Short, direct answers' },
    { id: 'detailed', label: '📖 Detailed', desc: 'In-depth explanations' },
    { id: 'exam', label: '📝 Exam Prep', desc: 'Exam-focused guidance' },
    { id: 'quiz', label: '🧠 Quiz Mode', desc: 'Practice questions' },
];

const WELCOME = 'Hello! 👋 I\'m your **VU AI Study Assistant** powered by HSM Tech & Gemini AI.\n\nI can help you with:\n📚 Any VU subject (CS, IT, Math, Management, English...)\n🧠 MCQ practice & quiz generation\n📝 Assignment & GDB understanding\n❓ Concept clarification\n📊 Exam tips & past paper patterns\n\nSelect a mode above and ask me anything — in Urdu or English! 🎓';

export default function AIAssistantPage() {
    const [mode, setMode] = useState('quick');
    const [messages, setMessages] = useState([
        { role: 'bot', text: WELCOME }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Handle initial query from URL (e.g., ?q=Topic)
    useEffect(() => {
        const query = new URLSearchParams(window.location.search).get('q');
        if (query && messages.length === 1) {
            handleSendMessage(query);
        }
    }, []);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || loading) return;

        const newMessages = [...messages, { role: 'user', text }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    mode,
                    // Filter history to exclude the initial bot welcome message for cleaner context
                    history: messages.slice(1),
                }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'bot', text: data.reply || 'Sorry, I could not process that.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Connection error. Please check your internet and try again.' }]);
        }
        setLoading(false);
    };

    const sendMessage = () => {
        if (!input.trim()) return;
        const msg = input.trim();
        setInput('');
        handleSendMessage(msg);
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
                        <div ref={chatEndRef} />
                    </div>

                    <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
                        <input className="form-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask me anything about your VU subjects..." disabled={loading} style={{ borderRadius: 'var(--radius-full)' }} />
                        <button className="btn btn-primary" onClick={sendMessage} disabled={loading}>Send ➤</button>
                    </div>
                </div>

                {/* Suggestion Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                    {[
                        'Explain OOP concepts for CS304',
                        'STA301 midterm important topics',
                        'Generate 5 MCQs on linked lists',
                        'How to solve NPV in FIN622?',
                        'CS402 important topics for exam',
                        'Explain database normalization',
                        'MTH101 calculus exam prep',
                        'What is OSI model? CS601',
                    ].map(s => (
                        <button key={s} className="quick-btn" onClick={() => { setInput(s); }}>{s}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}
