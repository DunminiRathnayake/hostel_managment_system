const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Registration = require("../models/Registration");
const Login = require("../models/Login");

const registerUser = async (req, res) => {
    try {
        let { fullName, email, password, campus, studentPhone, emergencyContactName, emergencyPhone } = req.body;

        if (fullName) fullName = fullName.trim();
        if (email) email = email.trim().toLowerCase();

        // 1. Validate input
        if (!fullName || !email || !password || !campus || !studentPhone || !emergencyContactName || !emergencyPhone) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(studentPhone) || !phoneRegex.test(emergencyPhone)) {
             return res.status(400).json({ message: "Please provide valid phone numbers (Must be exactly 10 digits)" });
        }

        if (!req.files || !req.files.nicFront || !req.files.nicBack) {
            return res.status(400).json({ message: "Please upload both NIC Front and Back images" });
        }

        // 2. Check duplicate email in Registration and User
        const userExists = await User.findOne({ email });
        const regExists = await Registration.findOne({ email });
        if (userExists || regExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // 3. Hash password (salt 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate secure QR Token
        const qrToken = crypto.randomBytes(32).toString('hex');

        // Extract File Paths
        const nicFrontImage = `/uploads/nic/${req.files.nicFront[0].filename}`;
        const nicBackImage = `/uploads/nic/${req.files.nicBack[0].filename}`;

        // 4. Save to Registration collection
        const registration = await Registration.create({
            fullName,
            email,
            password: hashedPassword,
            role: 'student',
            campus,
            studentPhone,
            emergencyContactName,
            emergencyPhone,
            nicFrontImage,
            nicBackImage,
            qrToken,
            status: 'approved' // Automatically approved as requested earlier
        });

        // Return success message
        console.log(`✅ Success: User registered in Registrations - ${registration.email}`);
        return res.status(201).json({
            message: "User registered successfully",
            token: jwt.sign(
                { id: registration._id, role: registration.role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            ),
            user: {
                id: registration._id,
                name: registration.fullName,
                email: registration.email,
                role: registration.role
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

        // 2. Check if user exists in Registration or User collection
        let user = await Registration.findOne({ email });
        let profileName = null;
        
        if (user) {
            profileName = user.fullName;
        } else {
            user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "Invalid email or password" });
            }
        }

        // 3. Compare password using bcrypt.compare
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (user.isActive === false) {
            return res.status(403).json({ message: "Your account has been deactivated. Please contact the hostel office." });
        }

        // 4. Generate JWT token (Payload: { id, role }, Expires in 1d)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Map abstract client IP dynamically avoiding native proxy blocks
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

        // Fetch parallel profile securely avoiding native mapping desync (only for legacy users)
        if (!profileName && user.role === 'student') {
            const profile = await Profile.findOne({ user: user._id });
            if (profile) profileName = profile.fullName || profile.name;
        }

        const finalName = profileName ? profileName : "Admin User";

        // Register visual login instance permanently targeting native log schemas
        await Login.create({
            user: user._id,
            name: finalName,
            email: user.email,
            ipAddress: clientIp,
            loginTime: new Date()
        });

        // 5. Return token + user details seamlessly mapped
        console.log(`✅ Success: User logged in - ${user.email}`);
        return res.status(200).json({
            token,
            user: {
                id: user._id,
                name: finalName, 
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