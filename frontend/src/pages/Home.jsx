import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Secondary fallback safely mapping edge-case UI traces natively if manually resolving bounds locally
    if (!user) {
        navigate('/login');
        return null; // Prevents render ghosting structurally
    }

    const handleDashboardRoute = () => {
        if (user.role === 'warden') navigate('/warden');
        else if (user.role === 'student') navigate('/student');
        else if (user.role === 'visitor') navigate('/visitor');
    };

    return (
        <div className="home-container fade-in-up">
            <div className="global-card home-hub-card">
                <div className="home-avatar">
                    {user?.name ? user.name.charAt(0) : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
                </div>
                
                <h1 className="home-greeting">Welcome, {user?.name ? user.name.split(' ')[0] : 'User'}!</h1>
                <p className="home-role">
                    Your Role: <span className="home-badge">{user.role}</span>
                </p>
                
                <div className="home-actions">
                    <p style={{color:'#64748b', fontSize:'0.95rem', marginBottom:'1.5rem'}}>
                        Access your dashboard to manage your account and view updates.
                    </p>
                    <button onClick={handleDashboardRoute} className="global-btn home-btn">
                        Go to Dashboard
                    </button>
                    <button onClick={() => navigate('/gallery')} className="global-btn global-btn-outline home-btn" style={{marginTop: '1rem', background: 'transparent'}}>
                        View Gallery
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
