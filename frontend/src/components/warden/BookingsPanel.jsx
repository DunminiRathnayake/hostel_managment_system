import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const BookingsPanel = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const res = await axiosInstance.get('/bookings');
            setBookings(res.data);
        } catch (err) { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBookings(); }, []);

    const updateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
        try {
            await axiosInstance.put(`/bookings/${id}`, { status });
            fetchBookings();
        } catch (err) { alert('Something went wrong. Please try again.'); }
    };

    if (loading) return <div style={{ color: '#64748b' }}>Loading visitor bookings...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Visitor Bookings</h1>
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Visitor Name</th>
                            <th>Visit Details</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b._id}>
                                <td>{b.visitorName} {b.NIC ? `(${b.NIC})` : ''}</td>
                                <td>{b.type.replace('_', ' ')} <br /> <small style={{ color: '#3b82f6', fontWeight: 'bold' }}>{b.studentName ? `Visiting: ${b.studentName}` : ''}</small></td>
                                <td>{new Date(b.date).toLocaleDateString()} at {b.time}</td>
                                <td>
                                    <span className={`badge ${b.status === 'approved' ? 'badge-green' : b.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                                        {b.status}
                                    </span>
                                </td>
                                <td>
                                    {b.status === 'pending' && (
                                        <>
                                            <button className="action-btn btn-success" onClick={() => updateStatus(b._id, 'approved')}>Approve</button>
                                            <button className="action-btn btn-danger" style={{ marginLeft: '0.5rem' }} onClick={() => updateStatus(b._id, 'rejected')}>Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && <tr><td colSpan="5" className="text-center" style={{ padding: '2rem' }}>No visitor bookings found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingsPanel;
