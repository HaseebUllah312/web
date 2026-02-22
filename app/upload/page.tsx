'use client';
import { useState, useEffect } from 'react';
// import { subjects } from '@/data/subjects';

interface UploadItem {
    id: string;
    file: File;
    subjectCode: string; // Auto-detected or selected
    category: string;    // Auto-detected or selected
    description: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
}

const CATEGORIES = [
    'Midterm Files', 'Final Term Files', 'Solved Assignments',
    'GDB Solutions', 'Quiz Files', 'Handouts', 'Past Papers', 'Short Notes'
];

export default function UploadPage() {
    const [uploadQueue, setQueue] = useState<UploadItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [allSubjects, setAllSubjects] = useState<string[]>([]);

    useEffect(() => {
        // Fetch the full subject list dynamically
        fetch('/api/subjects')
            .then(res => res.json())
            .then(data => {
                console.log("Subjects loaded:", data.length);
                setAllSubjects(data);
            })
            .catch(err => console.error("Failed to load subjects", err));
    }, []);

    // Smart Detection Logic
    const parseFileDetails = (file: File): UploadItem => {
        const name = file.name;
        let detectedCode = '';
        let detectedCategory = 'Midterm Files'; // Default

        // Detect Subject Code (e.g., CS101, CS 101, CS-101)
        // Regex: 3-4 letters, optional space/hyphen, 3 digits
        const codeMatch = name.match(/([a-zA-Z]{3,4})[\s-]?(\d{3})/i);
        if (codeMatch) {
            const code = (codeMatch[1] + codeMatch[2]).toUpperCase();
            // Check if code exists in known subjects
            if (allSubjects.includes(code)) {
                detectedCode = code;
            } else {
                detectedCode = code;
            }
        }

        // 2. Detect Category by Keywords
        const lowerName = name.toLowerCase();
        if (lowerName.includes('final')) detectedCategory = 'Final Term Files';
        else if (lowerName.includes('assign')) detectedCategory = 'Solved Assignments';
        else if (lowerName.includes('gdb')) detectedCategory = 'GDB Solutions';
        else if (lowerName.includes('quiz')) detectedCategory = 'Quiz Files';
        else if (lowerName.includes('handout')) detectedCategory = 'Handouts';
        else if (lowerName.includes('paper')) detectedCategory = 'Past Papers';
        else if (lowerName.includes('note')) detectedCategory = 'Short Notes';

        // 3. Clean Description (Remove extension)
        const description = name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

        return {
            id: Math.random().toString(36).substr(2, 9),
            file,
            subjectCode: detectedCode,
            category: detectedCategory,
            description: description,
            status: 'pending'
        };
    };

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const newItems = Array.from(files).map(parseFileDetails);
        setQueue(prev => [...prev, ...newItems]);
    };

    const updateItem = (id: string, field: keyof UploadItem, value: any) => {
        setQueue(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeItem = (id: string) => {
        setQueue(prev => prev.filter(item => item.id !== id));
    };

    const handleUploadAll = async () => {
        setIsUploading(true);
        // Filter items that haven't been processed yet
        const itemsToProcess = uploadQueue.filter(i => i.status !== 'success' && i.status !== 'uploading');

        if (itemsToProcess.length === 0) {
            setIsUploading(false);
            return;
        }

        // Process uploads sequentially for stability and clear user feedback
        for (const item of itemsToProcess) {
            // Validation
            if (!item.subjectCode) {
                alert(`Please select a Subject Code for "${item.file.name}"`);
                setIsUploading(false);
                return;
            }

            // Update status to uploading
            updateItem(item.id, 'status', 'uploading');

            try {
                const data = new FormData();
                data.append('code', item.subjectCode);
                data.append('title', item.description);
                data.append('type', item.category);
                data.append('submittedBy', 'Student');
                data.append('file', item.file);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: data
                });

                if (res.ok) {
                    updateItem(item.id, 'status', 'success');
                } else {
                    updateItem(item.id, 'status', 'error');
                }
            } catch (error) {
                console.error(error);
                updateItem(item.id, 'status', 'error');
            }
        }
        setIsUploading(false);
    };

    // Check if al completed
    const allCompleted = uploadQueue.length > 0 && uploadQueue.every(i => i.status === 'success');

    if (allCompleted) {
        return (
            <div className="page">
                <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
                    <div className="card" style={{ padding: '60px 32px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
                        <h2>All Files Uploaded!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px', marginBottom: '24px' }}>
                            Thank you! Your verified uploads will be live soon.
                        </p>
                        <button className="btn btn-primary" onClick={() => setQueue([])}>Upload More Files</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="page-header">
                    <h1>📤 Smart Bulk Upload</h1>
                    <p>Select multiple files. We'll auto-detect the details.</p>
                </div>

                {/* Dropzone */}
                <div
                    className={`card ${dragOver ? 'dragover' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => {
                        e.preventDefault();
                        setDragOver(false);
                        handleFiles(e.dataTransfer.files);
                    }}
                    style={{
                        border: '2px dashed var(--border)',
                        padding: '40px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        marginBottom: '30px',
                        background: dragOver ? 'var(--card-bg-hover)' : 'var(--card-bg)'
                    }}
                    onClick={() => document.getElementById('fileInput')?.click()}
                >
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📂</div>
                    <h3>Drag & Drop Files Here</h3>
                    <p style={{ color: 'var(--text-muted)' }}>or click to select multiple files</p>
                    <input
                        type="file"
                        id="fileInput"
                        hidden
                        multiple
                        onChange={e => handleFiles(e.target.files)}
                        accept=".pdf,.doc,.docx,.jpg,.png,.zip,.rar"
                    />
                </div>

                {/* File List */}
                {uploadQueue.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3>Files Queue ({uploadQueue.length})</h3>
                            <button
                                className="btn btn-success"
                                onClick={handleUploadAll}
                                disabled={isUploading || uploadQueue.length === 0}
                                style={{ padding: '10px 24px', fontSize: '1rem' }}
                            >
                                {isUploading ? 'Uploading...' : '🚀 Upload All Files'}
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            {uploadQueue.map((item, index) => (
                                <div key={item.id} className="card" style={{
                                    padding: '15px',
                                    display: 'grid',
                                    gridTemplateColumns: 'auto 1fr auto',
                                    gap: '15px',
                                    alignItems: 'center',
                                    borderLeft: item.status === 'success' ? '4px solid var(--success)' :
                                        item.status === 'error' ? '4px solid var(--error)' : '4px solid var(--primary)'
                                }}>
                                    {/* Icon */}
                                    <div style={{ fontSize: '1.5rem' }}>
                                        {item.status === 'success' ? '✅' : item.status === 'error' ? '❌' : '📄'}
                                    </div>

                                    {/* Inputs Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                                        {/* Subject Select */}
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subject</label>
                                            <select
                                                className="form-select"
                                                value={item.subjectCode}
                                                onChange={e => updateItem(item.id, 'subjectCode', e.target.value)}
                                                style={{ padding: '6px', fontSize: '0.9rem' }}
                                                disabled={item.status === 'success'}
                                            >
                                                <option value="">Select...</option>
                                                {allSubjects.map(code => <option key={code} value={code}>{code}</option>)}
                                            </select>
                                        </div>

                                        {/* Category Select */}
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category</label>
                                            <select
                                                className="form-select"
                                                value={item.category}
                                                onChange={e => updateItem(item.id, 'category', e.target.value)}
                                                style={{ padding: '6px', fontSize: '0.9rem' }}
                                                disabled={item.status === 'success'}
                                            >
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        {/* Description */}
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Title / Description</label>
                                            <input
                                                className="form-input"
                                                value={item.description}
                                                onChange={e => updateItem(item.id, 'description', e.target.value)}
                                                style={{ padding: '6px', fontSize: '0.9rem' }}
                                                disabled={item.status === 'success'}
                                            />
                                        </div>
                                    </div>

                                    {/* Delete/Status */}
                                    <div>
                                        {item.status === 'pending' && (
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                                                title="Remove"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
