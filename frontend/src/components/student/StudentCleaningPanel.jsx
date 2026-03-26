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
            <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#64748b' }}>
                View all assigned cleaning tasks
            </p>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Area</th>
                            <th>Responsible Room</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(t => (
                            <tr key={t._id}>
                                <td style={{ fontWeight: 500, color: '#1e293b' }}>{t.area}</td>
                                <td>{t.assignedRoom?.roomNumber || 'Unknown Room'}</td>
                                <td>{new Date(t.date).toLocaleDateString()}</td>
                                <td>
                                    <span className={`badge ${t.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>
                                        {t.status === 'completed' ? 'Done' : 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {tasks.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No cleaning tasks assigned</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentCleaningPanel;
