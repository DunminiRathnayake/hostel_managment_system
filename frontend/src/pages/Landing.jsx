import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    return (
        <div className="landing-container">
            {/* Hero Section */}
            <div className="landing-hero fade-in-up">
                <div className="hero-content">
                    <span className="hero-badge">Next-Generation Software</span>
                    <h1 className="hero-title">
                        Hostel Management <br /> <span className="hero-gradient">Reimagined.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Experience smart, secure, and fast hostel operations. View facilities, manage payments, and stay connected with our modern platform.
                    </p>

                    <div className="hero-buttons">
                        <Link to="/login" className="global-btn hero-btn-main">
                            Login
                        </Link>
                        <Link to="/gallery" className="global-btn global-btn-outline hero-btn-secondary">
                            View Gallery
                        </Link>
                    </div>
                </div>

                <div className="hero-graphics">
                    {/* Mock dashboard graphic visualization organically rendering a modern dashboard trace visually */}
                    <div className="dashboard-mockup">
                        <div className="mockup-header">
                            <div className="dot red"></div>
                            <div className="dot yellow"></div>
                            <div className="dot green"></div>
                        </div>
                        <div className="mockup-body">
                            <div className="mockup-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 0', alignItems: 'center' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📊</div>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', opacity: 0.6 }}>👥</div>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', opacity: 0.6 }}>⚙️</div>
                            </div>
                            <div className="mockup-main">
                                <div className="mockup-card" style={{ width: '100%', padding: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>Warden Overview</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>Hostel capacity at 85%</p>
                                    </div>
                                    <div style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Online</div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className="mockup-card" style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>🛏️</span>
                                        <b style={{ color: '#2563eb', fontSize: '1.8rem', lineHeight: 1 }}>12</b>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Available Rooms</p>
                                    </div>
                                    <div className="mockup-card" style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>🎫</span>
                                        <b style={{ color: '#ec4899', fontSize: '1.8rem', lineHeight: 1 }}>5</b>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Pending Check-ins</p>
                                    </div>
                                </div>
                                <div className="mockup-card" style={{ marginTop: '15px', width: '100%', padding: '12px 15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }}></div>
                                        <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>Alice checked in to Room 101</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }}></div>
                                        <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>New maintenance request (Room 205)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="landing-features">
                <div className="global-card feature-card fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="feature-icon">📸</div>
                    <h3>Fast Check-in</h3>
                    <p>Easily check in and out of the hostel using your phone and our smart QR scanners.</p>
                </div>

                <div className="global-card feature-card fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="feature-icon">💳</div>
                    <h3>Easy Payments</h3>
                    <p>Track your rent, upload receipts, and manage all your payments in one place.</p>
                </div>

                <div className="global-card feature-card fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <div className="feature-icon">👥</div>
                    <h3>Visitor Portal</h3>
                    <p>Securely book appointments for parents and guests visiting the hostel rooms or students.</p>
                </div>
            </div>
        </div>
    );
};

export default Landing;
