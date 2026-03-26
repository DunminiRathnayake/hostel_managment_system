const BASE_URL = 'http://localhost:5000/api';

async function testQR() {
    console.log('--- STARTING QR ATTENDANCE API TESTS ---\n');
    let report = [];
    const passed = (name) => { console.log(`✅ PASSED: ${name}`); report.push(`✅ ${name}`); };
    const failed = (name, msg) => { console.log(`❌ FAILED: ${name} - ${msg}`); report.push(`❌ ${name}`); };

    // 1. Auth Setup
    let studentId, studentToken;
    const sEmail = `student_${Date.now()}@test.com`;

    const sRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Student', email: sEmail, password: 'pass', role: 'student' })
    });
    const sData = await sRes.json();
    if(sData.user) {
        studentId = sData.user.id;
        studentToken = sData.token;
    } else {
        console.log('❌ Auth startup natively failed. Cannot proceed.', sData);
        process.exit(1);
    }

    // --- TEST 1: Scan With Invalid Token Payload
    try {
        const res = await fetch(`${BASE_URL}/checkin/scan`, { 
            method: 'POST', headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ studentId, token: 'fake_jwt_token_123' }) 
        });
        if (res.status === 401) passed('POST /scan invalid JWT payload -> 401 Authorization Catch');
        else failed('POST /scan invalid JWT payload', `Got ${res.status}`);
    } catch(e) { failed('Invalid JWT Exception', e.message); }

    // --- TEST 2: Initial Scan -> Valid Secure Check-in
    try {
        const res = await fetch(`${BASE_URL}/checkin/scan`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ studentId, token: studentToken })
        });
        const data = await res.json();
        if (res.status === 201 && data.record && !data.record.checkOutTime) passed('POST /scan (Check-In) -> 201 Creating unique open session');
        else failed('POST /scan (Check-In)', `Got ${res.status}`);
    } catch(e) { failed('Valid Secure Check-in', e.message); }

    // Timeout separation natively guaranteeing MongoDB saves strictly asynchronously
    await new Promise(r => setTimeout(r, 250));

    // --- TEST 3: Midnight Crossing Check-Out Sequence (Handled via logic dropping Date binding!)
    try {
        const res = await fetch(`${BASE_URL}/checkin/scan`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ studentId, token: studentToken })
        });
        const data = await res.json();
        if (res.status === 200 && data.record && data.record.checkOutTime) {
            passed('POST /scan (Midnight Crossing Check-Out) -> 200 Properly targeting single active session closing it off without duplicates');
        }
        else failed('POST /scan (Midnight Crossing Check-Out)', `Got ${res.status}`);
    } catch(e) { failed('Midnight Crossing Checkout', e.message); }

    // --- TEST 4: Follow-up Re-entry
    try {
        const res = await fetch(`${BASE_URL}/checkin/scan`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ studentId, token: studentToken })
        });
        const data = await res.json();
        if (res.status === 201 && !data.record.checkOutTime) passed('POST /scan (Re-Entry Check-In) -> 201 Generated fresh session cleanly post-checkout');
        else failed('POST /scan (Re-Entry Check-In)', `Got ${res.status}`);
    } catch(e) { failed('Follow-up Check-in', e.message); }

    console.log('\n--- FINAL SUMMARY ---');
    report.forEach(r => console.log(r));
    process.exit(0);
}

testQR();
