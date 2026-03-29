const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Login = require("../models/Login");

const registerUser = async (req, res) => {
    try {
        let { name, email, password, role } = req.body;

        if (name) name = name.trim();
        if (email) email = email.trim().toLowerCase();

        // 1. Validate input
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // 2. Check duplicate email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // 3. Hash password (salt 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate secure QR Token
        const qrToken = crypto.randomBytes(32).toString('hex');

        // 4. Save user
        const user = await User.create({
            email,
            password: hashedPassword,
            role
        });

        const profile = await Profile.create({
            user: user._id,
            name,
            qrToken
        });

        // Return success message
        console.log(`✅ Success: User registered - ${user.email}`);
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: profile.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({ message: "Server error during registration" });
    }
};

const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (email) email = email.trim().toLowerCase();

        // 1. Validate email and password
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        // 2. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Compare password using bcrypt.compare
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 4. Generate JWT token (Payload: { id, role }, Expires in 1d)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Map abstract client IP dynamically avoiding native proxy blocks
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

        // Register visual login instance permanently targeting native log schemas
        await Login.create({
            user: user._id,
            ipAddress: clientIp,
            loginTime: new Date()
        });

        // Fetch parallel profile securely avoiding native mapping desync
        const profile = await Profile.findOne({ user: user._id });

        // 5. Return token + user details seamlessly mapped
        console.log(`✅ Success: User logged in - ${user.email}`);
        return res.status(200).json({
            token,
            user: {
                id: user._id,
                name: profile ? profile.name : "Admin User", 
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({ message: "Server error during login" });
    }
};

module.exports = {
    registerUser,
    loginUser
};