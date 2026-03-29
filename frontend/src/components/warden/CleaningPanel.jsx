import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const CleaningPanel = () => {
    const [tasks, setTasks] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scheduling, setScheduling] = useState(false);

    const [area, setArea] = useState('');
    const [assignedRoom, setAssignedRoom] = useState('');
    const [date, setDate] = useState('');
    const [notes, setNotes] = useState('');

    const ALLOWED_AREAS = [
        "Common Bathroom 1", "Common Bathroom 2",
        "Study Area", "Living Area", "Balcony", "Dining Area"
    ];

    const fetchData = async () => {
        try {
            const [tasksRes, roomsRes] = await Promise.all([
                axiosInstance.get('/cleaning'),
                axiosInstance.get('/rooms')
            ]);
            setTasks(tasksRes.data || []);
            setRooms(roomsRes.data.rooms || []);
        } catch (err) {
            console.error('Failed to fetch cleaning data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSchedule = async (e) => {
        e.preventDefault();
        setScheduling(true);
        try {
            await axiosInstance.post('/cleaning', { area, assignedRoom, date, notes });
            alert('Schedule assigned successfully');
            setArea('');
            setAssignedRoom('');
            setDate('');
            setNotes('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign schedule.');
        } finally {
            setScheduling(false);
        }
    };

    const handleMarkDone = async (id) => {
        if (!window.confirm('Mark this area as clean?')) return;
        try {
            await axiosInstance.put(`/cleaning/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const today = new Date().toISOString().split('T')[0];

    if (loading) return <div style={{ color: '#64748b' }}>Loading Cleaning Schedules...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Cleaning Schedule</h1>

            {/* Top Action Dashboard */}
            <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    ✨ Assign New Schedule
                </h3>
                <form onSubmit={handleSchedule} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Cleaning Area</label>
                        <select value={area} onChange={e => setArea(e.target.value)} required style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}>
                            <option value="" disabled>Select Area</option>
                            {ALLOWED_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Assigned Room</label>
                        <select value={assignedRoom} onChange={e => setAssignedRoom(e.target.value)} required style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}>
                            <option value="" disabled>Select Room</option>
                            {rooms.map(r => <option key={r._id} value={r._id}>Room {r.roomNumber}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Scheduled Date</label>
                        <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} required style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    </div>

                    <button type="submit" disabled={scheduling} className="action-btn" style={{ padding: '0.85rem', fontSize: '1rem', fontWeight: '600', height: '46px' }}>
                        {scheduling ? 'Saving...' : 'Assign Schedule'}
                    </button>
                    
                </form>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#334155' }}>Active Schedules</h2>
                <span className="badge badge-blue">Total: {tasks.length}</span>
            </div>

            {/* List of Schedules (Cards) */}
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
                        
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Assigned Room</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3b82f6' }}>{t.assignedRoom?.roomNumber || 'Unknown Room'}</span>
                        </div>

                        {t.status === 'pending' && (
                            <button className="action-btn btn-success" onClick={() => handleMarkDone(t._id)} style={{ width: '100%', padding: '0.8rem', background: '#10b981', fontWeight: '600' }}>
                                Mark As Done
                            </button>
                        )}
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                        <h3>No Active Schedules</h3>
                        <p>Assign a cleaning schedule to a room above.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CleaningPanel;
