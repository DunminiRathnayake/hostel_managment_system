import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const StudentVisitorPanel = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axiosInstance.get('/bookings/my-appointments');
                setBookings(res.data || []);
            } catch (err) {
                console.error("Fetch Visitor Bookings Failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'rejected': return '#ef4444';
            default: return '#64748b';
        }
    };

    if (loading) return <div className="panel-container"><h3>Loading visits...</h3></div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">My Visitor Appointments</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>List of visitor requests to meet you.</p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {bookings.length > 0 ? (
                    bookings.map(booking => (
                        <div key={booking._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{booking.visitorName}</h3>
                                <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                                    <span>📅 {new Date(booking.date).toLocaleDateString()}</span>
                                    <span>⏰ {booking.time}</span>
                                    <span>🆔 {booking.visitorNIC}</span>
                                </div>
                                {booking.purpose && (
                                    <p style={{ margin: '0.8rem 0 0 0', color: '#475569', fontSize: '0.95rem', fontStyle: 'italic' }}>
                                        "{booking.purpose}"
                                    </p>
                                )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ background: getStatusColor(booking.status), color: 'white', padding: '6px 16px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    {booking.status}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
                        <h3 style={{ color: '#1e293b', margin: '0 0 0.5rem 0' }}>No Appointments Found</h3>
                        <p style={{ color: '#64748b', margin: 0 }}>Visitors who book a meet-up with you will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentVisitorPanel;
