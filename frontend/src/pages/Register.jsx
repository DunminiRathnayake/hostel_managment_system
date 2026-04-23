import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import './Login.css'; // Reusing Login styles for consistent aesthetic

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [campus, setCampus] = useState('');
    const [studentPhone, setStudentPhone] = useState('');
    const [emergencyContactName, setEmergencyContactName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    const [nicFront, setNicFront] = useState(null);
    const [nicBack, setNicBack] = useState(null);
    
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Use refs to reset file inputs if needed
    const fileInputFront = useRef(null);
    const fileInputBack = useRef(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Required check
        if (!fullName || !email || !password || !campus || !studentPhone || !emergencyContactName || !emergencyPhone) {
            return setError('Please fill out all text fields.');
        }

        if (!nicFront || !nicBack) {
            return setError('Please upload both the front and back images of your NIC.');
        }

        // Validate lengths
        if (fullName.length < 3 || fullName.length > 50) {
            return setError('Name must be between 3 and 50 characters.');
        }
        if (!/^[a-zA-Z\s.-]+$/.test(fullName)) {
            return setError('Name can only contain alphabet characters, dots, or spaces.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return setError('Please provide a valid email structure.');
        }

        if (password.length < 6) {
            return setError('Password must be strictly at least 6 characters secure.');
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(studentPhone) || !phoneRegex.test(emergencyPhone)) {
             return setError('Please provide valid phone numbers (Must be exactly 10 digits).');
        }

        try {
            setIsLoading(true);

            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('campus', campus);
            formData.append('studentPhone', studentPhone);
            formData.append('emergencyContactName', emergencyContactName);
            formData.append('emergencyPhone', emergencyPhone);
            formData.append('nicFront', nicFront);
            formData.append('nicBack', nicBack);

            const res = await axiosInstance.post('/auth/register', formData);
            
            // On success, store token and redirect to dashboard (to match login flow)
            setSuccess('Done! Account created successfully.');
            
            setTimeout(() => {
                navigate('/login');
            }, 1500);
            
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Something went wrong. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container" style={{ padding: '2rem 0' }}>
            <div className="login-card" style={{ marginTop: '2rem', marginBottom: '2rem', maxWidth: '600px' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}>
                        <span style={{ fontSize: '2rem', lineHeight: 1 }}>🎓</span>
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>Student Registration</h2>
                    <p>Secure your spot in the interactive hostel ecosystem</p>
                </div>
                
                {error && <div className="error-alert">{error}</div>}
                {success && <div className="error-alert" style={{background: '#d1fae5', color: '#065f46', borderColor: '#34d399'}}>{success}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Campus</label>
                            <input 
                                type="text" 
                                value={campus}
                                onChange={(e) => setCampus(e.target.value)}
                                placeholder="E.g., North Campus"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Student Phone Number</label>
                            <input 
                                type="tel" 
                                value={studentPhone}
                                onChange={(e) => setStudentPhone(e.target.value)}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>
                    </div>

                    <h3 style={{ marginTop: '2rem', marginBottom: '1.2rem', color: '#e2e8f0', fontSize: '1.1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.4rem', borderRadius: '8px', fontSize: '1.1rem', display: 'flex' }}>🚑</span> 
                        Emergency Contact
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Emergency Contact Name</label>
                            <input 
                                type="text" 
                                value={emergencyContactName}
                                onChange={(e) => setEmergencyContactName(e.target.value)}
                                placeholder="Parent/Guardian name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Emergency Phone</label>
                            <input 
                                type="tel" 
                                value={emergencyPhone}
                                onChange={(e) => setEmergencyPhone(e.target.value)}
                                placeholder="Emergency number"
                                required
                            />
                        </div>
                    </div>

                    <h3 style={{ marginTop: '2rem', marginBottom: '1.2rem', color: '#e2e8f0', fontSize: '1.1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.4rem', borderRadius: '8px', fontSize: '1.1rem', display: 'flex' }}>🪪</span> 
                        Identification Proof
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>NIC Front Image</label>
                            <div className="file-upload-wrapper" style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.4)', border: '1px dashed rgba(255, 255, 255, 0.2)', padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s' }}>
                                <input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/jpg"
                                    ref={fileInputFront}
                                    onChange={(e) => setNicFront(e.target.files[0])}
                                    required
                                    style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }}
                                />
                                <span style={{ marginRight: '10px', fontSize: '1.2rem', color: '#94a3b8' }}>🖼️</span>
                                <span style={{ color: nicFront ? '#60a5fa' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem', fontWeight: nicFront ? '600' : 'normal' }}>
                                    {nicFront ? nicFront.name : 'Upload front side...'}
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>NIC Back Image</label>
                            <div className="file-upload-wrapper" style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.4)', border: '1px dashed rgba(255, 255, 255, 0.2)', padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s' }}>
                                <input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/jpg"
                                    ref={fileInputBack}
                                    onChange={(e) => setNicBack(e.target.files[0])}
                                    required
                                    style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }}
                                />
                                <span style={{ marginRight: '10px', fontSize: '1.2rem', color: '#94a3b8' }}>🖼️</span>
                                <span style={{ color: nicBack ? '#60a5fa' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem', fontWeight: nicBack ? '600' : 'normal' }}>
                                    {nicBack ? nicBack.name : 'Upload back side...'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="login-button" style={{marginTop: '1.5rem'}}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                    
                    <div style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: '#64748b' }}>Already have an account? </span>
                        <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
                    </div>
                </form>
            </div>
            <style>{`
                .file-upload-wrapper:hover {
                    border-color: #60a5fa !important;
                    background: rgba(96, 165, 250, 0.05) !important;
                }
                .form-group input::placeholder {
                    color: rgba(148, 163, 184, 0.4);
                }
            `}</style>
        </div>
    );
};

export default Register;
