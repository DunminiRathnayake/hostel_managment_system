import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const CheckInsPanel = () => {
    const [logs, setLogs] = useState([]);
    const [report, setReport] = useState([]);
    const [viewMode, setViewMode] = useState('raw'); // 'raw' or 'monthly'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCheckIns = async () => {
        try {
            if (viewMode === 'raw') {
                const res = await axiosInstance.get('/checkin');
                setLogs(Array.isArray(res.data) ? res.data : []);
            } else {
                const res = await axiosInstance.get('/checkin/monthly-report');
                setReport(Array.isArray(res.data) ? res.data : []);
            }
            setError('');
        } catch (err) {
            console.error('Check-in fetch error:', err);
            setError('Failed to fetch records. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchCheckIns();
        // Polling for live updates every 15 seconds
        const intervalId = setInterval(fetchCheckIns, 15000);
        return () => clearInterval(intervalId);
    }, [viewMode]);

    if (loading && logs.length === 0 && report.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>📂 Synching live gate activity...</div>;
    }

    return (
        <div className="panel-container fade-in">
            <h1 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ background: '#3b82f6', color: 'white', padding: '0.4rem', borderRadius: '10px', fontSize: '1rem' }}>🤳</span>
                Check-in Terminal Records
            </h1>

            <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.8rem' }}>
                <button 
                    onClick={() => setViewMode('raw')} 
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', border: 'none', background: viewMode === 'raw' ? '#0f172a' : '#f1f5f9', color: viewMode === 'raw' ? 'white' : '#64748b', fontWeight: '600', transition: 'all 0.2s' }}
                >
                    Live Logs
                </button>
                <button 
                    onClick={() => setViewMode('monthly')} 
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', border: 'none', background: viewMode === 'monthly' ? '#ef4444' : '#f1f5f9', color: viewMode === 'monthly' ? 'white' : '#64748b', fontWeight: '600', transition: 'all 0.2s' }}
                >
                    Late Report
                </button>
            </div>

            {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #fee2e2' }}>⚠️ {error}</div>}

            <div className="table-responsive" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                            <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Resident</th>
                            {viewMode === 'raw' ? (
                                <>
                                    <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Time In</th>
                                    <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Time Out</th>
                                    <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Sentiment</th>
                                </>
                            ) : (
                                <>
                                    <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Email</th>
                                    <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Violation Count</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {viewMode === 'raw' ? (
                            logs.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No check-in activity recorded yet.</td></tr>
                            ) : (
                                logs.map((log, idx) => (
                                    <tr key={log._id || idx} style={{ borderTop: '1px solid #f1f5f9', background: log.isLate ? '#fff1f2' : 'white' }}>
                                        <td style={{ padding: '1.2rem 1.5rem', fontWeight: 'bold' }}>{log.studentName || 'Guest Student'}</td>
                                        <td style={{ padding: '1.2rem 1.5rem', color: '#475569' }}>
                                            {log.checkInTime ? new Date(log.checkInTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : '---'}
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem', color: '#64748b' }}>
                                            {log.checkOutTime ? new Date(log.checkOutTime).toLocaleString([], { hour: '2-digit', minute: '2-digit' }) : <span style={{ opacity: 0.5 }}>Inside Hostel</span>}
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: (log.isLate || log.isLateCheckOut) ? '#ef4444' : '#10b981' }}>
                                                {log.isLateCheckOut ? '📢 LATE CHECKOUT' : log.isLate ? '📢 LATE ENTRY' : '✓ OK'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )
                        ) : (
                            report.length === 0 ? (
                                <tr><td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>All residents are on time! No late entries found.</td></tr>
                            ) : (
                                report.map((r, idx) => (
                                    <tr key={r._id || idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1.2rem 1.5rem', fontWeight: 'bold' }}>{r.student?.name || 'Unknown'}</td>
                                        <td style={{ padding: '1.2rem 1.5rem', color: '#64748b' }}>{r.student?.email || 'N/A'}</td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            <span style={{ background: '#fef2f2', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', border: '1px solid #fee2e2' }}>
                                                {r.lateCount} Violations
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )
                        )}
                    </tbody>
                </table>
            </div>
            <style>{`.fade-in { animation: fadeIn 0.4s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default CheckInsPanel;
