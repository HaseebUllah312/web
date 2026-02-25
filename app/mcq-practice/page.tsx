'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { subjects } from '@/data/subjects';
import { mcqs, getRandomMCQs } from '@/data/mcqs';
import VUExamMode from './VUExamMode';

export default function MCQPracticePage() {
    const [stage, setStage] = useState<'setup' | 'vu-exam' | 'quiz' | 'result'>('setup');
    const [loading, setLoading] = useState(false);
    const [allSubjects, setAllSubjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('CS101');
    const [examMode, setExamMode] = useState<'practice' | 'vu-style'>('practice');

    useEffect(() => {
        fetch('/api/subjects').then(r => r.json()).then(setAllSubjects);
    }, []);
    const [selectedType, setSelectedType] = useState<'midterm' | 'final'>('midterm');
    const [selectionMode, setSelectionMode] = useState<'exam' | 'lecture' | 'topic'>('exam');
    const [lectureRange, setLectureRange] = useState('1-22');
    const [customTopic, setCustomTopic] = useState('');
    const [questionCount, setQuestionCount] = useState(20);
    const [timerEnabled, setTimerEnabled] = useState(true);
    const [questions, setQuestions] = useState<typeof mcqs>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [showExplanation, setShowExplanation] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);

    const finishQuiz = useCallback(() => {
        let s = 0;
        questions.forEach((q, i) => { if (answers[i] === q.correct) s++; });
        setScore(s);
        setStage('result');
    }, [questions, answers]);

    useEffect(() => {
        if (stage !== 'quiz' || !timerEnabled || timeLeft <= 0) return;
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { finishQuiz(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [stage, timerEnabled, timeLeft, finishQuiz]);

    const startQuiz = async () => {
        setLoading(true);
        try {
            let loadedQuestions: any[] = [];

            // Fetch from API (tries local JSON first for exam mode, else AI-generates)
            let apiUrl = `/api/quiz/data?subject=${selectedSubject}&count=${questionCount}`;

            if (selectionMode === 'exam') {
                apiUrl += `&type=${selectedType}`;
            } else if (selectionMode === 'lecture') {
                apiUrl += `&lec=${encodeURIComponent(lectureRange)}`;
            } else if (selectionMode === 'topic') {
                apiUrl += `&topic=${encodeURIComponent(customTopic)}`;
            }

            const res = await fetch(apiUrl);

            if (res.ok) {
                const data = await res.json();

                if (data.error) {
                    alert(`Could not load questions: ${data.error}`);
                    setLoading(false);
                    return;
                }

                // Flatten topics → questions array
                const allQs = (data.topics || []).flatMap((t: any) =>
                    (t.questions || []).map((q: any) => ({
                        ...q,
                        topic: t.name,
                        subject: selectedSubject,
                        type: t.term?.toLowerCase().includes('mid') ? 'midterm' : 'final',
                    }))
                );

                // Filter by selected type
                loadedQuestions = allQs.filter((q: any) =>
                    q.type === selectedType || (data.term?.toLowerCase().includes('mid') ? 'midterm' : 'final') === selectedType
                );

                // If no type match, use all (AI generates for specific type)
                if (loadedQuestions.length === 0) loadedQuestions = allQs;

            } else {
                // Fallback to static MCQs
                loadedQuestions = getRandomMCQs(selectedSubject, selectedType, questionCount);
            }

            // Final fallback to static
            if (loadedQuestions.length === 0) {
                loadedQuestions = getRandomMCQs(selectedSubject, selectedType, questionCount);
            }

            if (loadedQuestions.length === 0) {
                alert(`No MCQs found for ${selectedSubject} ${selectedType}. Try another subject or type.`);
                setLoading(false);
                return;
            }

            // Shuffle and slice to requested count
            const shuffled = loadedQuestions.sort(() => Math.random() - 0.5).slice(0, questionCount);

            setQuestions(shuffled);
            setAnswers(new Array(shuffled.length).fill(null));
            setCurrentQ(0);
            setShowExplanation(false);
            setTimeLeft(shuffled.length * 60);
            // Go to VU exam mode or normal practice mode
            setStage(examMode === 'vu-style' ? 'vu-exam' : 'quiz');
        } catch (e) {
            console.error(e);
            alert('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectAnswer = (idx: number) => {
        if (showExplanation) return;
        const newAnswers = [...answers];
        newAnswers[currentQ] = idx;
        setAnswers(newAnswers);
        setShowExplanation(true);
    };

    const nextQuestion = () => {
        setShowExplanation(false);
        if (currentQ < questions.length - 1) {
            setCurrentQ(currentQ + 1);
        } else {
            finishQuiz();
        }
    };

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    if (stage === 'setup') {
        return (
            <div className="page">
                <div className="container" style={{ maxWidth: '600px' }}>
                    <div className="page-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1>🧠 MCQ Practice</h1>
                                <p>Test your knowledge with subject-wise MCQ quizzes</p>
                            </div>
                            <Link href="/mcq-practice/submit" className="btn btn-outline btn-sm">
                                ➕ Submit Question
                            </Link>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '32px' }}>
                        <div className="form-group">
                            <label className="form-label">Select Subject</label>
                            <select className="form-select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                                {allSubjects.map(code => {
                                    const s = subjects.find(x => x.code === code);
                                    return <option key={code} value={code}>{code} {s ? `- ${s.name}` : ''}</option>;
                                })}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Selection Mode</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                <button
                                    className={`btn btn-sm ${selectionMode === 'exam' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setSelectionMode('exam')}
                                >
                                    Standard Exam
                                </button>
                                <button
                                    className={`btn btn-sm ${selectionMode === 'lecture' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setSelectionMode('lecture')}
                                >
                                    Lecture Based
                                </button>
                                <button
                                    className={`btn btn-sm ${selectionMode === 'topic' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setSelectionMode('topic')}
                                >
                                    Custom Topic
                                </button>
                            </div>
                        </div>

                        {selectionMode === 'exam' && (
                            <div className="form-group anim-fade-in">
                                <label className="form-label">Exam Type</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className={`btn ${selectedType === 'midterm' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedType('midterm')}>Midterm (Lec 1-22)</button>
                                    <button className={`btn ${selectedType === 'final' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedType('final')}>Final Term (Lec 23-45)</button>
                                </div>
                            </div>
                        )}

                        {selectionMode === 'lecture' && (
                            <div className="form-group anim-fade-in">
                                <label className="form-label">Lecture Range (e.g., 1-5 or 10,12,15)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter lecture numbers..."
                                    value={lectureRange}
                                    onChange={e => setLectureRange(e.target.value)}
                                />
                            </div>
                        )}

                        {selectionMode === 'topic' && (
                            <div className="form-group anim-fade-in">
                                <label className="form-label">Search Custom Topic</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Networking or Binary Conversion"
                                    value={customTopic}
                                    onChange={e => setCustomTopic(e.target.value)}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    ✨ AI will generate questions specifically for this topic.
                                </p>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Number of Questions</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {[10, 20, 50].map(n => (
                                    <button key={n} className={`btn ${questionCount === n ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuestionCount(n)}>{n} MCQs</button>
                                ))}
                            </div>
                        </div>

                        {/* Mode Selector */}
                        <div className="form-group">
                            <label className="form-label">Quiz Mode</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div
                                    onClick={() => setExamMode('practice')}
                                    style={{
                                        padding: '14px',
                                        borderRadius: '10px',
                                        border: `2px solid ${examMode === 'practice' ? 'var(--primary, #667eea)' : 'rgba(102,126,234,0.2)'}`,
                                        background: examMode === 'practice' ? 'rgba(102,126,234,0.1)' : 'transparent',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{ fontSize: '1.5rem' }}>⚡</div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginTop: '4px' }}>Practice Mode</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Instant feedback per question</div>
                                </div>
                                <div
                                    onClick={() => setExamMode('vu-style')}
                                    style={{
                                        padding: '14px',
                                        borderRadius: '10px',
                                        border: `2px solid ${examMode === 'vu-style' ? '#7c3aed' : 'rgba(124,58,237,0.2)'}`,
                                        background: examMode === 'vu-style' ? 'rgba(124,58,237,0.1)' : 'transparent',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{ fontSize: '1.5rem' }}>🎓</div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginTop: '4px' }}>VU Exam Mode</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Exact VU exam interface</div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="checkbox" checked={timerEnabled} onChange={e => setTimerEnabled(e.target.checked)} />
                                Enable Timer ({questionCount} minutes)
                            </label>
                        </div>

                        <button
                            className="btn btn-primary btn-lg btn-block"
                            onClick={startQuiz}
                            disabled={loading}
                            style={{ position: 'relative' }}
                        >
                            {loading ? (
                                <span>🤖 AI is generating your quiz... hold on!</span>
                            ) : (
                                <span>Start Quiz 🚀</span>
                            )}
                        </button>
                        {loading && (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '10px' }}>
                                ✨ AI is creating {questionCount} "{selectionMode === 'topic' ? customTopic : selectionMode === 'lecture' ? `Lec ${lectureRange}` : selectedType}" MCQs...
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // VU EXAM MODE
    if (stage === 'vu-exam') {
        return (
            <VUExamMode
                questions={questions}
                subject={selectedSubject}
                examType={selectedType}
                customLabel={
                    selectionMode === 'lecture' ? `Lectures ${lectureRange}` :
                        selectionMode === 'topic' ? `Topic: ${customTopic}` :
                            undefined
                }
                onBack={() => setStage('setup')}
                onFinish={(ans, score) => {
                    setAnswers(ans);
                    setScore(score);
                    setStage('result');
                }}
            />
        );
    }

    if (stage === 'quiz') {
        const q = questions[currentQ];
        return (
            <div className="page">
                <div className="container" style={{ maxWidth: '700px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span className="badge badge-primary">{selectedSubject} - {selectedType}</span>
                        {timerEnabled && (
                            <div className={`quiz-timer ${timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : ''}`}>
                                ⏱ {formatTime(timeLeft)}
                            </div>
                        )}
                    </div>

                    <div className="quiz-progress">
                        <div className="quiz-progress-bar" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
                    </div>

                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            Question {currentQ + 1} of {questions.length} • Topic: {q.topic}
                        </div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', lineHeight: '1.6' }}>{q.question}</h3>

                        {q.options.map((opt, i) => {
                            let cls = 'quiz-option';
                            if (showExplanation) {
                                if (i === q.correct) cls += ' correct';
                                else if (answers[currentQ] === i && i !== q.correct) cls += ' wrong';
                            } else if (answers[currentQ] === i) {
                                cls += ' selected';
                            }
                            return (
                                <div key={i} className={cls} onClick={() => selectAnswer(i)}>
                                    <div className="quiz-option-letter">{String.fromCharCode(65 + i)}</div>
                                    <span>{opt}</span>
                                </div>
                            );
                        })}

                        {showExplanation && (
                            <div style={{
                                marginTop: '20px',
                                padding: '18px 20px',
                                background: answers[currentQ] === q.correct
                                    ? 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.08))'
                                    : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.08))',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: `4px solid ${answers[currentQ] === q.correct ? '#22c55e' : '#ef4444'}`,
                            }}>
                                <div style={{
                                    fontWeight: '700', marginBottom: '8px', fontSize: '1rem',
                                    color: answers[currentQ] === q.correct ? '#22c55e' : '#ef4444'
                                }}>
                                    {answers[currentQ] === q.correct ? '✅ Correct!' : `❌ Wrong! Correct answer: ${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}`}
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    💡 Why this is correct:
                                </div>
                                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
                                    {q.explanation}
                                </p>
                            </div>
                        )}

                        {showExplanation && (
                            <button className="btn btn-primary btn-block" style={{ marginTop: '16px' }} onClick={nextQuestion}>
                                {currentQ < questions.length - 1 ? 'Next Question →' : 'View Results 📊'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // RESULT
    const percentage = Math.round((score / questions.length) * 100);
    const grade = percentage >= 85 ? 'A' : percentage >= 70 ? 'B' : percentage >= 55 ? 'C' : percentage >= 40 ? 'D' : 'F';
    const gradeColor = percentage >= 85 ? '#22c55e' : percentage >= 70 ? '#3b82f6' : percentage >= 55 ? '#f59e0b' : percentage >= 40 ? '#f97316' : '#ef4444';

    const topics = questions.reduce((acc: Record<string, { total: number, correct: number, questions: any[] }>, q, i) => {
        if (!acc[q.topic]) acc[q.topic] = { total: 0, correct: 0, questions: [] };
        acc[q.topic].total++;
        acc[q.topic].questions.push({ ...q, userAnswer: answers[i] });
        if (answers[i] === q.correct) acc[q.topic].correct++;
        return acc;
    }, {});

    const topicEntries = Object.entries(topics).sort((a, b) => {
        const pctA = a[1].correct / a[1].total;
        const pctB = b[1].correct / b[1].total;
        return pctA - pctB; // Weakest first
    });

    const weakTopics = topicEntries.filter(([, d]) => (d.correct / d.total) < 0.5);
    const missedQuestions = questions.filter((q, i) => answers[i] !== q.correct);

    const getMotivation = () => {
        if (percentage >= 85) return { emoji: '🎉', msg: 'Outstanding! You are very well prepared for this exam!', color: '#22c55e' };
        if (percentage >= 70) return { emoji: '👍', msg: 'Good job! A bit more practice and you\'ll ace it.', color: '#3b82f6' };
        if (percentage >= 55) return { emoji: '📖', msg: 'Not bad, but you need to focus on your weak topics before the exam.', color: '#f59e0b' };
        if (percentage >= 40) return { emoji: '⚠️', msg: 'You need more preparation. Don\'t worry — study the weak areas and try again!', color: '#f97316' };
        return { emoji: '💪', msg: 'Don\'t give up! Everyone starts somewhere. Study the topics below and ask the AI for help.', color: '#ef4444' };
    };

    const motivation = getMotivation();

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '760px' }}>

                {/* Score Header */}
                <div className="card" style={{ padding: '36px', textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        {/* Score Circle */}
                        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                            <svg width="120" height="120">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(102,126,234,0.15)" strokeWidth="10" />
                                <circle cx="60" cy="60" r="52" fill="none" stroke={gradeColor} strokeWidth="10"
                                    strokeDasharray={`${(percentage / 100) * 327} 327`}
                                    strokeLinecap="round" transform="rotate(-90 60 60)"
                                    style={{ transition: 'stroke-dasharray 1s ease' }}
                                />
                                <text x="60" y="55" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{percentage}%</text>
                                <text x="60" y="72" textAnchor="middle" fill="#9ca3af" fontSize="11">{score}/{questions.length}</text>
                            </svg>
                        </div>

                        {/* Grade + Message */}
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '3.5rem', fontWeight: '900', color: gradeColor, lineHeight: 1 }}>Grade {grade}</div>
                            <div style={{ fontSize: '1.1rem', marginTop: '8px' }}>{motivation.emoji} {motivation.msg}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                                {selectedSubject} • {selectedType === 'midterm' ? 'Midterm' : 'Final Term'} • {questions.length} Questions
                            </div>
                        </div>
                    </div>
                </div>

                {/* Topic-wise Performance */}
                <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '20px' }}>📊 Topic-wise Performance</h3>
                    {topicEntries.map(([topic, data]) => {
                        const pct = Math.round((data.correct / data.total) * 100);
                        const isWeak = pct < 50;
                        const isOk = pct >= 50 && pct < 80;
                        const barColor = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
                        const label = pct >= 80 ? '💪 Strong' : pct >= 50 ? '⚠️ Needs Work' : '🔴 Weak';

                        return (
                            <div key={topic} style={{ marginBottom: '18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.92rem' }}>{topic}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.8rem', color: barColor, fontWeight: '700' }}>{label}</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{data.correct}/{data.total} ({pct}%)</span>
                                    </div>
                                </div>
                                <div style={{ height: '10px', background: 'rgba(102,126,234,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', width: `${pct}%`,
                                        background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`,
                                        borderRadius: '6px',
                                        transition: 'width 1s ease',
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Weak Areas + AI Help */}
                {weakTopics.length > 0 && (
                    <div className="card" style={{
                        padding: '28px', marginBottom: '20px',
                        border: '2px solid rgba(239,68,68,0.3)',
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.05), rgba(220,38,38,0.03))',
                    }}>
                        <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>🔴 You Are Weak In These Topics</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                            Don't worry! Focus on these topics before your exam. You can ask our AI assistant to explain them to you.
                        </p>
                        {weakTopics.map(([topic, data]) => {
                            const pct = Math.round((data.correct / data.total) * 100);
                            const aiMsg = `I'm weak in "${topic}" for ${selectedSubject}. I only got ${data.correct} out of ${data.total} correct (${pct}%). Please explain this topic in detail and give me tips to improve.`;
                            return (
                                <div key={topic} style={{
                                    background: 'rgba(239,68,68,0.08)',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#ef4444' }}>⚠️ {topic}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                            Only {pct}% correct — needs serious revision
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <a
                                            href={`/ai-assistant?q=${encodeURIComponent(aiMsg)}`}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                                color: 'white',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                fontSize: '0.82rem',
                                                fontWeight: '700',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                            }}
                                        >
                                            🤖 AI Help
                                        </a>
                                        <a
                                            href={`https://wa.me/923177180123?text=${encodeURIComponent(`Hi! I need help with "${topic}" in ${selectedSubject}. I scored only ${pct}% in this topic.`)}`}
                                            target="_blank" rel="noopener noreferrer"
                                            style={{
                                                background: '#22c55e',
                                                color: 'white',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                fontSize: '0.82rem',
                                                fontWeight: '700',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                            }}
                                        >
                                            💬 WhatsApp
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Missed Questions Review */}
                {missedQuestions.length > 0 && (
                    <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '4px' }}>📝 Review Your Mistakes</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                            These are the questions you got wrong — study the explanations carefully.
                        </p>
                        {missedQuestions.map((q: any, idx: number) => (
                            <div key={idx} style={{
                                border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '16px',
                                background: 'rgba(239,68,68,0.04)',
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '10px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    ❌ {q.question}
                                </div>

                                {/* Your wrong answer */}
                                {q.userAnswer !== null && (
                                    <div style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: '4px' }}>
                                        Your answer: <strong>{String.fromCharCode(65 + q.userAnswer)}. {q.options[q.userAnswer]}</strong>
                                    </div>
                                )}

                                {/* Correct answer */}
                                <div style={{ fontSize: '0.85rem', color: '#22c55e', marginBottom: '12px' }}>
                                    ✅ Correct: <strong>{String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}</strong>
                                </div>

                                {/* Explanation */}
                                <div style={{
                                    padding: '12px 16px',
                                    background: 'rgba(102,126,234,0.08)',
                                    borderRadius: '8px',
                                    borderLeft: '3px solid #667eea',
                                    fontSize: '0.88rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: '1.7',
                                }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>💡 Why this is correct:</strong><br />
                                    {q.explanation}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={() => setStage('setup')}>🔄 Try Again</button>
                        <button className="btn btn-secondary" onClick={() => { setSelectedSubject('CS101'); setStage('setup'); }}>📚 Change Subject</button>
                        <a href="/ai-assistant" style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white', padding: '10px 20px', borderRadius: '8px',
                            textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem',
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                        }}>🤖 Ask AI for Help</a>
                        <a href="https://wa.me/923177180123" target="_blank" rel="noopener noreferrer" style={{
                            background: '#22c55e',
                            color: 'white', padding: '10px 20px', borderRadius: '8px',
                            textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem',
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                        }}>💬 WhatsApp Tutor</a>
                    </div>
                </div>

            </div>
        </div>
    );
}
