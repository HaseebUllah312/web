'use client';
import { useState } from 'react';
import { subjects } from '@/data/subjects';

export default function SemesterPlannerPage() {
    const [selectedSubjects, setSelectedSubjects] = useState<{ code: string; examDate: string }[]>([{ code: 'CS101', examDate: '' }]);
    const [studyHours, setStudyHours] = useState(4);
    const [generated, setGenerated] = useState(false);

    const addSubject = () => setSelectedSubjects([...selectedSubjects, { code: '', examDate: '' }]);
    const removeSubject = (i: number) => setSelectedSubjects(selectedSubjects.filter((_, idx) => idx !== i));

    const generatePlan = () => { setGenerated(true); };
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const validSubjects = selectedSubjects.filter(s => s.code);

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header">
                    <h1>📅 Semester Planner</h1>
                    <p>Generate a personalized daily study schedule</p>
                </div>

                {!generated ? (
                    <div className="card" style={{ padding: '32px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Setup Your Plan</h3>
                        {selectedSubjects.map((s, i) => (
                            <div key={i} className="calc-row">
                                <select value={s.code} onChange={e => { const n = [...selectedSubjects]; n[i].code = e.target.value; setSelectedSubjects(n); }} style={{ flex: 2 }}>
                                    <option value="">Select Subject</option>
                                    {subjects.map(sub => <option key={sub.code} value={sub.code}>{sub.code} - {sub.name}</option>)}
                                </select>
                                <input type="date" value={s.examDate} onChange={e => { const n = [...selectedSubjects]; n[i].examDate = e.target.value; setSelectedSubjects(n); }} />
                                <button className="btn btn-danger btn-sm" onClick={() => removeSubject(i)}>✕</button>
                            </div>
                        ))}
                        <button className="btn btn-secondary" onClick={addSubject} style={{ marginBottom: '20px' }}>+ Add Subject</button>
                        <div className="form-group">
                            <label className="form-label">Study hours per day: {studyHours}h</label>
                            <input type="range" min="1" max="10" value={studyHours} onChange={e => setStudyHours(Number(e.target.value))} style={{ width: '100%' }} />
                        </div>
                        <button className="btn btn-primary btn-lg btn-block" onClick={generatePlan}>Generate Study Plan 📅</button>
                    </div>
                ) : (
                    <div>
                        <button className="btn btn-outline" style={{ marginBottom: '24px' }} onClick={() => setGenerated(false)}>← Edit Settings</button>
                        <div className="section-header">
                            <h2>Your Weekly Study Schedule</h2>
                            <p>{validSubjects.length} subjects • {studyHours} hours/day</p>
                        </div>
                        {days.map(day => {
                            const hoursPerSubject = validSubjects.length > 0 ? studyHours / validSubjects.length : 0;
                            return (
                                <div key={day} className="schedule-day">
                                    <h4>{day}</h4>
                                    {validSubjects.map((s, i) => {
                                        const sub = subjects.find(x => x.code === s.code);
                                        const startHour = 9 + (i * hoursPerSubject);
                                        const endHour = startHour + hoursPerSubject;
                                        return (
                                            <div key={i} className="schedule-slot">
                                                <span>{sub?.code || 'N/A'} - {sub?.name || 'Unknown'}</span>
                                                <span>{Math.floor(startHour)}:00 - {Math.floor(endHour)}:00 ({hoursPerSubject.toFixed(1)}h)</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                        <div className="card" style={{ marginTop: '24px', padding: '20px', background: 'var(--accent-glow)' }}>
                            <h4>📌 Weekly Targets</h4>
                            <ul style={{ listStyle: 'none', marginTop: '12px' }}>
                                {validSubjects.map((s, i) => {
                                    const sub = subjects.find(x => x.code === s.code);
                                    return <li key={i} style={{ padding: '6px 0', fontSize: '0.9rem' }}>✅ {sub?.code}: Complete {Math.ceil(studyHours)} chapters + practice MCQs</li>;
                                })}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
