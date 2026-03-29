import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axiosInstance from '../api/axios';
import './Scanner.css';

const Scanner = () => {
    // UI States
    const [status, setStatus] = useState('idle'); // 'idle', 'success', 'late', 'error'
    const [overlayMessage, setOverlayMessage] = useState({ title: '', sub: '', icon: '' });

    const processingRef = useRef(false);

    // Hardware State
    const [cameras, setCameras] = useState([]);
    const [activeCameraId, setActiveCameraId] = useState('');
    const scannerRef = useRef(null);
    const [recentScans, setRecentScans] = useState([]);

    // Manual Testing State
    const [manualStudentId, setManualStudentId] = useState('');
    const [showAdminMode, setShowAdminMode] = useState(false);

    const playSoundEffect = (type) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const gainNode = ctx.createGain();
            gainNode.connect(ctx.destination);
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

            if (type === 'success') {
                const osc = ctx.createOscillator();
                osc.connect(gainNode);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.start();
                osc.stop(ctx.currentTime + 0.15); // Short high beep
            } else if (type === 'late') {
                // Double Beep
                const osc1 = ctx.createOscillator();
                osc1.connect(gainNode);
                osc1.type = 'square';
                osc1.frequency.setValueAtTime(400, ctx.currentTime);
                osc1.start();
                osc1.stop(ctx.currentTime + 0.15);

                setTimeout(() => {
                    try {
                        const osc2 = ctx.createOscillator();
                        osc2.connect(gainNode);
                        osc2.type = 'square';
                        osc2.frequency.setValueAtTime(400, ctx.currentTime);
                        osc2.start();
                        osc2.stop(ctx.currentTime + 0.15);
                    } catch (e) { }
                }, 200);
            } else if (type === 'error') {
                const osc = ctx.createOscillator();
                osc.connect(gainNode);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, ctx.currentTime); // Low error tone
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
            }
        } catch (e) { console.error('Audio hardware crashed'); }
    };

    const triggerOverlay = (state, title, sub, icon) => {
        setStatus(state);
        setOverlayMessage({ title, sub, icon });
        playSoundEffect(state); // 'success', 'late', 'error'

        // Auto reset UI
        setTimeout(() => {
            setStatus('idle');
            setOverlayMessage({ title: '', sub: '', icon: '' });
            if (scannerRef.current && scannerRef.current.getState() === 2) {
                try { scannerRef.current.resume(); } catch (e) { }
            }
            processingRef.current = false;
        }, 3500); // 3-4s pause
    };

    const processPayload = async (payload, source) => {
        if (processingRef.current) return;
        processingRef.current = true;

        if (scannerRef.current && scannerRef.current.getState() === 2) {
            try { scannerRef.current.pause(true); } catch (e) { }
        }

        try {
            const res = await axiosInstance.post('/checkin/scan', payload);

            const log = res.data.record || res.data;
            const isLate = log.isLate || res.data.isLate;
            const isCheckOut = !!log.checkOutTime;
            const studentName = res.data.studentName || log.studentId?.name || (source === 'manual' ? manualStudentId : 'Unknown Student');

            // Format UI Status
            const actionString = isCheckOut ? 'Check-out' : 'Check-in';
            const executionState = isLate ? 'late' : 'success';
            const icon = isLate ? '⚠' : '✔';
            
            let title = `${actionString.toUpperCase()} SUCCESS`;
            let sub = studentName;

            if (isLate) {
                title = "LATE ENTRY";
                sub = `${studentName} flagged past curfew`;
            }

            triggerOverlay(executionState, title, sub, icon);

            // History Mapping
            const trace = {
                id: log._id || Date.now(),
                target: studentName,
                action: actionString,
                time: new Date().toLocaleTimeString(),
                isLate
            };
            setRecentScans(prev => [trace, ...prev].slice(0, 5));

        } catch (err) {
            if (err.response?.status === 400 && err.response?.data?.message?.includes('wait')) {
                triggerOverlay('late', 'COOLDOWN ACTIVE', err.response.data.message, '⏳');
                return;
            }

            const errorText = err.response?.status === 401
                ? "Invalid or expired QR Authorization"
                : err.response?.data?.message || 'Invalid QR Code / Server Error';

            triggerOverlay('error', 'INVALID QR', errorText, '❌');
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        processPayload({ token: manualStudentId }, 'manual');
    };

    // Initialize Cameras
    useEffect(() => {
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length > 0) {
                setCameras(devices);
                const backCamera = devices.find(d =>
                    d.label.toLowerCase().includes('back') ||
                    d.label.toLowerCase().includes('environment')
                );
                setActiveCameraId(backCamera ? backCamera.id : devices[0].id);
            } else {
                triggerOverlay('error', 'Camera Error', 'No camera detected.', '❌');
            }
        }).catch(err => {
            triggerOverlay('error', 'Camera Error', 'Please allow camera access.', '❌');
        });

        return () => {
            if (scannerRef.current) {
                try {
                    if (scannerRef.current.isScanning) {
                        scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(e => { });
                    } else {
                        scannerRef.current.clear();
                    }
                } catch (e) { }
            }
        };
    }, []);

    // Start Optical Stream
    useEffect(() => {
        if (!activeCameraId) return;

        const html5QrCode = new Html5Qrcode("qr-reader-kiosk");
        scannerRef.current = html5QrCode;

        html5QrCode.start(
            activeCameraId,
            { fps: 10, qrbox: { width: 300, height: 300 } },
            (decodedText) => {
                try {
                    const qrData = JSON.parse(decodedText);
                    if (!qrData.token) throw new Error();
                    processPayload({ token: qrData.token }, 'optical');
                } catch (e) {
                    if (!processingRef.current) {
                        processingRef.current = true;
                        if (scannerRef.current && scannerRef.current.getState() === 2) {
                            try { scannerRef.current.pause(true); } catch (err) { }
                        }
                        triggerOverlay('error', 'Invalid Input', 'Invalid QR Code Format natively.', '❌');
                    }
                }
            },
            () => { } // Ignore scan noise quietly
        ).catch(err => {
            console.warn("Optical hardware load error:", err);
        });

        return () => {
            try {
                if (html5QrCode.isScanning) {
                    html5QrCode.stop().then(() => html5QrCode.clear()).catch(e => { });
                } else {
                    html5QrCode.clear();
                }
            } catch (e) { }
        };
    }, [activeCameraId]);

    // Render Overlay Conditional
    const getOverlayClass = () => {
        if (status === 'success') return 'overlay-success';
        if (status === 'late') return 'overlay-late';
        if (status === 'error') return 'overlay-error';
        return 'overlay-idle'; // transparent hide
    };

    return (
        <div className="scanner-fullscreen-kiosk">
            <div className="kiosk-header">
                <h1 className="kiosk-title">Hostel Entry Scanner</h1>
                <p className="kiosk-subtitle">Scan student QR to check-in/out</p>
            </div>

            <div className="kiosk-body">
                <div className="scanner-card-kiosk">
                    {/* Hardware Dropdown */}
                    {cameras.length > 0 && (
                        <select
                            value={activeCameraId}
                            onChange={(e) => setActiveCameraId(e.target.value)}
                        >
                            {cameras.map(camera => (
                                <option key={camera.id} value={camera.id}>
                                    {camera.label || `Camera ${camera.id}`}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Native Camera Output */}
                    <div id="qr-reader-kiosk" style={{ width: '100%' }}></div>

                    {/* Status Overlays directly bound strictly resolving visuals seamlessly */}
                    {status !== 'idle' ? (
                        <div className={`kiosk-overlay ${getOverlayClass()}`}>
                            <div className="kiosk-icon">{overlayMessage.icon}</div>
                            <div className="kiosk-message">{overlayMessage.title}</div>
                            <div className="kiosk-submessage">{overlayMessage.sub}</div>
                        </div>
                    ) : (
                        <div className="kiosk-overlay overlay-idle" style={{ opacity: 0.1 }}>
                            <div className="kiosk-submessage" style={{ textShadow: '0 0 10px black' }}>Ready for next scan...</div>
                        </div>
                    )}

                    {/* Admin Mode Toggle */}
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button onClick={() => setShowAdminMode(!showAdminMode)} style={{ background: 'transparent', border: '1px solid #334155', color: '#64748b', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {showAdminMode ? 'Close Admin Mode' : 'Admin Mode'}
                        </button>
                    </div>

                    {showAdminMode && (
                        <div className="kiosk-manual-test fade-in-up">
                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Manual Token Mode</label>
                            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Secure Auth Token"
                                    required
                                    value={manualStudentId}
                                    onChange={(e) => setManualStudentId(e.target.value)}
                                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #475569', color: 'white', outline: 'none' }}
                                />
                                <button type="submit" disabled={status !== 'idle'} style={{ padding: '0.8rem 1rem', borderRadius: '8px', background: '#ec4899', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Connect
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {recentScans.length > 0 && (
                    <div className="kiosk-history">
                        <h3><span style={{ fontSize: '1.2rem' }}>⏱</span> Recent Scans</h3>
                        <table className="kiosk-data-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Time</th>
                                    <th>Action</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentScans.map(s => (
                                    <tr key={s.id} className={s.isLate ? 'row-late' : ''}>
                                        <td style={{ fontWeight: '600', color: s.isLate ? '#f87171' : 'white' }}>{s.target}</td>
                                        <td>{s.time}</td>
                                        <td>
                                            <span className={`badge-kiosk`} style={{ background: s.action === 'Check-in' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)', color: s.action === 'Check-in' ? '#38bdf8' : '#a855f7' }}>
                                                {s.action}
                                            </span>
                                        </td>
                                        <td>
                                            {s.isLate
                                                ? <span className="badge-kiosk" style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}>⚠️ LATE</span>
                                                : <span className="badge-kiosk" style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)' }}>✔ NORMAL</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Scanner;
