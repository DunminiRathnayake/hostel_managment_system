const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api/auth';
const randomSuffix = Math.floor(Math.random() * 100000);
const testUser = {
    name: 'Test Student',
    email: `teststudent${randomSuffix}@example.com`,
    password: 'password123',
    role: 'student'
};

async function testApi() {
    console.log('--- STARTING AUTH API TESTS ---\n');
    let report = [];
    let serverRunning = false;

    // 1. Check Server Ping
    try {
        await fetch(BASE_URL.replace('/api/auth', ''));
        serverRunning = true;
    } catch (e) {
        console.log('⚠️ Warning: Server might not be running or unresponsive at http://localhost:5000.');
    }

    const passed = (name) => { console.log(`✅ PASSED: ${name}`); report.push(`✅ ${name}`); };
    const failed = (name, msg) => { console.log(`❌ FAILED: ${name} - ${msg}`); report.push(`❌ ${name}`); };

    // Test A: Missing fields registration
    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@test.com' })
        });
        if (res.status === 400) passed('Register missing fields returns 400');
        else failed('Register missing fields', `Got status ${res.status}`);
    } catch(e) {
        failed('Register missing fields', 'Fetch connection error - Is Server/MongoDB running?');
        return finalize(report); // Stop if server completely down
    }

    // Test B: Successful registration
    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser) 
        });
        const data = await res.json();
        if (res.status === 201 && data.user && data.user.email === testUser.email) {
            passed('Register new user returns 201 and user object');
        } else {
            failed('Register new user', `Got status ${res.status}, body: ${JSON.stringify(data)}`);
        }
    } catch(e) {
        failed('Register new user', e.message);
    }

    // Test C: Duplicate registration
    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser) 
        });
        if (res.status === 400) passed('Register duplicate email returns 400');
        else failed('Register duplicate email', `Got status ${res.status}`);
    } catch(e) {
        failed('Register duplicate email', e.message);
    }

    // Test D: Successful login
    let token = null;
    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email, password: testUser.password })
        });
        const data = await res.json();
        if (res.status === 200 && data.token && data.user) {
            token = data.token;
            passed('Login valid credentials returns 200, JWT token, and user info');
        } else {
            failed('Login valid credentials', `Got status ${res.status}, body: ${JSON.stringify(data)}`);
        }
    } catch(e) {
        failed('Login valid credentials', e.message);
    }

    // Test E: Login wrong password
    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email, password: 'wrongpassword' })
        });
        if (res.status === 401 || res.status === 400) passed(`Login wrong password returns ${res.status}`);
        else failed('Login wrong password', `Got status ${res.status}`);
    } catch(e) {
        failed('Login wrong password', e.message);
    }

    // Test F: Login non-existing email
    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'doesntexist@example.com', password: 'password123' })
        });
        if (res.status === 401 || res.status === 400) passed(`Login non-existing email returns ${res.status}`);
        else failed('Login non-existing email', `Got status ${res.status}`);
    } catch(e) {
        failed('Login non-existing email', e.message);
    }

    // JWT Verification
    if (token) {
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedJson = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
            if (decodedJson.id && decodedJson.role === testUser.role && decodedJson.exp) {
                passed('JWT contains proper payload (id, role, exp)');
            } else {
                failed('JWT payload proper structure', `Payload: ${JSON.stringify(decodedJson)}`);
            }
        } catch(e) {
            failed('JWT token validation', e.message);
        }
    } else {
        failed('JWT token validation', 'No token received to validate');
    }

    // Database Hash Check
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostel-management';
        await mongoose.connect(mongoUri);
        
        let schemaSchemaOptions;
        try { schemaSchemaOptions = require('./models/User'); } catch(e) { }

        // Fetch user natively without full model if we need
        const db = mongoose.connection.db;
        const usersCol = db.collection('users');
        const dbUser = await usersCol.findOne({ email: testUser.email });

        if (dbUser) {
            if (dbUser.password !== 'password123' && dbUser.password.startsWith('$2b$')) {
                passed('Password is stored securely hashed in MongoDB');
            } else {
                failed('Password Hash Check', 'Password stored as plain text or invalid hash: ' + dbUser.password);
            }
        } else {
            failed('Password Hash Check', 'User not found directly in MongoDB manually');
        }
        await mongoose.disconnect();
    } catch (e) {
        failed('Password Hash Check', 'MongoDB error during DB scan: ' + e.message);
    }

    finalize(report);
}

function finalize(report) {
    console.log('\n--- FINAL TEST SUMMARY ---');
    report.forEach(r => console.log(r));
    process.exit(0);
}

testApi();
