/**
 * ============================================================
 *  TEST SUITE: QR Attendance  (/api/checkin)
 *  Tests: Invalid token payload, Initial check-in, 
 *         Midnight crossing check-out, Re-entry.
 * ============================================================
 */

const { BASE_URL, setupAuth, makeReporter, printSummary, disconnectDB } = require('./test_helpers');

async function runQRTests() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  📱  QR ATTENDANCE API TESTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const report = [];
    const { passed, failed } = makeReporter(report);
    const { studentToken, studentId, qrToken } = await setupAuth('qr_' + Date.now());

    // ── T1: Scan With Invalid Token Payload ───────────────────
    try {
        const res = await fetch(`${BASE_URL}/checkin/scan`, { 
            method: 'POST', headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ studentId, token: 'fake_jwt_token_123' }) 
        });
        if (res.status === 401) passed('POST /scan invalid JWT payload → 401');
        else failed('POST /scan invalid JWT payload', `Got ${res.status}`);
    } catch(e) { failed('Invalid JWT Exception', e.message); }

    // First generate a valid JWT with the qrToken inside
    const jwt = require('jsonwebtoken');
    const validQRTokenJwt = jwt.sign({ qrToken }, process.env.JWT_SECRET, { expiresIn: '60s' });

    // ── T2: Initial Scan -> Valid Secure Check-in ─────────────
    try {
        const res = await fetch(`${BASE_URL}/checkin/scan`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ studentId, token: validQRTokenJwt })
        });
        const data = await res.json();
        if (res.status === 201 && data.record && !data.record.checkOutTime) {
            passed('POST /scan (Check-In) → 201 Created');
        } else {
            failed('POST /scan (Check-In)', `Got ${res.status}`);
        }
    } catch(e) { failed('Valid Secure Check-in', e.message); }

    // Timeout separation natively guaranteeing MongoDB saves strictly asynchronously
    await new Promise(r => setTimeout(r, 250));

    // ── T3: Cooldown Protection (Rapid Second Scan) ─────────────
    try {
        const res = await fetch(`${BASE_URL}/checkin/scan`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ studentId, token: validQRTokenJwt })
        });
        const data = await res.json();
        // Since we just checked in, scanning again immediately should trigger the 60s cooldown
        if (res.status === 400 && data.message.includes('wait before scanning')) {
            passed('POST /scan (Rapid Second Scan) → 400 Cooldown Triggered');
        } else {
            failed('POST /scan (Cooldown Check)', `Got ${res.status} | ${data.message}`);
        }
    } catch(e) { failed('Cooldown Check', e.message); }

    // ── T4: Delete checkin from DB to simulate time passing and test Check-Out ───
    try {
        // Manually remove the active checkin to bypass the 60-second cooldown for the next test
        const mongoose = require('mongoose');
        const db = mongoose.connection.db;
        const objectId = new mongoose.Types.ObjectId(studentId);
        await db.collection('checkins').deleteMany({ studentId: objectId });

        // Now do a fresh scan (simulating checkin again)
        await fetch(`${BASE_URL}/checkin/scan`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ studentId, token: validQRTokenJwt })
        });
        
        // Push the check-in time back by 2 minutes directly in the DB
        await db.collection('checkins').updateOne(
            { studentId: objectId }, 
            { $set: { checkInTime: new Date(Date.now() - 120000) } }
        );

        // Scan AGAIN to trigger a successful Check-Out
        const res = await fetch(`${BASE_URL}/checkin/scan`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ studentId, token: validQRTokenJwt })
        });
        const data = await res.json();
        
        if (res.status === 200 && data.record && data.record.checkOutTime) {
            passed('POST /scan (Delayed Second Scan) → 200 Successful Check-Out');
        } else {
            failed('POST /scan (Check-Out)', `Got ${res.status}`);
        }
    } catch(e) { failed('Delayed Check-out Check', e.message); }

    printSummary('QR Attendance', report);
    return report;
}

if (require.main === module) {
    runQRTests().then(() => disconnectDB()).then(() => process.exit(0));
}

module.exports = runQRTests;
