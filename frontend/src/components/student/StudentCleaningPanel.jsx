import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const StudentCleaningPanel = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axiosInstance.get('/cleaning');
                setTasks(res.data || []);
            } catch (err) {
                console.error('Failed to fetch cleaning schedule', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    if (loading) return <div style={{ color: '#64748b' }}>Loading cleaning schedule...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Cleaning Schedule</h1>
            <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem', color: '#64748b' }}>
                View all assigned cleaning tasks across the hostel.
            </p>

            {/* List of Schedules (Cards View matching Warden UI) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {tasks.map(t => (
                    <div key={t._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'transform 0.2s, box-shadow 0.2s' }}
                         onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)'; }}
                         onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(0,0,0,0.05)'; }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.3rem 0', color: '#1e293b' }}>{t.area}</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span>🗓️</span> {new Date(t.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <span className={`badge ${t.status === 'completed' ? 'badge-green' : 'badge-yellow'}`} style={{ fontWeight: 'bold' }}>
                                {t.status === 'completed' ? 'Done' : 'Pending'}
                            </span>
                        </div>
                        
                        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Assigned Room</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6' }}>{t.assignedRoom?.roomNumber || 'Unknown Room'}</span>
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                        <h3>No Cleaning Schedules</h3>
                        <p>There are no active cleaning schedules currently assigned.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentCleaningPanel;
