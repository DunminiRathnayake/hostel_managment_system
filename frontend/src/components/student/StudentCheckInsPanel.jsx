import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const StudentCheckInsPanel = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCheckIns = async () => {
            try {
                const res = await axiosInstance.get('/checkin/my');
                setLogs(res.data);
            } catch (err) {}
            finally { setLoading(false); }
        };
        fetchCheckIns();
        const intervalId = setInterval(fetchCheckIns, 10000);
        return () => clearInterval(intervalId);
    }, []);

    if (loading && logs.length === 0) return <div style={{color:'#64748b'}}>Loading check-in history...</div>;

    const lateCount = logs.filter(l => l.isLate).length;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Check-in History</h1>
            
            {lateCount > 0 && <div className="error-alert" style={{color:'#991b1b', background:'#fee2e2', border:'1px solid #fca5a5'}}>⚠️ Caution: You currently have {lateCount} late check-in(s) recorded.</div>}

            <div className="table-responsive">
                <table className="data-table">
                     <thead>
                        <tr>
                            <th>Date</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log._id} className={log.isLate ? 'late-row' : ''}>
                                <td>{new Date(log.date).toLocaleDateString()}</td>
                                <td>{new Date(log.checkInTime).toLocaleTimeString()}</td>
                                <td>{log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : 'Still inside'}</td>
                                <td className={log.isLate ? 'late-text' : ''}>
                                    {log.isLate ? 'LATE' : 'ON TIME'}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'2rem'}}>No check-in records found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentCheckInsPanel;
