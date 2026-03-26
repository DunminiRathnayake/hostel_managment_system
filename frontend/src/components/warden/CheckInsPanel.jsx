import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const CheckInsPanel = () => {
    const [logs, setLogs] = useState([]);
    const [report, setReport] = useState([]);
    const [viewMode, setViewMode] = useState('raw');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchCheckIns = async () => {
            try {
                if (viewMode === 'raw') {
                    const res = await axiosInstance.get('/checkin');
                    setLogs(res.data);
                } else {
                    const res = await axiosInstance.get('/checkin/monthly-report');
                    setReport(res.data);
                }
            } catch (err) {}
            finally { setLoading(false); }
        };
        fetchCheckIns();
        const intervalId = setInterval(fetchCheckIns, 10000);
        return () => clearInterval(intervalId);
    }, [viewMode]);

    return (
        <div className="panel-container">
            <h1 className="panel-title">Check-in Records</h1>
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button className={`action-btn ${viewMode === 'raw' ? 'btn-success' : ''}`} onClick={() => setViewMode('raw')}>All Check-ins</button>
                <button className={`action-btn ${viewMode === 'monthly' ? 'btn-success' : ''}`} onClick={() => setViewMode('monthly')}>Late Check-ins</button>
            </div>
            
            {loading ? <div style={{color:'#64748b'}}>Loading records...</div> : (
                <div className="table-responsive">
                    <table className="data-table">
                        {viewMode === 'raw' ? (
                            <>
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log._id} className={log.isLate ? 'late-row' : ''}>
                                            <td>{log.studentId?.name || log.studentId || 'Unknown Student'}</td>
                                            <td>{new Date(log.checkInTime).toLocaleString()}</td>
                                            <td>{log.checkOutTime ? new Date(log.checkOutTime).toLocaleString() : 'Not checked out'}</td>
                                            <td className={log.isLate ? 'late-text' : ''}>
                                                {log.isLate ? '⚠️ LATE' : 'On Time'}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'2rem'}}>No records found.</td></tr>}
                                </tbody>
                            </>
                        ) : (
                            <>
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Email</th>
                                        <th>Total Late Check-ins</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.map(r => (
                                        <tr key={r._id}>
                                            <td>{r.student?.name}</td>
                                            <td>{r.student?.email}</td>
                                            <td className="late-text" style={{fontWeight:'700'}}>{r.lateCount} Late Check-ins</td>
                                        </tr>
                                    ))}
                                    {report.length === 0 && <tr><td colSpan="3" style={{textAlign:'center', padding:'2rem'}}>No late check-ins recorded.</td></tr>}
                                </tbody>
                            </>
                        )}
                    </table>
                </div>
            )}
        </div>
    );
};

export default CheckInsPanel;
