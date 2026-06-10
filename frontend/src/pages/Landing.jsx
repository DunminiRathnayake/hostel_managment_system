import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import './Landing.css';

const Landing = () => {
    const [averageData, setAverageData] = useState({ average: 0, total: 0 });
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

        const fetchAverage = async () => {
            try {
                const res = await axiosInstance.get('/reviews/average');
                setAverageData(res.data);
            } catch (err) {
                console.error('Failed to load average rating');
            }
        };
        fetchAverage();

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
                        {averageData.total > 0 && (
                            <div className="hero-rating scroll-animate delay-1-5" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '-0.5rem', marginBottom: '1.5rem', background: 'rgba(251, 191, 36, 0.1)', padding: '0.5rem 1rem', borderRadius: '999px', width: 'fit-content', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                                <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1.1rem' }}>★ {averageData.average}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>from {averageData.total} student reviews</span>
                            </div>
                        )}
                        <p className="hero-subtitle scroll-animate delay-2">
                            Manage your hostel easily in one place. Streamlined check-ins, instant payments, and seamless communication.
                        </p>
                        <div className="hero-actions scroll-animate delay-3">
                            <Link to="/register" className="btn-primary hover-scale">Get Started</Link>
                            <Link to="/login" className="btn-secondary hover-scale">Login</Link>
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

                {/* Reviews Section */}
                {(averageData && averageData.total > 0) && (
                    <section id="reviews" className="reviews-section">
                        <div className="section-header scroll-animate delay-0">
                            <h2>What Students Say</h2>
                            <p>Real feedback from students living in our ecosystem.</p>
                        </div>
                        
                        <div className="landing-reviews-highlight scroll-animate delay-1" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
                            <div className="glass-card" style={{ padding: '2rem', flex: '1', minWidth: '300px', textAlign: 'center', border: '1px solid rgba(251, 191, 36, 0.4)', background: 'rgba(251, 191, 36, 0.05)' }}>
                                <div style={{ fontSize: '4rem', color: '#fbbf24', fontWeight: '900', lineHeight: '1' }}>{averageData.average}</div>
                                <div style={{ fontSize: '1.5rem', color: '#fbbf24', margin: '0.5rem 0' }}>{'★'.repeat(Math.round(averageData.average))}</div>
                                <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>Average Satisfaction</p>
                                <div style={{ marginTop: '1.5rem' }}>
                                    <Link to="/visitor" className="btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '1rem', textDecoration: 'none' }}>Read All Reviews</Link>
                                </div>
                            </div>
                            
                            <div className="glass-card" style={{ padding: '2.5rem', flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem' }}>Transparent & Verified</h3>
                                <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6', margin: 0 }}> Every review is from a registered student who has lived in the hostel. We believe in transparency to help new students make the best choice. </p>
                            </div>
                        </div>
                    </section>
                )}

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
