import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';

const StudentOverviewPanel = ({ setActiveTab }) => {
    const { user } = useContext(AuthContext);
    const [recentActivity, setRecentActivity] = useState([]);
    const [roomDetails, setRoomDetails] = useState({ roomNumber: 'Pending Approval', roomType: 'Pending' });
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch dynamic room assignment overriding standard null user bounds natively
                const roomRes = await axiosInstance.get('/users/my-room');
                if (roomRes.data) {
                    setRoomDetails(roomRes.data);
                }
            } catch (err) {
                console.error("Dashboard Room Allocation Fetch Failed:", err);
            }

            try {
                // Fetch dynamic history across modules securely
                const [checkinRes, paymentRes, noticeRes] = await Promise.all([
                    axiosInstance.get('/checkin/my').catch(() => ({ data: [] })),
                    axiosInstance.get('/payments/my').catch(() => ({ data: [] })),
                    axiosInstance.get('/notices/active').catch(() => ({ data: null }))
                ]);

                if (noticeRes.data) {
                    setNotice(noticeRes.data.message);
                }

                let combined = [];

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

                combined.sort((a, b) => b.timestamp - a.timestamp);
                
                if (combined.length === 0) {
                    combined.push({ id: 'sys', type: 'System', message: 'Welcome to Staytra! Your activity will appear here.', time: 'Just now', icon: '👋' });
                }

                setRecentActivity(combined.slice(0, 4));
            } catch (err) {
                console.error("History build failed:", err);
            }
            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div style={{color:'#64748b'}}>Loading your dashboard...</div>;

    return (
        <div className="panel-container">
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                
                {/* My QR Code Card */}
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

                {/* Quick Actions */}
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

            {/* Recent Activity */}
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
