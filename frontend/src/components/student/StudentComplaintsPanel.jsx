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
        setSubmitting(true);
        try {
            await axiosInstance.post('/complaints', { title: category, description });
            alert('Done! Complaint submitted.');
            setCategory('room'); setDescription('');
            fetchComplaints();
        } catch (err) { alert('Something went wrong. Please try again.'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <div style={{ color: '#64748b' }}>Loading complaints...</div>;

    const activeTickets = complaints.filter(c => c.status !== 'resolved').length;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Complaints & Feedback</h1>

            {activeTickets > 0 && <div className="error-alert" style={{ color: '#991b1b', background: '#fee2e2', border: '1px solid #fca5a5' }}>⚠️ You have {activeTickets} unresolved complaint(s) pending review.</div>}

            <div className="form-card" style={{ marginBottom: '2rem', maxWidth: '600px' }}>
                <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Submit a Complaint</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <select value={category} onChange={e => setCategory(e.target.value)} required className="form-group-alt" style={{ border: '1px solid #cbd5e1', padding: '0.85rem', borderRadius: '8px' }}>
                        <option value="room">Internal Room Damage</option>
                        <option value="facility">General Facility Faults</option>
                        <option value="service">Standard Services Deviation</option>
                        <option value="cleaning">Room & Area Cleaning</option>
                    </select>

                    <textarea placeholder="Please describe your complaint or feedback in detail..." value={description} onChange={e => setDescription(e.target.value)} required rows="4" style={{ border: '1px solid #cbd5e1', padding: '0.85rem', borderRadius: '8px', outline: 'none', resize: 'vertical' }}></textarea>

                    <button type="submit" disabled={submitting} className="action-btn" style={{ background: '#8b5cf6', padding: '1rem', marginTop: '0.5rem', fontWeight: '600' }}>
                        {submitting ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                </form>
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead><tr><th>Date Submitted</th><th>Category</th><th>Description</th><th>Status</th></tr></thead>
                    <tbody>
                        {complaints.map(c => (
                            <tr key={c._id}>
                                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td style={{ textTransform: 'capitalize' }}>{c.title}</td>
                                <td style={{ maxWidth: '300px' }}>{c.description}</td>
                                <td><span className={`badge ${c.status === 'resolved' ? 'badge-green' : c.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>{c.status}</span></td>
                            </tr>
                        ))}
                        {complaints.length === 0 && <tr><td colSpan="4" className="text-center" style={{ padding: '2rem' }}>No complaints found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default StudentComplaintsPanel;
