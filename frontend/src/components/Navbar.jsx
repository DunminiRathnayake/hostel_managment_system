import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // The Kiosk strictly locks down navigation headers organically natively mapping isolation
    if (location.pathname === '/scanner') {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className={`navbar-container ${location.pathname === '/' ? 'navbar-landing-dark' : ''}`}>
            <div className="navbar-logo">
                <Link to="/">
                    <span className="logo-icon">🏢</span> Staytra
                </Link>
            </div>
            <div className="navbar-links">
                <Link to="/" className={location.pathname === '/' ? 'nav-active' : ''}>Home</Link>
                {location.pathname === '/' && <a href="#features" className="nav-hash-link">Features</a>}
                <Link to="/gallery" className={location.pathname === '/gallery' ? 'nav-active' : ''}>Gallery</Link>
                <Link to="/visitor">Visitor Portal</Link>
                
                {user ? (
                    <div className="nav-auth-section">
                        <Link to="/home" className="nav-dashboard-btn">
                            My Dashboard <span className="role-badge">{user.role}</span>
                        </Link>
                        <Link to="/home" className="nav-profile-block" style={{ textDecoration: 'none' }} title="Go to Dashboard">
                            <div className="nav-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}</div>
                            <span className="nav-name">{user?.name ? user.name.split(' ')[0] : 'User'}</span>
                        </Link>
                        <button onClick={handleLogout} className="navbar-logout-btn" style={{ background: 'transparent', border: '2px solid #ef4444', color: '#ef4444', padding: '0.4rem 1.2rem', borderRadius: '999px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '1rem', transition: 'all 0.2s', fontSize: '0.9rem' }} onMouseEnter={e => {e.currentTarget.style.background='#ef4444'; e.currentTarget.style.color='white'}} onMouseLeave={e => {e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#ef4444'}}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="nav-guest-section">
                        <Link to="/register" className="global-btn" style={{background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color:'white', marginRight:'0.5rem', border:'none', padding:'0.5rem 1.5rem', fontWeight:'600', fontSize:'0.9rem', borderRadius:'999px'}}>Register</Link>
                        <Link to="/login" className="global-btn" style={{background:'transparent', border: location.pathname === '/' ? '1px solid rgba(96, 165, 250, 0.3)' : '2px solid #3b82f6', color: location.pathname==='/'?'#60a5fa':'#3b82f6', padding:'0.5rem 1.5rem', fontWeight:'600', fontSize:'0.9rem', borderRadius:'999px'}}>Login</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
