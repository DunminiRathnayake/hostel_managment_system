import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const PaymentsPanel = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayments = async () => {
        try {
            const res = await axiosInstance.get('/payments');
            setPayments(res.data);
        } catch (err) { } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPayments(); }, []);

    const updateStatus = async (id, status) => {
        if (!window.confirm(`Mark this payment as ${status}?`)) return;
        try {
            await axiosInstance.put(`/payments/${id}`, { status });
            fetchPayments();
        } catch (err) { alert('Something went wrong. Please try again.'); }
    };

    if (loading) return <div style={{color:'#64748b'}}>Loading payments...</div>;

    const pendingCount = payments.filter(p => p.status === 'pending').length;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Warden Payment Approvals</h1>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#334155' }}>All Student Payments</h2>
                <span className={`badge ${pendingCount > 0 ? 'badge-red' : 'badge-blue'}`}>Pending Action: {pendingCount}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {payments.map(p => (
                    <div key={p._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'transform 0.2s, box-shadow 0.2s' }}
                         onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)'; }}
                         onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(0,0,0,0.05)'; }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.3rem 0', color: '#1e293b' }}>Rs. {p.amount}</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', fontWeight: 'bold' }}>
                                    👨‍🎓 {p.studentName || p.studentId?.email || 'Unknown Student'}
                                </p>
                                <p style={{ margin: '0.4rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                    {p.category?.replace('_', ' ')} &bull; {new Date(p.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        
                        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: p.status === 'pending' ? '1rem' : '0' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Payment Status</span>
                            <span className={`badge ${p.status==='approved'?'badge-green':p.status==='rejected'?'badge-red':'badge-yellow'}`} style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                {p.status}
                            </span>
                        </div>

                        {p.slipImage && (
                            <button onClick={() => window.open(`http://localhost:5000${p.slipImage}`, '_blank')} 
                                    style={{ width: '100%', marginBottom: p.status === 'pending' ? '1rem' : '0', padding: '0.9rem', background: '#eff6ff', color: '#3b82f6', fontWeight: '600', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} 
                                    onMouseEnter={e => e.currentTarget.style.background='#dbeafe'} onMouseLeave={e => e.currentTarget.style.background='#eff6ff'}>
                                👁️ View Payment Slip
                            </button>
                        )}

                        {p.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => updateStatus(p._id, 'approved')} style={{ flex: 1, padding: '0.9rem', background: '#10b981', color: 'white', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='#059669'} onMouseLeave={e => e.currentTarget.style.background='#10b981'}>
                                    Approve
                                </button>
                                <button onClick={() => updateStatus(p._id, 'rejected')} style={{ flex: 1, padding: '0.9rem', background: '#ef4444', color: 'white', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='#dc2626'} onMouseLeave={e => e.currentTarget.style.background='#ef4444'}>
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {payments.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                        <h3>No Outstanding Payments</h3>
                        <p>No student payment slips have been logged into the system yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentsPanel;
