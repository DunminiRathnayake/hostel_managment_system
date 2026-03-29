import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const StudentComplaintsPanel = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [category, setCategory] = useState('room');
    const [description, setDescription] = useState('');

    const fetchComplaints = async () => {
        try {
            const res = await axiosInstance.get('/complaints/my-complaints');
            setComplaints(res.data.complaints || []);
        } catch (err) { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchComplaints(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanDesc = description.trim();
        if (cleanDesc.length < 10) {
            return alert('Please elaborate. Description must be at least 10 characters long to provide context.');
        }
        if (cleanDesc.length > 1000) {
            return alert('Description is too long. Please keep it under 1000 characters.');
        }

        setSubmitting(true);
        try {
            await axiosInstance.post('/complaints', { title: category, description: cleanDesc });
            alert('Issue reported successfully!');
            setCategory('room'); setDescription('');
            fetchComplaints();
        } catch (err) { alert('Something went wrong. Please try again.'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <div style={{ color: '#64748b' }}>Loading issues...</div>;

    const activeTickets = complaints.filter(c => c.status !== 'resolved').length;

    return (
        <div className="panel-container">
            <h1 className="panel-title">My Complaints</h1>

            {activeTickets > 0 && <div className="error-alert" style={{ color: '#991b1b', background: '#fee2e2', border: '1px solid #fca5a5' }}>⚠️ You currently have {activeTickets} pending issue(s) waiting for response.</div>}

            <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '3rem', maxWidth: '800px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    📢 Report an Issue
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Issue Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} required style={{ border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '8px', background:'white', outline:'none' }}>
                            <option value="room">Room Damage / Issues</option>
                            <option value="facility">Hostel Facility Problems</option>
                            <option value="service">Service Complaints</option>
                            <option value="cleaning">Cleaning Issues</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Issue Details</label>
                        <textarea placeholder="Describe exactly what happened or what needs fixing..." value={description} onChange={e => setDescription(e.target.value)} required rows="4" style={{ border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '8px', outline: 'none', resize: 'vertical' }}></textarea>
                     </div>

                    <button type="submit" disabled={submitting} className="action-btn" style={{ background: '#ef4444', color: 'white', padding: '1.2rem', fontSize: '1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor:'pointer' }}>
                        {submitting ? 'Submitting...' : 'Report Issue'}
                    </button>
                </form>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#334155' }}>Issue History</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {complaints.map(c => (
                    <div key={c._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'transform 0.2s', display:'flex', flexDirection:'column' }}
                         onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
                         onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#1e293b', textTransform: 'capitalize' }}>{c.title || c.category || 'General Issue'}</h3>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', flex: 1, margin: '0 0 1.5rem 0', padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #cbd5e1', fontStyle: 'italic' }}>"{c.description}"</p>
                        
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Status</span>
                            <span className={`badge ${c.status === 'resolved' ? 'badge-green' : c.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`} style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                {c.status}
                            </span>
                        </div>
                    </div>
                ))}

                {complaints.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h3>No Issues Reported</h3>
                        <p>You haven't reported any issues. Everything looks good!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentComplaintsPanel;
