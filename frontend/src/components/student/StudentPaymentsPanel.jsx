import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const StudentPaymentsPanel = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('monthly');
    const [description, setDescription] = useState('');
    const [paymentType, setPaymentType] = useState('bank');
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
        if (!slipImage) return alert('Please upload a payment receipt.');
        if (category === 'other' && !description.trim()) return alert('Description is required for Custom payments.');
        
        setSubmitting(true);
        const formData = new FormData();
        formData.append('amount', amount);
        formData.append('category', category);
        formData.append('paymentType', paymentType);
        formData.append('slipImage', slipImage); // Vital Multer payload parsing natively
        if (category === 'other') formData.append('description', description);

        try {
            await axiosInstance.post('/payments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            alert('Done! Receipt submitted.');
            setAmount(''); setCategory('monthly'); setDescription(''); setPaymentType('bank'); setSlipImage(null);
            e.target.reset();
            fetchMyPayments();
        } catch (err) { alert(err.response?.data?.message || 'Failed to submit payment receipt.'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <div style={{color:'#64748b'}}>Loading payments...</div>;

    const pendingCount = payments.filter(p => p.status === 'pending').length;

    return (
        <div className="panel-container">
            <h1 className="panel-title">My Financial Allocations</h1>
            
            {pendingCount > 0 && <div className="error-alert" style={{color:'#92400e', background:'#fef3c7', border:'1px solid #fde68a'}}>⚠️ You currently have {pendingCount} payment(s) pending approval.</div>}

            <div className="form-card" style={{marginBottom:'2rem', maxWidth:'700px'}}>
                <h3 style={{marginBottom:'1rem', color:'#1e293b'}}>Lodge New Payment Component</h3>
                <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                    <div style={{display:'flex', gap:'1rem'}}>
                        <input type="number" placeholder="Amount (LKR)" value={amount} onChange={e=>setAmount(e.target.value)} required className="form-group-alt" style={{flex:1, border:'1px solid #cbd5e1', padding:'0.85rem', borderRadius:'8px'}} min="1"/>
                        <select value={category} onChange={e=>setCategory(e.target.value)} required className="form-group-alt" style={{flex:1, border:'1px solid #cbd5e1', padding:'0.85rem', borderRadius:'8px'}}>
                            <option value="monthly">Monthly Subscription Rent</option>
                            <option value="key_money">Key Deposit Asset</option>
                            <option value="other">Other Charge (Requires Detail Trace)</option>
                        </select>
                    </div>
                    {category === 'other' && (
                        <input type="text" placeholder="Enter custom detail" value={description} onChange={e=>setDescription(e.target.value)} className="form-group-alt" style={{border:'1px solid #cbd5e1', padding:'0.85rem', borderRadius:'8px'}} required/>
                    )}
                    <div style={{display:'flex', gap:'1rem'}}>
                         <select value={paymentType} onChange={e=>setPaymentType(e.target.value)} required className="form-group-alt" style={{flex:1, border:'1px solid #cbd5e1', padding:'0.85rem', borderRadius:'8px'}}>
                            <option value="bank">Direct Bank Transfer</option>
                            <option value="online">Online Payment Gateway</option>
                        </select>
                        <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={e=>setSlipImage(e.target.files[0])} required style={{flex:1, paddingTop:'0.85rem', color:'#475569'}}/>
                    </div>
                    
                    <button type="submit" disabled={submitting} className="action-btn" style={{background:'#8b5cf6', padding:'1rem', marginTop:'0.5rem', fontWeight:'600'}}>
                        {submitting ? 'Authenticating Object...' : 'Upload Validation Slip'}
                    </button>
                </form>
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead><tr><th>Generation Date</th><th>LKR Amount</th><th>Category Logic</th><th>Current Pipeline Status</th></tr></thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p._id}>
                                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td>Rs. {p.amount}</td>
                                <td style={{textTransform:'capitalize'}}>{p.category.replace('_',' ')}</td>
                                <td><span className={`badge ${p.status==='approved'?'badge-green':p.status==='rejected'?'badge-red':'badge-yellow'}`}>{p.status}</span></td>
                            </tr>
                        ))}
                        {payments.length === 0 && <tr><td colSpan="4" className="text-center" style={{padding:'2rem'}}>No payment records found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default StudentPaymentsPanel;
