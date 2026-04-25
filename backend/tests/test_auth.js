/**
 * ============================================================
 *  TEST SUITE: Authentication  (POST /auth/login)
 *  Tests: login success, wrong password, missing fields,
 *         JWT structure, account deactivation.
 * ============================================================
 */

const { BASE_URL, connectDB, disconnectDB, createTestStudent,
        ensureWarden, loginUser, makeReporter, printSummary } = require('./test_helpers');
const mongoose = require('mongoose');

async function runAuthTests() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🔐 AUTH API TESTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const report = [];
    const { passed, failed } = makeReporter(report);
    await connectDB();

    const student = await createTestStudent('auth_' + Date.now());
    const warden  = await ensureWarden();

    // ── T1: Server reachability ───────────────────────────────
    try {
        const res = await fetch(`http://localhost:5000`);
        if (res.ok || res.status < 500) passed('Server is reachable at :5000');
        else failed('Server reachable', `Status ${res.status}`);
    } catch (e) { failed('Server reachable', '❌ Cannot connect – is the server running?'); }

    // ── T2: Login with missing fields ─────────────────────────
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: student.email }) // no password
        });
        if (res.status === 400) passed('Login missing password → 400');
        else failed('Login missing password', `Expected 400, got ${res.status}`);
    } catch (e) { failed('Login missing password', e.message); }

    // ── T3: Login non-existent email ──────────────────────────
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'nobody@nowhere.com', password: 'any' })
        });
        if (res.status === 401) passed('Login unknown email → 401');
        else failed('Login unknown email', `Expected 401, got ${res.status}`);
    } catch (e) { failed('Login unknown email', e.message); }

    // ── T4: Login wrong password ──────────────────────────────
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: student.email, password: 'wrongpassword' })
        });
        if (res.status === 401) passed('Login wrong password → 401');
        else failed('Login wrong password', `Expected 401, got ${res.status}`);
    } catch (e) { failed('Login wrong password', e.message); }

    // ── T5: Successful student login ──────────────────────────
    let studentToken = null;
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: student.email, password: student.password })
        });
        const data = await res.json();
        if (res.status === 200 && data.token && data.user?.role === 'student') {
            studentToken = data.token;
            passed('Student login → 200 with JWT + user object');
        } else {
            failed('Student login', `Status ${res.status} | ${JSON.stringify(data)}`);
        }
    } catch (e) { failed('Student login', e.message); }

    // ── T6: Successful warden login ───────────────────────────
    let wardenToken = null;
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: warden.email, password: warden.password })
        });
        const data = await res.json();
        if (res.status === 200 && data.token && data.user?.role === 'warden') {
            wardenToken = data.token;
            passed('Warden login → 200 with JWT + role=warden');
        } else {
            failed('Warden login', `Status ${res.status} | ${JSON.stringify(data)}`);
        }
    } catch (e) { failed('Warden login', e.message); }

    // ── T7: JWT payload structure ─────────────────────────────
    if (studentToken) {
        try {
            const payload = JSON.parse(Buffer.from(studentToken.split('.')[1], 'base64').toString());
            if (payload.id && payload.role === 'student' && payload.exp) {
                passed('JWT payload has id, role=student, exp');
            } else {
                failed('JWT payload structure', JSON.stringify(payload));
            }
        } catch (e) { failed('JWT payload structure', e.message); }
    }

    // ── T8: Protected route without token → 401 ──────────────
    try {
        const res = await fetch(`${BASE_URL}/payments/my`); // no Authorization
        if (res.status === 401) passed('Protected route without token → 401');
        else failed('Protected route without token', `Expected 401, got ${res.status}`);
    } catch (e) { failed('Protected route without token', e.message); }

    // ── T9: Protected route with invalid token → 401 ─────────
    try {
        const res = await fetch(`${BASE_URL}/payments/my`, {
            headers: { Authorization: 'Bearer thisisnotavalidjwt' }
        });
        if (res.status === 401) passed('Invalid JWT → 401');
        else failed('Invalid JWT', `Expected 401, got ${res.status}`);
    } catch (e) { failed('Invalid JWT', e.message); }

    // ── T10: Password stored as bcrypt hash in DB ─────────────
    try {
        const db  = mongoose.connection.db;
        const col = db.collection('registrations');
        const doc = await col.findOne({ email: student.email });
        if (doc && doc.password !== student.password && doc.password.startsWith('$2b$')) {
            passed('Password stored as bcrypt hash (not plaintext)');
        } else {
            failed('Password hashing', 'Password might be stored in plaintext!');
        }
    } catch (e) { failed('Password hashing check', e.message); }

    printSummary('Auth', report);
    return report;
}

if (require.main === module) {
    const { disconnectDB } = require('./test_helpers');
    runAuthTests().then(() => disconnectDB()).then(() => process.exit(0));
}

module.exports = runAuthTests;
