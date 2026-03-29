import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const ComplaintsPanel = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchComplaints = async () => {
        try {
            const res = await axiosInstance.get('/complaints');
            setComplaints(res.data.complaints || []);
        } catch (err) { } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchComplaints(); }, []);

    const updateStatus = async (id, status) => {
        if (!window.confirm(`Mark this issue as ${status}?`)) return;
        try {
            await axiosInstance.put(`/complaints/${id}/status`, { status });
            fetchComplaints();
        } catch (err) { alert('Failed to update status'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you absolutely sure you want to delete this issue document completely?')) return;
        try {
            await axiosInstance.delete(`/complaints/${id}`);
            fetchComplaints();
        } catch (err) { alert('Failed to delete complaint'); }
    };

    if (loading) return <div style={{color:'#64748b'}}>Loading reported issues...</div>;

    const pendingCount = complaints.filter(c => c.status !== 'resolved').length;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Reported Issues</h1>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#334155' }}>Issue Backlog</h2>
                <span className={`badge ${pendingCount > 0 ? 'badge-red' : 'badge-blue'}`}>Pending Review: {pendingCount}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {complaints.map(c => (
                    <div key={c._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'transform 0.2s', display:'flex', flexDirection:'column' }}
                         onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
                         onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem 0', color: '#1e293b', textTransform: 'capitalize' }}>{c.title || c.category || 'General Issue'}</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>👨‍🎓 {c.studentId?.name || 'Unknown Student'}</p>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 1.5rem 0', flex: 1, padding: '1.2rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #cbd5e1', fontStyle: 'italic' }}>
                            "{c.description}"
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: c.status !== 'resolved' ? '1.5rem' : '0' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Status</span>
                            <span className={`badge ${c.status === 'resolved' ? 'badge-green' : c.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`} style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                {c.status}
                            </span>
                        </div>

                        {c.status !== 'resolved' ? (
                            <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto' }}>
                                <button onClick={() => updateStatus(c._id, 'resolved')} style={{ flex: 1, padding: '0.9rem', background: '#10b981', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#059669'} onMouseLeave={e=>e.currentTarget.style.background='#10b981'}>
                                    Mark as Resolved
                                </button>
                                <button onClick={() => handleDelete(c._id)} style={{ flex: 1, padding: '0.9rem', background: 'transparent', color: '#ef4444', border: '2px solid #ef4444', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e=>{e.currentTarget.style.background='#ef4444'; e.currentTarget.style.color='white'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#ef4444'}}>
                                    Delete
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => handleDelete(c._id)} style={{ width: '100%', padding: '0.9rem', background: 'transparent', color: '#ef4444', border: '2px solid #ef4444', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto' }} onMouseEnter={e=>{e.currentTarget.style.background='#ef4444'; e.currentTarget.style.color='white'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#ef4444'}}>
                                Delete Issue
                            </button>
                        )}
                    </div>
                ))}

                {complaints.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📢</div>
                        <h3>No Issues Reported</h3>
                        <p>Your hostel is running smoothly. No complaints found in the backlog.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintsPanel;
