const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    // Check if token exists in headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user to ensure account is not deactivated
            const User = require('../models/User');
            const Registration = require('../models/Registration');
            
            let user = await Registration.findById(decoded.id);
            if (!user) {
                user = await User.findById(decoded.id);
            }

            if (user && user.isActive === false) {
                return res.status(403).json({ message: 'Your account has been deactivated. Please contact the hostel office.' });
            }

            // Attach decoded user to req.user (payload has id and role)
            req.user = decoded;

            next();
        } catch (error) {
            console.error('Error in auth middleware:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token was provided, return 401
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to authorize by roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to access this route' });
        }
        next();
    };
};

module.exports = { protect, authorize };
