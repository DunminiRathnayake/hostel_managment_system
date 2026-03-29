import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const StudentQRPanel = () => {
    const [qrImage, setQrImage] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(45);

    const fetchHistory = async () => {
        try {
            const res = await axiosInstance.get('/checkin/my');
            setHistory(res.data || []);
        } catch (err) {
            console.error("Failed to fetch history logs", err);
        }
    };

    useEffect(() => {
        const fetchQR = async () => {
            try {
                const res = await axiosInstance.get('/users/my-qr');
                setQrImage(res.data.qrImage);
            } catch (err) {
                console.error("Failed to fetch secure QR", err);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch calls natively tracking bounds
        fetchQR();
        fetchHistory();

        // Data refresh loop
        const fetchInterval = setInterval(() => {
            fetchQR();
            fetchHistory();
            setTimeLeft(45);
        }, 45000);

        // Visual countdown loop
        const countdownInterval = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(fetchInterval);
            clearInterval(countdownInterval);
        };
    }, []);

    return (
        <div className="panel-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', justifyContent: 'center' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Access Pass</h1>
                <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: '500' }}>
                    Show this code at the entrance
                </p>
            </div>

            <div style={{ 
                background: 'white', 
                padding: '3rem', 
                borderRadius: '24px', 
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                border: '1px solid #e2e8f0',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                maxWidth: '450px',
                width: '100%',
                position: 'relative',
                overflow: 'hidden'
            }}>
                
                {/* Active scan frame styling */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(to right, #38bdf8, #8b5cf6)' }}></div>

                {loading ? (
                    <div style={{ padding: '6rem 2rem', color: '#94a3b8', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        Generating Secure Pass...
                    </div>
                ) : qrImage ? (
                    <>
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', border: '2px dashed #cbd5e1', marginBottom: '2rem' }}>
                            <img src={qrImage} alt="Secure Check-in QR Code" style={{ width: '250px', height: '250px', objectFit: 'contain' }} />
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#f8fafc', padding: '0.8rem 1.5rem', borderRadius: '999px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '1.2rem' }}>🔄</span>
                            <div>
                                <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase' }}>Auto-refreshes in </span>
                                <span style={{ color: '#3b82f6', fontSize: '1.1rem', fontWeight: 'bold' }}>00:{timeLeft.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: '3rem 2rem', color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        Network error securely loading token.
                    </div>
                )}
            </div>

            {/* Check-In History Log */}
            <div style={{ marginTop: '3rem', width: '100%', maxWidth: '800px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>⏱️</span> Gate Activity Log
                    </h2>
                </div>
                
                {history.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <th style={{ padding: '1rem 2rem', fontWeight: '600' }}>Date</th>
                                    <th style={{ padding: '1rem 2rem', fontWeight: '600' }}>Check In</th>
                                    <th style={{ padding: '1rem 2rem', fontWeight: '600' }}>Check Out</th>
                                    <th style={{ padding: '1rem 2rem', fontWeight: '600' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((record) => (
                                    <tr key={record._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 2rem', color: '#334155', fontWeight: '500' }}>
                                            {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '1rem 2rem', color: '#3b82f6', fontWeight: '600' }}>
                                            {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </td>
                                        <td style={{ padding: '1rem 2rem', color: '#8b5cf6', fontWeight: '600' }}>
                                            {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </td>
                                        <td style={{ padding: '1rem 2rem' }}>
                                            {record.isLate 
                                                ? <span className="badge" style={{ background: '#fee2e2', color: '#ef4444' }}>Late Entry</span>
                                                : <span className="badge" style={{ background: '#dcfce7', color: '#10b981' }}>On Time</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                        <p>No recent gate scans recorded.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default StudentQRPanel;
