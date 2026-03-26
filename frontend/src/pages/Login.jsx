import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const { login, user, token } = useContext(AuthContext);
    const navigate = useNavigate();

    // Re-check auto-login mapping internally bouncing directly securely.
    useEffect(() => {
        if (user && token) {
            navigate('/home');
        }
    }, [user, token, navigate]);

    const redirectByRole = () => {
        navigate('/home');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        try {
            setIsLoading(true);
            const res = await axiosInstance.post('/auth/login', { email, password });
            
            const { token, user } = res.data;
            
            login(user, token);
            // Redirection logic is natively handled natively via Context state mutation triggering the `useEffect` above, but explicitly triggered here as fallback:
            redirectByRole();
            
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
            <div className="login-card">
                <h2>Hostel Management System</h2>
                <p>Please login to your account</p>
                
                {error && <div className="error-alert">{error}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
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
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="login-button">
                        {isLoading ? 'Please wait...' : 'Login'}
                    </button>
                    <div style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: '#64748b' }}>Don't have an account? </span>
                        <Link to="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' }}>Register here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
