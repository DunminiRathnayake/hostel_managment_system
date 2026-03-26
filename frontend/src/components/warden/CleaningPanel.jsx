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
            alert('Cleaning scheduled successfully');
            setArea('');
            setAssignedRoom('');
            setDate('');
            setNotes('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign cleaning task.');
        } finally {
            setScheduling(false);
        }
    };

    const handleMarkDone = async (id) => {
        if (!window.confirm('Mark this cleaning task as Done?')) return;
        try {
            await axiosInstance.put(`/cleaning/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to update cleaning status');
        }
    };

    // Prevent past dates
    const today = new Date().toISOString().split('T')[0];

    if (loading) return <div style={{ color: '#64748b' }}>Loading Cleaning Details...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Cleaning Management</h1>

            <div className="form-card" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
                <h3>Assign Cleaning Task</h3>
                <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <select value={area} onChange={e => setArea(e.target.value)} required style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                        <option value="" disabled>Select Area</option>
                        {ALLOWED_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    <select value={assignedRoom} onChange={e => setAssignedRoom(e.target.value)} required style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                        <option value="" disabled>Select Room</option>
                        {rooms.map(r => <option key={r._id} value={r._id}>{r.roomNumber} ({r.type})</option>)}
                    </select>

                    <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} required style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />

                    <textarea placeholder="Additional Notes (Optional)" value={notes} onChange={e => setNotes(e.target.value)} rows="3" style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}></textarea>

                    <button type="submit" disabled={scheduling} className="action-btn">
                        {scheduling ? 'Scheduling...' : 'Assign Cleaning Task'}
                    </button>
                </form>
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Area</th>
                            <th>Responsible Room</th>
                            <th>Date</th>
                            <th>Cleaning Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(t => (
                            <tr key={t._id}>
                                <td style={{ fontWeight: 500 }}>{t.area}</td>
                                <td>{t.assignedRoom?.roomNumber || 'Unknown Room'}</td>
                                <td>{new Date(t.date).toLocaleDateString()}</td>
                                <td>
                                    <span className={`badge ${t.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>
                                        {t.status === 'completed' ? 'Done' : 'Pending'}
                                    </span>
                                </td>
                                <td>
                                    {t.status === 'pending' && (
                                        <button className="action-btn btn-success" onClick={() => handleMarkDone(t._id)}>Mark as Done</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {tasks.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No cleaning tasks configured.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CleaningPanel;
