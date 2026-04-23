import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const DAYS = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
    { id: 7, name: 'Sunday' }
];

const CleaningPanel = () => {
    const [rooms, setRooms] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [roomsRes, tasksRes, scheduleRes] = await Promise.all([
                axiosInstance.get('/rooms'),
                axiosInstance.get('/cleaning'),
                axiosInstance.get('/cleaning/schedule')
            ]);
            setRooms(roomsRes.data.rooms || []);
            setTasks(tasksRes.data || []);
            setSchedules(scheduleRes.data || []);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSlotChange = async (dayName, slotIndex, newRoomId) => {
        try {
            const sched = schedules.find(s => s.day === dayName);
            let dayRoomNums = sched && sched.rooms ? sched.rooms.map(r => r.roomNumber || null) : [];
            
            while(dayRoomNums.length < 2) dayRoomNums.push(null);
            dayRoomNums[slotIndex] = newRoomId === "" ? null : newRoomId;
            dayRoomNums = dayRoomNums.filter(Boolean);

            await axiosInstance.post('/cleaning/schedule', { day: dayName, rooms: dayRoomNums });
            fetchData();
        } catch (err) {
            alert('Failed to update schedule');
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

    if (loading) return <div style={{ color: '#64748b' }}>Loading Cleaning Manager...</div>;

    const assignedRoomNums = new Set();
    schedules.forEach(sched => {
        if (sched.rooms) {
            sched.rooms.forEach(r => {
                if (r) assignedRoomNums.add(String(r.roomNumber || r));
            });
        }
    });

    const isRoomAvailable = (roomNum, currentSelectedNum) => {
        return !assignedRoomNums.has(String(roomNum)) || String(roomNum) === String(currentSelectedNum);
    };

    return (
        <div className="panel-container">
            <h1 className="panel-title">Cleaning Group Management</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
                Rooms are automatically assigned to clean different areas based on their Group number. 
                <strong>Group 1</strong> cleans on Mondays, <strong>Group 2</strong> on Tuesdays, etc.
                The system automatically handles area rotation for the rooms in the active group.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Left Col: Group Setters */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ padding: '1.2rem', margin: 0, background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>Weekly Schedule</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Day (Group)</th>
                                <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Assigned Rooms</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map(day => {
                                const sched = schedules.find(s => s.day === day.name);
                                const dayRooms = sched ? sched.rooms : [];
                                const slot1Room = dayRooms[0] || null;
                                const slot2Room = dayRooms[1] || null;

                                const handleSelect = (idx, e) => {
                                    handleSlotChange(day.name, idx, e.target.value);
                                };

                                return (
                                    <tr 
                                        key={day.id} 
                                        style={{ 
                                            borderBottom: '1px solid #e2e8f0',
                                            background: (new Date().getDay() || 7) === day.id ? '#fefce8' : 'transparent',
                                            transition: 'background 0.3s'
                                        }}
                                    >
                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#334155', position: 'relative' }}>
                                            {(new Date().getDay() || 7) === day.id && (
                                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#f59e0b' }} />
                                            )}
                                            {day.name} <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '0.85rem' }}>(G{day.id})</span>
                                            {(new Date().getDay() || 7) === day.id && (
                                                <span style={{ marginLeft: '10px', fontSize: '0.7rem', background: '#fef08a', color: '#a16207', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Today</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                                <select 
                                                    value={slot1Room?.roomNumber || ''}
                                                    onChange={(e) => handleSelect(0, e)}
                                                    style={{ 
                                                        padding: '0.5rem 1rem', 
                                                        borderRadius: '8px', 
                                                        border: '1px solid #cbd5e1', 
                                                        outline: 'none', 
                                                        background: 'white', 
                                                        cursor: 'pointer',
                                                        borderColor: (new Date().getDay() || 7) === day.id ? '#fde047' : '#cbd5e1'
                                                    }}
                                                >
                                                    <option value="">-- Select Room 1 --</option>
                                                    {rooms.filter(r => isRoomAvailable(r.roomNumber, slot1Room?.roomNumber)).map(r => (
                                                        <option key={r._id} value={r.roomNumber}>Room {r.roomNumber}</option>
                                                    ))}
                                                </select>
                                                <select 
                                                    value={slot2Room?.roomNumber || ''}
                                                    onChange={(e) => handleSelect(1, e)}
                                                    style={{ 
                                                        padding: '0.5rem 1rem', 
                                                        borderRadius: '8px', 
                                                        border: '1px solid #cbd5e1', 
                                                        outline: 'none', 
                                                        background: 'white', 
                                                        cursor: 'pointer',
                                                        borderColor: (new Date().getDay() || 7) === day.id ? '#fde047' : '#cbd5e1'
                                                    }}
                                                >
                                                    <option value="">-- Select Room 2 --</option>
                                                    {rooms.filter(r => isRoomAvailable(r.roomNumber, slot2Room?.roomNumber)).map(r => (
                                                        <option key={r._id} value={r.roomNumber}>Room {r.roomNumber}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Right Col: Today's Generated Tasks */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.4rem', color: '#334155', margin: 0 }}>Today's Tasks</h2>
                        <span className="badge badge-blue">Group {new Date().getDay() || 7}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        {tasks.map(t => (
                            <div key={t._id} style={{ background: 'white', padding: '1.2rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.3rem 0', color: '#1e293b' }}>{t.area}</h3>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>
                                            Assigned Room: <span style={{ color: '#3b82f6' }}>{t.assignedRoom?.roomNumber || t.assignedRoom || 'Unknown'}</span>
                                        </span>
                                    </div>
                                    <span className={`badge ${t.status === 'completed' ? 'badge-green' : 'badge-yellow'}`} style={{ fontWeight: 'bold' }}>
                                        {t.status === 'completed' ? 'Done' : 'Pending'}
                                    </span>
                                </div>

                                {t.status === 'pending' && (
                                    <button className="action-btn btn-success" onClick={() => handleMarkDone(t._id)} style={{ width: '100%', padding: '0.6rem', background: '#10b981', fontWeight: '600', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                        Mark As Done
                                    </button>
                                )}
                            </div>
                        ))}

                        {tasks.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
                                <h3>No Tasks Today</h3>
                                <p>There are no rooms assigned to today's group, or all tasks are clear.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CleaningPanel;
