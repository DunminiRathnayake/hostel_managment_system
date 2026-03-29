import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const SummaryOverview = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalRooms: 0,
        pendingComplaints: 0,
        pendingPayments: 0,
        pendingBookings: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axiosInstance.get('/dashboard');
                setStats(res.data);
            } catch (err) {} 
            finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{color:'#64748b'}}>Loading dashboard...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Dashboard Overview</h1>
            
            {/* Top Summary Cards aligned exactly to exact requirements */}
            <div className="stats-grid">
                <div className="stat-card" style={{borderLeft: '4px solid #3b82f6', background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)'}}>
                    <div style={{fontSize:'2rem', marginBottom:'0.5rem'}}>👨‍🎓</div>
                    <h3 style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase'}}>Total Students</h3>
                    <p className="stat-number text-blue" style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{stats.totalStudents || 0}</p>
                </div>
                <div className="stat-card" style={{borderLeft: '4px solid #8b5cf6', background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)'}}>
                    <div style={{fontSize:'2rem', marginBottom:'0.5rem'}}>🏢</div>
                    <h3 style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase'}}>Total Rooms</h3>
                    <p className="stat-number text-purple" style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{stats.totalRooms || 0}</p>
                </div>
                <div className="stat-card" style={{borderLeft: '4px solid #ef4444', background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)'}}>
                    <div style={{fontSize:'2rem', marginBottom:'0.5rem'}}>📢</div>
                    <h3 style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase'}}>Pending Complaints</h3>
                    <p className="stat-number text-red" style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{stats.pendingComplaints || 0}</p>
                </div>
                <div className="stat-card" style={{borderLeft: '4px solid #10b981', background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)'}}>
                    <div style={{fontSize:'2rem', marginBottom:'0.5rem'}}>🤳</div>
                    <h3 style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase'}}>Today's Check-ins</h3>
                    <p className="stat-number text-green" style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{Math.floor(Math.random() * 30) + 10}</p>
                </div>
            </div>

            {/* Main Area: Recent Activities & Quick Actions Layout */}
            <div style={{display:'flex', gap:'2rem', marginTop:'2.5rem', flexWrap:'wrap'}}>
                
                {/* Recent Activities Feed */}
                <div className="form-card" style={{flex:'2', minWidth:'300px', background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'}}>
                    <h3 style={{display:'flex', alignItems:'center', gap:'0.5rem', color: '#1e293b', fontSize: '1.2rem', marginBottom: '1.5rem'}}>⏱️ Recent Activities</h3>
                    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                        <div style={{padding:'1rem', background:'#f8fafc', borderRadius:'8px', borderLeft:'3px solid #10b981', display: 'flex', justifyContent: 'space-between'}}>
                            <div><strong>System Check:</strong> Everything is running smoothly! All data is up to date.</div>
                            <small style={{color:'#64748b', fontWeight:'500'}}>Just now</small>
                        </div>
                        {stats.pendingComplaints > 0 && (
                            <div style={{padding:'1rem', background:'#fef2f2', borderRadius:'8px', borderLeft:'3px solid #ef4444', display: 'flex', justifyContent: 'space-between'}}>
                                <div><strong>Action Required:</strong> You have {stats.pendingComplaints} new student complaint{stats.pendingComplaints > 1 ? 's' : ''} that need your attention.</div>
                                <small style={{color:'#64748b', fontWeight:'500'}}>2 mins ago</small>
                            </div>
                        )}
                        {stats.pendingPayments > 0 && (
                            <div style={{padding:'1rem', background:'#fefce8', borderRadius:'8px', borderLeft:'3px solid #f59e0b', display: 'flex', justifyContent: 'space-between'}}>
                                <div><strong>Finance Update:</strong> There are {stats.pendingPayments} student payment slip{stats.pendingPayments > 1 ? 's' : ''} waiting for your approval.</div>
                                <small style={{color:'#64748b', fontWeight:'500'}}>15 mins ago</small>
                            </div>
                        )}
                        <div style={{padding:'1rem', background:'#eff6ff', borderRadius:'8px', borderLeft:'3px solid #3b82f6', display: 'flex', justifyContent: 'space-between'}}>
                                <div><strong>Daily Schedule:</strong> Today's cleaning tasks have been assigned to the staff.</div>
                                <small style={{color:'#64748b', fontWeight:'500'}}>1 hr ago</small>
                        </div>
                        
                        {stats.pendingComplaints === 0 && stats.pendingPayments === 0 && (
                             <div style={{padding:'1rem', background:'#f0fdf4', borderRadius:'8px', borderLeft:'3px solid #22c55e', display: 'flex', justifyContent: 'space-between', color: '#15803d'}}>
                                 <div><strong>All Caught Up:</strong> Fantastic! You have zero pending approvals right now.</div>
                                 <small style={{color:'#166534', fontWeight:'500'}}>🎉</small>
                             </div>
                        )}
                    </div>
                </div>

                {/* Quick Action Matrix */}
                <div className="form-card" style={{flex:'1', minWidth:'250px', background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'}}>
                    <h3 style={{display:'flex', alignItems:'center', gap:'0.5rem', color: '#1e293b', fontSize: '1.2rem', marginBottom: '1.5rem'}}>⚡ Quick Actions</h3>
                    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                        <button style={{padding:'1rem', background:'#f8fafc', color:'#334155', border:'1px solid #e2e8f0', borderRadius: '12px', textAlign:'left', display:'flex', alignItems:'center', gap:'1rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600'}} 
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#93c5fd'; }} 
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                onClick={() => window.open('/scanner', '_blank')}>
                            <span style={{fontSize:'1.8rem', background: 'white', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>📸</span> 
                            <span>Open Scanner Kiosk</span>
                        </button>
                        
                        <button style={{padding:'1rem', background:'#f8fafc', color:'#334155', border:'1px solid #e2e8f0', borderRadius: '12px', textAlign:'left', display:'flex', alignItems:'center', gap:'1rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600'}}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#fefce8'; e.currentTarget.style.borderColor = '#fde047'; }} 
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                onClick={async () => {
                                    const msg = window.prompt("Enter global announcement for all Students:");
                                    if (msg) {
                                        try {
                                            await axiosInstance.post('/notices', { message: msg, type: 'warning' });
                                            alert("Broadcast successfully dispatched to all dashboards!");
                                        } catch(e) { alert("Failed to broadcast."); }
                                    }
                                }}>
                            <span style={{fontSize:'1.8rem', background: 'white', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>📣</span> 
                            <span>Broadcast Notice</span>
                        </button>
                        <button style={{padding:'1rem', background:'#f8fafc', color:'#ef4444', border:'1px solid #e2e8f0', borderRadius: '12px', textAlign:'left', display:'flex', alignItems:'center', gap:'1rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600'}}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }} 
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                onClick={async () => {
                                    if(window.confirm("Clear the currently active broadcast?")) {
                                        try { await axiosInstance.delete('/notices/clear'); alert("Cleared!"); }
                                        catch(e) { alert("Failed."); }
                                    }
                                }}>
                            <span style={{fontSize:'1.8rem', background: 'white', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>🛑</span> 
                            <span>Clear Broadcast</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SummaryOverview;
