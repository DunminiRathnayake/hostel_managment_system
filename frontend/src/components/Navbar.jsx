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
        <nav className="navbar-container">
            <div className="navbar-logo">
                <Link to="/">
                    <span className="logo-icon">🏢</span> HostelHub
                </Link>
            </div>
            
            <div className="navbar-links">
                <Link to="/" className={location.pathname === '/' ? 'nav-active' : ''}>Home</Link>
                <Link to="/gallery" className={location.pathname === '/gallery' ? 'nav-active' : ''}>Gallery</Link>
                <Link to="/visitor">Visitor Portal</Link>
                
                {user ? (
                    <div className="nav-auth-section">
                        <Link to="/home" className="nav-dashboard-btn">
                            My Dashboard <span className="role-badge">{user.role}</span>
                        </Link>
                        <div className="nav-profile-block">
                            <div className="nav-avatar">{user.name.charAt(0)}</div>
                            <span className="nav-name">{user.name.split(' ')[0]}</span>
                        </div>
                        <button onClick={handleLogout} className="global-btn global-btn-outline nav-logout">Exit</button>
                    </div>
                ) : (
                    <div className="nav-guest-section">
                        <Link to="/login" className="global-btn">Login</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
