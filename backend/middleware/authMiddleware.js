const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
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
