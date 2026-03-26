import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, token, loading, logout } = useContext(AuthContext);

    // Initial mount hook giving Context time to grab LocalStorage dynamically
    if (loading) {
        return <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Validating secure session...</div>;
    }

    // Edge Case: Broken/de-synchronized context (token retained but payload lost)
    if (token && !user) {
        console.warn('CRITICAL: Desynchronized authentication logic. Forcing logout sweep.');
        logout();
        return <Navigate to="/" replace />;
    }

    // Hard Boundary: Completely unauthorized
    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    // RBAC (Role-Based Access Control)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.warn(`Unauthorized RBAC constraint: User role '${user.role}' rejecting route mapping.`);
        
        // Push rogue routing back to their specific Native Dashboard automatically safely
        if (user.role === 'warden') return <Navigate to="/warden" replace />;
        if (user.role === 'student') return <Navigate to="/student" replace />;
        if (user.role === 'visitor') return <Navigate to="/visitor" replace />;
        
        return <Navigate to="/" replace />;
    }

    // Passed completely safely -> Render target component natively
    return children;
};

export default ProtectedRoute;
