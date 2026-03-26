import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const StudentQRPanel = () => {
    const [qrImage, setQrImage] = useState('');
    const [loading, setLoading] = useState(true);

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
        fetchQR();
        const intervalId = setInterval(fetchQR, 45000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="panel-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h1 className="panel-title">My QR Code</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '500px' }}>
                Present this QR code to the Warden or Scanner Kiosk to securely check in or check out of the hostel.
            </p>

            <div
                style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}
            >
                {loading ? (
                    <div style={{ color: '#64748b', padding: '2rem' }}>Generating secure QR code...</div>
                ) : qrImage ? (
                    <>
                        <img src={qrImage} alt="Secure Check-in QR Code" style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '1rem' }}>Identifies you securely instantly</p>
                    </>
                ) : (
                    <div style={{ color: '#ef4444', padding: '2rem' }}>
                        Error generating secure QR code. Please try again later.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentQRPanel;
