import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import './Login.css'; // Reusing Login styles for consistent aesthetic

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!name || !email || !password) {
            setError('Please fill out all fields.');
            return;
        }

        try {
            setIsLoading(true);
            const res = await axiosInstance.post('/auth/register', { name, email, password, role });
            
            setSuccess('Done! Account created. Redirecting to login...');
            
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
        <div className="login-container">
            <div className="login-card" style={{marginTop: '2rem', marginBottom: '2rem'}}>
                <h2>Create an Account</h2>
                <p>Register for the Hostel Management System</p>
                
                {error && <div className="error-alert">{error}</div>}
                {success && <div className="error-alert" style={{background: '#d1fae5', color: '#065f46', borderColor: '#34d399'}}>{success}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Email Address</label>
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
                        <label>Account Role</label>
                        <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid #334155',
                                background: 'transparent',
                                color: 'white',
                                outline: 'none',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="student" style={{color: 'black'}}>Student</option>
                            <option value="warden" style={{color: 'black'}}>Warden</option>
                            <option value="visitor" style={{color: 'black'}}>Visitor</option>
                        </select>
                    </div>

                    <button type="submit" disabled={isLoading} className="login-button" style={{marginTop: '0.5rem'}}>
                        {isLoading ? 'Please wait...' : 'Register Account'}
                    </button>
                    
                    <div style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: '#64748b' }}>Already have an account? </span>
                        <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' }}>Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
