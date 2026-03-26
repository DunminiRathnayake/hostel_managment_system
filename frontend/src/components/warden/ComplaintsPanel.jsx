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
        if (!window.confirm(`Mark this complaint as ${status}?`)) return;
        try {
            await axiosInstance.put(`/complaints/${id}/status`, { status });
            fetchComplaints();
        } catch (err) { alert('Failed to update complaint status'); }
    };

    if (loading) return <div style={{color:'#64748b'}}>Loading complaints...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Active Complaints</h1>
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complaints.map(c => (
                            <tr key={c._id}>
                                <td>{c.studentId?.name || 'Local'}</td>
                                <td style={{maxWidth: '300px'}}>{c.description}</td>
                                <td>
                                    <span className={`badge ${c.status === 'resolved' ? 'badge-green' : c.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td>
                                    {c.status !== 'resolved' && (
                                        <button className="action-btn btn-success" onClick={() => updateStatus(c._id, 'resolved')}>Mark Resolved</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {complaints.length === 0 && <tr><td colSpan="4" className="text-center" style={{padding:'2rem'}}>No complaints found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComplaintsPanel;
