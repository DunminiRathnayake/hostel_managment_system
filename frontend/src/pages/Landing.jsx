import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    // Native Intersection Observer for Stripe/Linear scroll reveals without third-party dependencies crashing Vite
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing-dark-container">
            {/* Animated Gradient Background */}
            <div className="animated-bg"></div>
            
            <div className="landing-content-layer">
                {/* Hero Section */}
                <header className="hero-dark">
                    <div className="hero-text">
                        <span className="hero-badge scroll-animate delay-0">Welcome to the Future</span>
                        <h1 className="hero-title scroll-animate delay-1">
                            Smart Hostel <br />Management System
                        </h1>
                        <p className="hero-subtitle scroll-animate delay-2">
                            Manage your hostel easily in one place. Streamlined check-ins, instant payments, and seamless communication.
                        </p>
                        <div className="hero-actions scroll-animate delay-3">
                            <Link to="/register" className="btn-primary hover-scale">Get Started</Link>
                            <Link to="/login" className="btn-secondary hover-scale">Login</Link>
                        </div>
                    </div>
                    
                    <div className="hero-visual scroll-animate delay-4" style={{ position: 'relative' }}>
                        
                        {/* 🔔 Creative Floating "Hostel Material" Hover Badges */}
                        <div className="glass-card float-animation" style={{ position: 'absolute', top: '-20px', right: '-30px', zIndex: 20, padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59,130,246,0.3)', border: '1px solid rgba(59,130,246,0.5)', animationDelay: '0.5s', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
                            <span style={{ fontSize: '1.2rem' }}>✨</span>
                            <div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cleaning Request</div>
                                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600' }}>Room 104 Pending</div>
                            </div>
                        </div>

                        <div className="glass-card float-animation" style={{ position: 'absolute', bottom: '40px', left: '-40px', zIndex: 20, padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.5)', animationDelay: '1.5s', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
                            <span style={{ fontSize: '1.2rem' }}>📱</span>
                            <div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QR Gate Check-In</div>
                                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600' }}>Student Verified</div>
                            </div>
                        </div>

                        {/* Slow Float WebKit Animation Native */}
                        <div className="glass-dashboard-mockup float-animation" style={{ position: 'relative', zIndex: 10 }}>
                            <div className="glass-sidebar" style={{ gap: '1.2rem' }}>
                                <div className="glass-dot-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏢</div>
                                <div style={{ fontSize: '1.3rem', opacity: 0.7 }}>🛏️</div>
                                <div style={{ fontSize: '1.3rem', opacity: 0.7 }}>💳</div>
                                <div style={{ fontSize: '1.3rem', opacity: 0.7 }}>📢</div>
                            </div>
                            <div className="glass-main">
                                <div className="glass-nav" style={{ justifyContent: 'space-between', padding: '0 1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: '600' }}>Hostel Overview</h3>
                                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.7rem', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 'bold' }}>LIVE</span>
                                        <div className="glass-avatar"></div>
                                    </div>
                                </div>
                                
                                <div className="glass-cards-row">
                                    <div className="glass-stat-card" style={{ padding: '0.8rem 1rem' }}>
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Occupancy</div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>52 / 75</span>
                                        </div>
                                    </div>
                                    <div className="glass-stat-card" style={{ padding: '0.8rem 1rem' }}>
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Beds</div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>23</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="glass-chart" style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QR Gate Activity (Last 7 Days)</div>
                                    {[40,70,50,90,60,80].map((h,i) => <div key={i} className="glass-bar" style={{height:`${h}%`}}></div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Features Section */}
                <section id="features" className="features-section">
                    <div className="section-header scroll-animate delay-0">
                        <h2>Everything You Need</h2>
                        <p>Five powerful features designed to make hostel life effortless.</p>
                    </div>

                    <div className="features-grid">
                        {[
                            { icon: '🛏️', title: 'Room Management', desc: 'Easily track available rooms, assignments, and capacity in real-time.' },
                            { icon: '📸', title: 'QR Check-in', desc: 'Scan securely at the gate with dynamic, lightning-fast QR codes.' },
                            { icon: '✨', title: 'Cleaning', desc: 'Request and track room cleaning schedules straight from your phone.' },
                            { icon: '💳', title: 'Payments', desc: 'Upload receipts and track your rent history without the paperwork.' },
                            { icon: '📢', title: 'Complaints', desc: 'Submit maintenance issues and track their progress until resolved.' }
                        ].map((f, i) => (
                            <div 
                                className={`feature-card glass-card scroll-animate delay-${i + 1} hover-scale-card`} 
                                key={i}
                            >
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* User Roles Section */}
                <section id="roles" className="roles-section">
                    <div className="section-header scroll-animate delay-0">
                        <h2>Built for Everyone</h2>
                        <p>Tailored experiences for every user physically interacting with the campus.</p>
                    </div>
                    
                    <div className="roles-grid">
                        {[
                            { icon: '👩‍🎓', title: 'Students', desc: 'Enjoy direct access to check-ins, cleaning requests, and payment logs right in your pocket.' },
                            { icon: '👨‍✈️', title: 'Wardens', desc: 'Get a bird\'s-eye view of hostel capacity, student activity, and handle approvals instantly.' },
                            { icon: '👨‍👩‍👧', title: 'Visitors', desc: 'Securely book guest appointments in advance and glide through the gate easily.' }
                        ].map((role, i) => (
                            <div 
                                key={i}
                                className={`role-card glass-card scroll-animate delay-${i + 1} hover-scale-card`}
                            >
                                <div className="role-icon">{role.icon}</div>
                                <h3>{role.title}</h3>
                                <p>{role.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action */}
                <section className="cta-section">
                    <div className="cta-box glass-card scroll-animate delay-1">
                        <h2>Ready to get started?</h2>
                        <p>Join thousands experiencing smarter hostel management.</p>
                        <Link to="/register" className="btn-primary btn-large hover-scale" style={{ display: 'inline-block' }}>Create Account</Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="footer-dark scroll-animate delay-0">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h2>🏢 Staytra</h2>
                            <p>Making campus living better, safer, and smarter.</p>
                        </div>
                        <div className="footer-links">
                            <a href="#features">Features</a>
                            <Link to="/gallery">Gallery</Link>
                            <Link to="/visitor">Visitor Portal</Link>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} Smart Hostel Management System. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Landing;
