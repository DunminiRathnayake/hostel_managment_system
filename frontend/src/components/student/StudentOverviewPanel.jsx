import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';

/**
 * StudentOverviewPanel - The main dashboard landing page for students.
 * Displays room details, quick actions, cleaning tasks, and a recent activity timeline.
 */
const StudentOverviewPanel = ({ setActiveTab }) => {
    // Access global auth state for user details
    const { user } = useContext(AuthContext);
    
    // UI Local State
    const [recentActivity, setRecentActivity] = useState([]);
    const [roomDetails, setRoomDetails] = useState({ roomNumber: 'Pending Approval', roomType: 'Pending' });
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState(null);
    const [cleaningTask, setCleaningTask] = useState(undefined);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        /**
         * Orchestrate parallel data fetching for all dashboard widgets.
         * Ensures the UI loads in a single pass where possible.
         */
        const fetchDashboardData = async () => {
            // 1. Fetch Room Assignment specifically
            try {
                const roomRes = await axiosInstance.get('/users/my-room');
                if (roomRes.data) {
                    setRoomDetails(roomRes.data);
                }
            } catch (err) {
                console.error("Dashboard Room Allocation Fetch Failed:", err);
            }

            // 2. Fetch all other modules in parallel for performance
            try {
                const responses = await Promise.all([
                    axiosInstance.get('/checkin/my').catch(() => ({ data: [] })),
                    axiosInstance.get('/payments/my').catch(() => ({ data: [] })),
                    axiosInstance.get('/notices/active').catch(() => ({ data: null })),
                    axiosInstance.get('/cleaning/student').catch(() => ({ data: [] })),
                    axiosInstance.get('/bookings/my-appointments').catch(() => ({ data: [] }))
                ]);

                // Map responses to readable variables
                const checkinRes = responses[0];
                const paymentRes = responses[1];
                const noticeRes = responses[2];
                const cleaningRes = responses[3];
                const bookingsRes = responses[4];

                // Global Notice processing
                if (noticeRes.data) {
                    setNotice(noticeRes.data.message);
                }

                // Daily Cleaning task extraction
                if (cleaningRes.data) {
                    setCleaningTask(cleaningRes.data.length > 0 ? cleaningRes.data[0] : null);
                } else {
                    setCleaningTask(null);
                }

                // Approved Visitor bookings
                if (bookingsRes.data) {
                    setBookings(bookingsRes.data.filter(b => b.status === 'approved'));
                }

                // --- Timeline Construction ---
                // We combine multiple data sources into a single sorted activity log
                let combined = [];

                // Inject recent Gate Access events
                if (checkinRes.data && checkinRes.data.length > 0) {
                    checkinRes.data.slice(0, 3).forEach(c => {
                        const actTime = c.checkInTime || c.checkOutTime || c.date;
                        combined.push({
                            id: c._id,
                            timestamp: new Date(actTime).getTime(),
                            type: 'Gate Access',
                            message: `Gate Scan - ${c.isLate ? 'Late Entry' : 'On Time'}`,
                            time: new Date(actTime).toLocaleDateString(undefined, { month:'short', day:'numeric' }),
                            icon: c.isLate ? '⚠️' : '🚪'
                        });
                    });
                }

                // Inject recent Payment events
                if (paymentRes.data && paymentRes.data.length > 0) {
                    paymentRes.data.slice(0, 2).forEach(p => {
                        combined.push({
                            id: p._id,
                            timestamp: new Date(p.createdAt).getTime(),
                            type: 'Finance',
                            message: `Payment of Rs. ${p.amount} ${p.status === 'approved' ? 'Verified' : 'Pending'}`,
                            time: new Date(p.createdAt).toLocaleDateString(undefined, { month:'short', day:'numeric' }),
                            icon: '💳'
                        });
                    });
                }

                // Sort everything by most recent first
                combined.sort((a, b) => b.timestamp - a.timestamp);
                
                // Fallback message if timeline is empty
                if (combined.length === 0) {
                    combined.push({ id: 'sys', type: 'System', message: 'Welcome to Staytra! Your activity will appear here.', time: 'Just now', icon: '👋' });
                }

                // Limit display to top 4 items
                setRecentActivity(combined.slice(0, 4));
            } catch (err) {
                console.error("History build failed:", err);
            }
            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    // Full screen loading state
    if (loading) return <div style={{color:'#64748b'}}>Loading your dashboard...</div>;

    return (
        <div className="panel-container">
            {/* 📢 Global Warden Notice Banner */}
            {notice && (
                <div style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 15px -3px rgba(239,68,68,0.3)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '6rem', opacity: '0.1' }}>📣</div>
                    <div style={{ fontSize: '1.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>📣</div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.2rem 0', fontWeight: 'bold', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wardens Office Announcement</h4>
                        <p style={{ margin: 0, fontWeight: '500', fontSize: '1.1rem' }}>{notice}</p>
                    </div>
                </div>
            )}

            <h1 className="panel-title" style={{ marginBottom: '2rem' }}>Welcome, {user?.name || 'Student'}!</h1>

            {/* --- Main Dashboard Grid --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                
                {/* 1. Digital ID / QR Card */}
                <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', background: '#fef2f2', padding: '0.8rem', borderRadius: '12px' }}>📱</div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', margin: 0 }}>My QR Code</h3>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Gate Check-in Pass</p>
                        </div>
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '0.5rem', opacity: 0.8 }}>🔳</div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Active Digital Pass</p>
                        </div>
                    </div>
                    
                    <button onClick={() => setActiveTab('qrcode')} style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#2563eb'} onMouseLeave={e=>e.currentTarget.style.background='#3b82f6'}>
                        Display Full QR Code
                    </button>
                </div>

                {/* 2. Today's Cleaning Card */}
                <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: cleaningTask ? '2px solid #22c55e' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', background: cleaningTask ? '#dcfce7' : '#f0fdf4', padding: '0.8rem', borderRadius: '12px' }}>✨</div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', margin: 0 }}>Today's Cleaning</h3>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Assigned Task</p>
                        </div>
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        {cleaningTask === undefined ? (
                            <p style={{ margin: 0, color: '#64748b' }}>Loading...</p>
                        ) : cleaningTask ? (
                            <>
                                <h4 style={{ margin: '0 0 0.8rem 0', color: '#1e293b', fontSize: '1.4rem' }}>{cleaningTask.area}</h4>
                                <span style={{ background: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold' }}>Group {new Date().getDay() === 0 ? 7 : new Date().getDay()}</span>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.6 }}>✅</div>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>No cleaning task today</p>
                            </>
                        )}
                    </div>
                    
                    <button onClick={() => setActiveTab('cleaning')} style={{ width: '100%', padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#059669'} onMouseLeave={e=>e.currentTarget.style.background='#10b981'}>
                        View Schedule
                    </button>
                </div>

                {/* 3. Visitor Appointments Card */}
                <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', background: '#fef3c7', padding: '0.8rem', borderRadius: '12px' }}>🤝</div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', margin: 0 }}>Visitors</h3>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Meeting Requests</p>
                        </div>
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', justifyContent: 'center' }}>
                        {loading ? (
                            <p style={{ textAlign: 'center', color: '#64748b' }}>Checking...</p>
                        ) : bookings.length > 0 ? (
                            // List top 2 upcoming approved visits
                            bookings.slice(0, 2).map(b => (
                                <div key={b._id} style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>
                                    <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '0.95rem' }}>{b.visitorName}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(b.date).toLocaleDateString()} @ {b.time}</div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', opacity: 0.5 }}>📭</div>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No approved visits</p>
                            </div>
                        )}
                    </div>
                    
                    <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold' }}>
                        Approved Visits: {bookings.length}
                    </div>
                    
                    <button onClick={() => setActiveTab('visitors')} style={{ width: '100%', padding: '1rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#d97706'} onMouseLeave={e=>e.currentTarget.style.background='#f59e0b'}>
                        View All Bookings
                    </button>
                </div>

                {/* ⚡ Quick Navigation Actions */}
                <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        ⚡ Quick Actions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'center' }}>
                        <button onClick={() => setActiveTab('payments')} style={{ padding: '1rem', background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600' }} onMouseEnter={e=>{e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.borderColor='#93c5fd';}} onMouseLeave={e=>{e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#e2e8f0';}}>
                            <span style={{ fontSize: '1.5rem' }}>💳</span> Pay Monthly Rent
                        </button>
                        <button onClick={() => setActiveTab('complaints')} style={{ padding: '1rem', background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600' }} onMouseEnter={e=>{e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.borderColor='#fca5a5';}} onMouseLeave={e=>{e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#e2e8f0';}}>
                            <span style={{ fontSize: '1.5rem' }}>📢</span> Report an Issue
                        </button>
                        <button onClick={() => setActiveTab('cleaning')} style={{ padding: '1rem', background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600' }} onMouseEnter={e=>{e.currentTarget.style.background='#f0fdf4'; e.currentTarget.style.borderColor='#86efac';}} onMouseLeave={e=>{e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#e2e8f0';}}>
                            <span style={{ fontSize: '1.5rem' }}>✨</span> View Cleaning Schedule
                        </button>
                    </div>
                </div>
            </div>

            {/* --- ⏱️ Recent Timeline Section --- */}
            <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', width: '100%' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    ⏱️ Recent Timeline
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {recentActivity.map(act => (
                        <div key={act.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'flex-start', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '1.5rem', background: 'white', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>{act.icon}</div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 0.4rem 0', color: '#1e293b', fontWeight: '600', fontSize: '0.95rem', lineHeight: '1.4' }}>{act.message}</p>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{act.type} &bull; {act.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentOverviewPanel;
