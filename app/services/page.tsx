'use client';
import { useState } from 'react';
import { services, testimonials, faqs } from '@/data/services';

export default function ServicesPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        subjectCode: '',
        service: 'Assignment Solution',
        deadline: '',
        details: ''
    });

    const handleOrderSubmit = () => {
        const { name, whatsapp, subjectCode, service, deadline, details } = formData;
        if (!name || !whatsapp) {
            alert('Please fill in your Name and WhatsApp number.');
            return;
        }

        const message = `*New Order Request* 📝%0A%0A*Name:* ${name}%0A*WhatsApp:* ${whatsapp}%0A*Subject:* ${subjectCode}%0A*Service:* ${service}%0A*Deadline:* ${deadline}%0A*Details:* ${details}`;
        window.open(`https://wa.me/923177180123?text=${message}`, '_blank');
    };

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>💼 HSM Tech Academic Services</h1>
                    <p>Professional academic support for Virtual University students</p>
                </div>

                {/* Services Grid */}
                <div className="card-grid-3" style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginBottom: '60px' }}>
                    {services.map(s => (
                        <div key={s.id} className={`price-card ${s.popular ? 'featured' : ''}`}>
                            {s.popular && <div className="card-badge">🔥 Popular</div>}
                            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{s.icon}</div>
                            <h3>{s.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '8px 0' }}>{s.description}</p>
                            <div className="price">{s.priceLocal}</div>
                            <div className="price-usd">{s.priceUSD}</div>
                            <ul className="price-features">
                                {s.features.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                            <a href={`https://wa.me/923177180123?text=Hi! I need help with ${s.title}`} className="btn btn-primary btn-block" target="_blank" rel="noopener noreferrer">Order via WhatsApp 💬</a>
                        </div>
                    ))}
                </div>

                {/* Order Form */}
                <div style={{ maxWidth: '700px', margin: '0 auto 60px' }}>
                    <div className="section-header">
                        <h2>📋 Quick Order Form</h2>
                        <p>Fill in the details and we&apos;ll get back to you within minutes</p>
                    </div>
                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Your Name</label>
                                <input
                                    className="form-input"
                                    placeholder="Full name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">WhatsApp Number</label>
                                <input
                                    className="form-input"
                                    placeholder="03XX-XXXXXXX"
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Subject Code</label>
                                <input
                                    className="form-input"
                                    placeholder="e.g. CS101"
                                    value={formData.subjectCode}
                                    onChange={e => setFormData({ ...formData, subjectCode: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Service Required</label>
                                <select
                                    className="form-select"
                                    value={formData.service}
                                    onChange={e => setFormData({ ...formData, service: e.target.value })}
                                >
                                    {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Deadline</label>
                            <input
                                className="form-input"
                                type="date"
                                value={formData.deadline}
                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Details</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Describe what you need..."
                                value={formData.details}
                                onChange={e => setFormData({ ...formData, details: e.target.value })}
                            />
                        </div>
                        <button className="btn btn-primary btn-lg btn-block" onClick={handleOrderSubmit}>Submit Order ✅</button>
                    </div>
                </div>

                {/* Financial Aid Banner */}
                <div className="card" style={{ padding: '24px', textAlign: 'center', background: 'var(--success-bg)', borderColor: 'var(--success)', marginBottom: '60px', maxWidth: '700px', margin: '0 auto 60px' }}>
                    <h3 style={{ color: 'var(--success)' }}>💚 Financial Aid Available</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>We offer special discounts for deserving and needy students. Contact us to learn more.</p>
                    <a href="https://wa.me/923177180123?text=I%20need%20financial%20aid" className="btn btn-success" style={{ marginTop: '12px' }} target="_blank" rel="noopener noreferrer">Apply for Financial Aid</a>
                </div>

                {/* Testimonials */}
                <div className="section-header" style={{ marginTop: '40px' }}>
                    <h2>🌟 Student Testimonials</h2>
                    <p>What our students say about HSM Tech</p>
                </div>
                <div className="card-grid" style={{ marginBottom: '60px' }}>
                    {testimonials.map((t, i) => (
                        <div key={i} className="testimonial-card">
                            <div className="testimonial-text">{t.text}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div className="testimonial-author">{t.name}</div>
                                    <div className="testimonial-role">{t.program} - {t.semester} Semester</div>
                                </div>
                                <div className="stars">{[1, 2, 3, 4, 5].map(s => <span key={s} className={`star ${t.rating >= s ? 'active' : ''}`}>★</span>)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <div className="section-header">
                        <h2>❓ Frequently Asked Questions</h2>
                    </div>
                    {faqs.map((f, i) => (
                        <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                            <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                {f.q}
                                <span>{openFaq === i ? '−' : '+'}</span>
                            </button>
                            <div className="faq-answer">{f.a}</div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <h2>Need Help? <span className="gradient-text">Contact HSM Tech</span></h2>
                    <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>We&apos;re available 24/7 to assist you with any academic needs</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="https://wa.me/923177180123" className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">💬 WhatsApp Us</a>
                        <a href="mailto:haseebsaleem312@gmail.com" className="btn btn-secondary btn-lg">📧 Email Us</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
