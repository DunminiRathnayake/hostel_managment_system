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
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axiosInstance.get('/dashboard');
                setStats(res.data);
            } catch (err) {
                setError('Failed to load dashboard overview.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{color:'#64748b'}}>Loading overview...</div>;
    if (error) return <div style={{color:'#ef4444'}}>{error}</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Dashboard Overview</h1>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Students</h3>
                    <p className="stat-number text-blue">{stats.totalStudents}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Rooms</h3>
                    <p className="stat-number text-purple">{stats.totalRooms}</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Complaints</h3>
                    <p className="stat-number text-red">{stats.pendingComplaints}</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Payments</h3>
                    <p className="stat-number text-yellow">{stats.pendingPayments}</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Bookings</h3>
                    <p className="stat-number text-green">{stats.pendingBookings}</p>
                </div>
            </div>
        </div>
    );
};

export default SummaryOverview;
