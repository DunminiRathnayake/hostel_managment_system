/**
 * ============================================================
 *  HOSTEL MANAGEMENT SYSTEM — TEST HELPERS
 *  Shared auth setup and utilities for all test suites.
 * ============================================================
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Reliable DNS for Atlas SRV

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const crypto   = require('crypto');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const User         = require('../models/User');
const Registration = require('../models/Registration');

const BASE_URL = 'http://localhost:5000/api';

// ── Helpers ──────────────────────────────────────────────────

/** Connect to MongoDB (uses .env MONGO_URI) */
async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
}

/** Disconnect from MongoDB */
async function disconnectDB() {
    await mongoose.disconnect();
}

/**
 * Create a test student directly in DB (bypasses multipart registration).
 * Returns { email, password, id, qrToken }.
 */
async function createTestStudent(suffix = Date.now()) {
    await connectDB();
    const email    = `test_student_${suffix}@hosteltest.com`;
    const password = 'Student@123';
    const hash     = await bcrypt.hash(password, 10);
    const qrToken  = crypto.randomBytes(32).toString('hex');

    const reg = await Registration.create({
        fullName: `Test Student ${suffix}`,
        email,
        password: hash,
        role: 'student',
        campus: 'Main Campus',
        studentPhone: '0712345678',
        emergencyContactName: 'Test Parent',
        emergencyPhone: '0712345679',
        nicFrontImage: '/uploads/nic/placeholder.jpg',
        nicBackImage:  '/uploads/nic/placeholder.jpg',
        qrToken,
        status: 'approved',
        isActive: true
    });

    // Shadow entry in users collection for login tracking
    const existing = await User.findOne({ email });
    if (!existing) {
        await User.create({ email, password: hash, role: 'student', isActive: true });
    }

    return { email, password, id: reg._id.toString(), qrToken };
}

/**
 * Ensure the persistent warden account exists.
 * Returns { email, password }.
 */
async function ensureWarden() {
    await connectDB();
    const email    = 'warden@hostel.com';
    const password = 'Warden@123';
    const existing = await User.findOne({ email });
    if (!existing) {
        const hash = await bcrypt.hash(password, 10);
        await User.create({ email, password: hash, role: 'warden', isActive: true });
        console.log('  ℹ️  Warden account created.');
    }
    return { email, password };
}

/** POST /api/auth/login → returns token string or null */
async function loginUser(email, password) {
    const res  = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    return data.token || null;
}

/**
 * Set up both a fresh student and the warden.
 * Returns { studentToken, wardenToken, studentId, studentEmail, wardenEmail }
 */
async function setupAuth(suffix = Date.now()) {
    const student = await createTestStudent(suffix);
    const warden  = await ensureWarden();

    const [studentToken, wardenToken] = await Promise.all([
        loginUser(student.email, student.password),
        loginUser(warden.email, warden.password)
    ]);

    return {
        studentToken,
        wardenToken,
        studentId:    student.id,
        studentEmail: student.email,
        wardenEmail:  warden.email,
        qrToken:      student.qrToken
    };
}

/** Standard PASSED / FAILED reporters */
function makeReporter(report) {
    const passed = (name) => {
        console.log(`  ✅ PASS: ${name}`);
        report.push({ status: 'PASS', name });
    };
    const failed = (name, msg) => {
        console.log(`  ❌ FAIL: ${name}`);
        console.log(`        → ${msg}`);
        report.push({ status: 'FAIL', name, msg });
    };
    return { passed, failed };
}

/** Print and return a summary line */
function printSummary(suiteName, report) {
    const total  = report.length;
    const passes = report.filter(r => r.status === 'PASS').length;
    const fails  = total - passes;
    console.log(`\n  ── ${suiteName} Summary: ${passes}/${total} passed` + (fails ? ` | ${fails} FAILED` : ' ✔') + ' ──\n');
    return { total, passes, fails };
}

module.exports = {
    BASE_URL,
    connectDB,
    disconnectDB,
    createTestStudent,
    ensureWarden,
    loginUser,
    setupAuth,
    makeReporter,
    printSummary
};
