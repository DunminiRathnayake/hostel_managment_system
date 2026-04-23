import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const DAY_GROUP_MAP = {
    1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
    4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday'
};

const getTodayGroup = () => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
};

const StudentCleaningPanel = () => {
    const [tasks, setTasks]     = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const todayGroup = getTodayGroup();
    const todayDay   = DAY_GROUP_MAP[todayGroup];
    const todayDate  = new Date().toLocaleDateString(undefined, {
        weekday: 'long', month: 'long', day: 'numeric'
    });

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await axiosInstance.get('/cleaning/student');
                setTasks(res.data || []);
            } catch (err) {
                console.error('Failed to fetch cleaning tasks', err);
                setError('Could not load your cleaning tasks. Please try again later.');
            }
        };

        const fetchSchedule = async () => {
            try {
                const res = await axiosInstance.get('/cleaning/schedule');
                setSchedule(res.data || []);
            } catch (err) {
                console.error('Failed to fetch cleaning schedule', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
        fetchSchedule();
    }, []);

    if (loading) return (
        <div className="panel-container">
            <div style={{ color: '#64748b', padding: '2rem' }}>Loading your cleaning tasks…</div>
        </div>
    );

    return (
        <div className="panel-container">
            <h1 className="panel-title">Your Cleaning Tasks Today</h1>

            {/* Date + Group context bar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                border: '1px solid #bfdbfe', borderRadius: '12px',
                padding: '1rem 1.4rem', marginBottom: '2rem'
            }}>
                <span style={{ fontSize: '1.5rem' }}>📅</span>
                <div>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{todayDate}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                        Today is a{' '}
                        <strong style={{ color: '#3b82f6' }}>Group {todayGroup}</strong>
                        {' '}cleaning day ({todayDay})
                    </p>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div style={{
                    padding: '2rem', textAlign: 'center', background: '#fff5f5',
                    borderRadius: '16px', border: '1px solid #fca5a5', color: '#b91c1c'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                    <p>{error}</p>
                </div>
            )}

            {/* Tasks assigned */}
            {!error && tasks.length > 0 && (
                <div style={{ maxWidth: '560px' }}>
                    {tasks.map(task => (
                        <div key={task._id} style={{
                            background: 'white', borderRadius: '20px',
                            border: '2px solid #3b82f6',
                            boxShadow: '0 8px 30px -4px rgba(59,130,246,0.15)',
                            overflow: 'hidden', marginBottom: '1.5rem'
                        }}>
                            {/* Card header stripe */}
                            <div style={{
                                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                padding: '1.2rem 1.6rem',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                                    <span style={{ fontSize: '1.4rem' }}>✨</span>
                                    <span style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>
                                        Assigned Area
                                    </span>
                                </div>
                                <span style={{
                                    background: task.status === 'completed'
                                        ? 'rgba(134,239,172,0.9)' : 'rgba(253,224,71,0.9)',
                                    color: task.status === 'completed' ? '#166534' : '#854d0e',
                                    paddingInline: '12px', paddingBlock: '4px',
                                    borderRadius: '999px', fontWeight: '700', fontSize: '0.85rem'
                                }}>
                                    {task.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                                </span>
                            </div>

                            {/* Card body */}
                            <div style={{ padding: '1.8rem 1.6rem' }}>
                                <p style={{
                                    fontSize: '2rem', fontWeight: '800', color: '#1e293b',
                                    margin: '0 0 1.4rem 0', letterSpacing: '-0.5px'
                                }}>
                                    {task.area}
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{
                                            background: '#f1f5f9', borderRadius: '8px',
                                            width: '32px', height: '32px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1rem', flexShrink: 0
                                        }}>🏠</span>
                                        <span style={{ color: '#475569', fontSize: '0.95rem' }}>
                                            Your room has been assigned this cleaning area for today
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{
                                            background: '#f1f5f9', borderRadius: '8px',
                                            width: '32px', height: '32px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1rem', flexShrink: 0
                                        }}>👥</span>
                                        <span style={{ color: '#475569', fontSize: '0.95rem' }}>
                                            Group <strong style={{ color: '#3b82f6' }}>{todayGroup}</strong>
                                            {' '}cleaning rotation ({todayDay})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Tip box */}
                    <div style={{
                        display: 'flex', gap: '0.8rem',
                        background: '#f0fdf4', border: '1px solid #86efac',
                        borderRadius: '12px', padding: '1rem 1.2rem'
                    }}>
                        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>💡</span>
                        <p style={{ margin: 0, color: '#166534', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            Please ensure your assigned areas are clean by end of day.
                            The warden will mark them as done once inspected.
                        </p>
                    </div>
                </div>
            )}

            {/* No task today */}
            {!error && tasks.length === 0 && (
                <div>
                    {/* Empty state card */}
                    <div style={{
                        maxWidth: '560px', padding: '3rem 2rem', textAlign: 'center',
                        background: 'white', borderRadius: '20px',
                        border: '1px dashed #cbd5e1',
                        boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                        <h3 style={{ fontSize: '1.4rem', color: '#1e293b', margin: '0 0 0.5rem' }}>
                            No Task Today!
                        </h3>
                        <p style={{ color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                            Your room is not on cleaning duty today.
                            Your group will next clean on its assigned day.
                        </p>
                    </div>

                    {/* Weekly rotation table */}
                    <div style={{ maxWidth: '560px' }}>
                        <h3 style={{ fontSize: '1rem', color: '#334155', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📆 Weekly Rotation Schedule
                        </h3>
                        <div style={{
                            background: 'white', borderRadius: '14px',
                            border: '1px solid #e2e8f0', overflow: 'hidden',
                            boxShadow: '0 4px 10px -2px rgba(0,0,0,0.04)'
                        }}>
                            {Object.entries(DAY_GROUP_MAP).map(([g, day], idx) => {
                                const isToday = Number(g) === todayGroup;
                                const daySchedule = schedule.find(s => s.day === day);
                                const rooms = daySchedule && daySchedule.rooms.length > 0 
                                    ? daySchedule.rooms.map(r => `Room ${r.roomNumber}`).join(', ')
                                    : 'No Rooms';

                                return (
                                    <div
                                        key={g}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.8rem 1.2rem',
                                            borderBottom: idx < 6 ? '1px solid #f1f5f9' : 'none',
                                            background: isToday ? '#eff6ff' : 'transparent',
                                            fontWeight: isToday ? '700' : '400',
                                        }}
                                    >
                                        <span style={{ color: isToday ? '#2563eb' : '#475569', fontSize: '0.95rem' }}>
                                            {isToday ? '▶ ' : ''}{day}
                                        </span>
                                        <span style={{
                                            background: isToday ? '#3b82f6' : '#f1f5f9',
                                            color: isToday ? 'white' : '#64748b',
                                            padding: '3px 12px', borderRadius: '999px',
                                            fontSize: '0.85rem', fontWeight: '700'
                                        }}>
                                            {rooms}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCleaningPanel;
