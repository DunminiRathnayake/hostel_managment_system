/**
 * ============================================================
 *  TEST SUITE: Bookings  (/api/bookings)
 *  Tests: create booking, validation (past date, missing id),
 *         get my bookings, get all (warden), update status.
 * ============================================================
 */

const { BASE_URL, setupAuth, makeReporter, printSummary, disconnectDB } = require('./test_helpers');

async function runBookingTests() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  📅  BOOKINGS API TESTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const report = [];
    const { passed, failed } = makeReporter(report);
    const { studentToken, wardenToken, studentId } = await setupAuth('booking_' + Date.now());

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    // ── T1: Missing studentId for student_visit ───────────────
    try {
        const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorName: 'John', phone: '0712345678', NIC: '123456789V', type: 'student_visit', date: tomorrowStr, time: '10:00 AM' })
        });
        if (res.status === 400) passed('POST /bookings missing studentId → 400');
        else failed('POST /bookings missing studentId', `Got ${res.status}`);
    } catch(e) { failed('Missing studentId', e.message); }

    // ── T2: Invalid Phone format ──────────────────────────────
    try {
        const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorName: 'John', phone: '123', NIC: '123456789V', type: 'room_visit', date: tomorrowStr, time: '10:00 AM' })
        });
        if (res.status === 400) passed('POST /bookings invalid format → 400');
        else failed('POST /bookings invalid format', `Got ${res.status}`);
    } catch(e) { failed('Invalid format', e.message); }

    // ── T3: Past Date Reject ──────────────────────────────────
    try {
        const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorName: 'John', phone: '0712345678', NIC: '123456789V', type: 'room_visit', date: pastDateStr, time: '10:00 AM' })
        });
        if (res.status === 400) passed('POST /bookings past date → 400');
        else failed('POST /bookings past date', `Got ${res.status}`);
    } catch(e) { failed('Past Date', e.message); }

    // ── T4: Successful Booking ────────────────────────────────
    let bookingId;
    try {
        const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorName: 'John Doe', phone: '0712345678', NIC: '123456789V', type: 'student_visit', studentId, date: tomorrowStr, time: '02:00 PM' })
        });
        const data = await res.json();
        if (res.status === 201 && data.booking && data.booking.status === 'pending') {
            bookingId = data.booking._id;
            passed('POST /bookings valid → 201 Created');
        } else failed('POST /bookings valid', `Got ${res.status} ${JSON.stringify(data)}`);
    } catch(e) { failed('Valid booking', e.message); }

    // ── T5: Visitor GET exclusively own mapping ───────────────
    try {
        const res = await fetch(`${BASE_URL}/bookings/my?phone=0712345678&NIC=123456789V`);
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data) && data.length > 0) passed('GET /bookings/my (Visitor) → 200 array match');
        else failed('GET /bookings/my', `Got ${res.status}`);
    } catch(e) { failed('GET /bookings/my', e.message); }

    // ── T6: Warden GET all fully populated ────────────────────
    try {
        const res = await fetch(`${BASE_URL}/bookings`, { headers: { 'Authorization': `Bearer ${wardenToken}` }});
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data)) passed('GET /bookings (Warden) → 200');
        else failed('GET /bookings (Warden)', `Got ${res.status}`);
    } catch(e) { failed('GET /bookings (Warden)', e.message); }

    // ── T7: Warden PUT update logic ───────────────────────────
    if (bookingId) {
        try {
            const res = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
                method: 'PUT', headers: { 'Authorization': `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            const data = await res.json();
            if (res.status === 200 && data.booking.status === 'approved') passed('PUT /bookings/:id (Warden) → 200 approved');
            else failed('PUT /bookings/:id (Warden)', `Got ${res.status}`);
        } catch(e) { failed('PUT /bookings/:id', e.message); }
    }

    printSummary('Bookings', report);
    return report;
}

if (require.main === module) {
    runBookingTests().then(() => disconnectDB()).then(() => process.exit(0));
}

module.exports = runBookingTests;
