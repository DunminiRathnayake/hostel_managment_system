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
        if (!window.confirm(`Mark payment token effectively as ${status}?`)) return;
        try {
            await axiosInstance.put(`/payments/${id}`, { status });
            fetchPayments();
        } catch (err) { alert('Something went wrong. Please try again.'); }
    };

    if (loading) return <div style={{color:'#64748b'}}>Retrieving Payment Streams...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Payment Triage Logs</h1>
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Value Transfer</th>
                            <th>Designated Category</th>
                            <th>Status Tag</th>
                            <th>Warden Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p._id}>
                                <td>{p.studentId?.name || p.studentId || 'Ghost Account'}</td>
                                <td>LKR {p.amount}</td>
                                <td style={{textTransform:'capitalize'}}>{p.category?.replace('_', ' ')}</td>
                                <td>
                                    <span className={`badge ${p.status === 'approved' ? 'badge-green' : p.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td>
                                    {p.status === 'pending' && (
                                        <>
                                            <button className="action-btn btn-success" onClick={() => updateStatus(p._id, 'approved')}>Approve</button>
                                            <button className="action-btn btn-danger" onClick={() => updateStatus(p._id, 'rejected')}>Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {payments.length === 0 && <tr><td colSpan="5" className="text-center" style={{padding:'2rem'}}>No payments found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentsPanel;
