'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { subjects } from '@/data/subjects';
// import { allSubjects } from '@/data/all_subjects';
import { mcqs, getRandomMCQs } from '@/data/mcqs';

export default function MCQPracticePage() {
    const [stage, setStage] = useState<'setup' | 'quiz' | 'result'>('setup');
    const [loading, setLoading] = useState(false);
    const [allSubjects, setAllSubjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('CS101');

    useEffect(() => {
        fetch('/api/subjects').then(r => r.json()).then(setAllSubjects);
    }, []);
    const [selectedType, setSelectedType] = useState<'midterm' | 'final'>('midterm');
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
            // Fetch from the new JSON-based API
            // We use a dynamic import or fetch depending on how we want to implement it.
            // Since this is a client component, we should probably just fetch the JSON file directly if it's in public, 
            // OR use a server action/API route.
            // For now, let's try to import the JSON dynamically if possible, or fallback to the API logic.

            // Simpler approach: We'll create a helper to get questions from the unified source
            // But since we can't easily do dynamic imports of arbitrary files in client components without server side help,
            // let's assume we have an API route or we use the specific files we know about.

            // ACTUALLY: Let's use a server-side API route to get questions. It's cleaner.
            // But to avoid creating another API route just yet, let's try to load the known JSONs here if the subject matches.

            let loadedQuestions: any[] = [];

            // Try to load from our known JSONs
            try {
                // Note: In Next.js client components, dynamic imports work for chunks.
                // But data files are better fetched.
                // Let's rely on a fetch to our own API or public folder IF we moved data to public.
                // But data is in `data/quizzes`. This is server-side code.

                // REFACTOR STRATEGY: 
                // We will add a simple API endpoint `/api/quiz/data?subject=CS101` that returns the JSON.
                const res = await fetch(`/api/quiz/data?subject=${selectedSubject}`);
                if (res.ok) {
                    const data = await res.json();

                    // Flatten topics to get all questions
                    const allQs = data.topics.flatMap((t: any) => t.questions.map((q: any) => ({
                        ...q,
                        topic: t.name,
                        subject: selectedSubject,
                        type: t.term === 'Midterm' ? 'midterm' : 'final' // Normalize term
                    })));

                    // Filter by selected type (Midterm/Final)
                    loadedQuestions = allQs.filter((q: any) => q.type.toLowerCase() === selectedType.toLowerCase());
                } else {
                    // Fallback to static MCQs if JSON not found
                    loadedQuestions = getRandomMCQs(selectedSubject, selectedType, questionCount);
                }
            } catch (err) {
                console.warn("Failed to load JSON quiz, falling back", err);
                loadedQuestions = getRandomMCQs(selectedSubject, selectedType, questionCount);
            }

            if (loadedQuestions.length === 0) {
                // Double check static fallback
                loadedQuestions = getRandomMCQs(selectedSubject, selectedType, questionCount);
            }

            if (loadedQuestions.length === 0) {
                alert('No MCQs available for this selection. Try a different subject or type.');
                setLoading(false);
                return;
            }

            // Shuffle and slice
            const shuffled = loadedQuestions.sort(() => Math.random() - 0.5).slice(0, questionCount);

            setQuestions(shuffled);
            setAnswers(new Array(shuffled.length).fill(null));
            setCurrentQ(0);
            setShowExplanation(false);
            setTimeLeft(shuffled.length * 60);
            setStage('quiz');
        } catch (e) {
            console.error(e);
            alert('Error starting quiz');
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
                            <label className="form-label">Exam Type</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className={`btn ${selectedType === 'midterm' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedType('midterm')}>Midterm</button>
                                <button className={`btn ${selectedType === 'final' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedType('final')}>Final Term</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Number of Questions</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {[10, 20, 50].map(n => (
                                    <button key={n} className={`btn ${questionCount === n ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuestionCount(n)}>{n} MCQs</button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="checkbox" checked={timerEnabled} onChange={e => setTimerEnabled(e.target.checked)} />
                                Enable Timer ({questionCount} minutes)
                            </label>
                        </div>

                        <button className="btn btn-primary btn-lg btn-block" onClick={startQuiz}>Start Quiz 🚀</button>
                    </div>
                </div>
            </div>
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
                            <div style={{ marginTop: '20px', padding: '16px', background: answers[currentQ] === q.correct ? 'var(--success-bg)' : 'var(--error-bg)', borderRadius: 'var(--radius-md)' }}>
                                <strong>{answers[currentQ] === q.correct ? '✅ Correct!' : '❌ Incorrect!'}</strong>
                                <p style={{ fontSize: '0.9rem', marginTop: '8px', color: 'var(--text-secondary)' }}>{q.explanation}</p>
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
    const topics = questions.reduce((acc: Record<string, { total: number, correct: number }>, q, i) => {
        if (!acc[q.topic]) acc[q.topic] = { total: 0, correct: 0 };
        acc[q.topic].total++;
        if (answers[i] === q.correct) acc[q.topic].correct++;
        return acc;
    }, {});

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '700px' }}>
                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
                        {percentage >= 80 ? '🎉 Excellent!' : percentage >= 60 ? '👍 Good Job!' : percentage >= 40 ? '📖 Keep Studying!' : '💪 Don\'t Give Up!'}
                    </h1>
                    <div className="calc-result" style={{ marginBottom: '24px' }}>
                        <div className="calc-result-number">{percentage}%</div>
                        <p style={{ fontSize: '1.1rem', marginTop: '8px' }}>{score} out of {questions.length} correct</p>
                    </div>

                    <h3 style={{ textAlign: 'left', marginBottom: '12px' }}>📊 Topic-wise Performance</h3>
                    {Object.entries(topics).map(([topic, data]) => (
                        <div key={topic} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                            <span>{topic}</span>
                            <span style={{ color: data.correct === data.total ? 'var(--success)' : data.correct === 0 ? 'var(--error)' : 'var(--warning)' }}>
                                {data.correct}/{data.total} ({Math.round((data.correct / data.total) * 100)}%)
                            </span>
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                        <button className="btn btn-primary" onClick={() => setStage('setup')}>Try Again</button>
                        <button className="btn btn-secondary" onClick={() => { setStage('setup'); }}>Change Subject</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
