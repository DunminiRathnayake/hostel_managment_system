import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const StudentPaymentsPanel = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('monthly');
    const [slipImage, setSlipImage] = useState(null);

    const fetchMyPayments = async () => {
        try {
            const res = await axiosInstance.get('/payments/my');
            setPayments(res.data);
        } catch (err) {} 
        finally { setLoading(false); }
    };
    
    useEffect(() => { fetchMyPayments(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const numericAmount = parseInt(amount, 10);
        if (!numericAmount || numericAmount < 100) {
            return alert('Please enter a valid amount (Minimum Rs. 100).');
        }
        if (numericAmount > 1000000) {
            return alert('Amount exceeds maximum single transaction limit (Rs. 1,000,000).');
        }

        if (!slipImage) return alert('Please upload a payment receipt.');
        
        setSubmitting(true);
        const formData = new FormData();
        formData.append('amount', amount);
        formData.append('category', category);
        formData.append('paymentType', 'bank'); // Simplified internal payload
        formData.append('slipImage', slipImage);

        try {
            await axiosInstance.post('/payments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            alert('Upload Slip successful!');
            setAmount(''); setCategory('monthly'); setSlipImage(null);
            e.target.reset();
            fetchMyPayments();
        } catch (err) { alert(err.response?.data?.message || 'Failed to upload slip.'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <div style={{color:'#64748b'}}>Loading payment history...</div>;

    const pendingCount = payments.filter(p => p.status === 'pending').length;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Student Payments</h1>
            
            {pendingCount > 0 && <div className="error-alert" style={{color:'#92400e', background:'#fef3c7', border:'1px solid #fde68a'}}>⚠️ You currently have {pendingCount} payment slip(s) pending warden approval.</div>}

            <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    💳 Submit Payment
                </h3>
                <form onSubmit={handleSubmit} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1.5rem', alignItems:'end'}}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Amount (LKR)</label>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="e.g. 5000" value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9]/g, ''))} required style={{ padding:'0.8rem 1rem', borderRadius:'8px', border:'1px solid #cbd5e1', outline:'none' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Payment Type</label>
                        <select value={category} onChange={e=>setCategory(e.target.value)} required style={{ padding:'0.8rem 1rem', borderRadius:'8px', border:'1px solid #cbd5e1', outline:'none', background:'white' }}>
                            <option value="monthly">Monthly Rent</option>
                            <option value="key_money">Key Deposit</option>
                            <option value="other">Other Charge</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Upload Slip (Image of Receipt)</label>
                        <div style={{ border: '2px dashed #cbd5e1', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', background: '#f8fafc' }}>
                             <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={e=>setSlipImage(e.target.files[0])} required style={{ color:'#475569', cursor:'pointer' }}/>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={submitting} className="action-btn" style={{ gridColumn: '1 / -1', padding:'1rem', fontSize:'1rem', fontWeight:'600', background:'#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        {submitting ? 'Uploading...' : 'Upload Slip'}
                    </button>
                </form>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#334155' }}>Payment History</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {payments.map(p => (
                    <div key={p._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'transform 0.2s, box-shadow 0.2s' }}
                         onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)'; }}
                         onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(0,0,0,0.05)'; }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.3rem 0', color: '#1e293b' }}>Rs. {p.amount}</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'capitalize' }}>
                                    <span>🗓️</span> {new Date(p.createdAt).toLocaleDateString()} &bull; {p.category.replace('_',' ')}
                                </p>
                            </div>
                        </div>
                        
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Payment Status</span>
                            <span className={`badge ${p.status==='approved'?'badge-green':p.status==='rejected'?'badge-red':'badge-yellow'}`} style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                {p.status}
                            </span>
                        </div>

                        {p.slipImage && (
                            <button onClick={() => window.open(`http://localhost:5000${p.slipImage}`, '_blank')} 
                                    style={{ width: '100%', padding: '0.9rem', background: '#eff6ff', color: '#3b82f6', fontWeight: '600', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} 
                                    onMouseEnter={e => e.currentTarget.style.background='#dbeafe'} onMouseLeave={e => e.currentTarget.style.background='#eff6ff'}>
                                👁️ View My Slip
                            </button>
                        )}
                    </div>
                ))}

                {payments.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
                        <h3>No Payment History</h3>
                        <p>You have not uploaded any payment slips yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentPaymentsPanel;
