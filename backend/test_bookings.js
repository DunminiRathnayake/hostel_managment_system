const BASE_URL = 'http://localhost:5000/api';

async function testBookings() {
    console.log('--- STARTING BOOKING API TESTS ---\n');
    let report = [];
    const passed = (name) => { console.log(`✅ PASSED: ${name}`); report.push(`✅ ${name}`); };
    const failed = (name, msg) => { console.log(`❌ FAILED: ${name} - ${msg}`); report.push(`❌ ${name}`); };

    // 1. Setup Auth
    let studentId, studentToken, wardenToken;
    const sEmail = `student_${Date.now()}@test.com`;
    const wEmail = `warden_${Date.now()}@test.com`;

    // Register dummy constraints
    await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Student', email: sEmail, password: 'pass', role: 'student' })
    });
    const sRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sEmail, password: 'pass' })
    });
    const sData = await sRes.json();
    if(sData.user) {
        studentToken = sData.token;
        studentId = sData.user.id;
    }

    await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Warden', email: wEmail, password: 'pass', role: 'warden' })
    });
    const wRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: wEmail, password: 'pass' })
    });
    wardenToken = (await wRes.json()).token;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    // --- TEST 1: Missing studentId for student_visit
    try {
        const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorName: 'John', phone: '0712345678', NIC: '123456789V', type: 'student_visit', date: tomorrowStr, time: '10:00 AM' })
        });
        if (res.status === 400) passed('POST /bookings missing studentId -> 400');
        else failed('POST /bookings missing studentId', `Got ${res.status}`);
    } catch(e) { failed('Missing studentId', e.message); }

    // --- TEST 2: Invalid Phone/NIC Focus
    try {
        const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorName: 'John', phone: '123', NIC: '123', type: 'room_visit', date: tomorrowStr, time: '10:00 AM' })
        });
        if (res.status === 400) passed('POST /bookings invalid format -> 400');
        else failed('POST /bookings invalid format', `Got ${res.status}`);
    } catch(e) { failed('Invalid format', e.message); }

    // --- TEST 3: Past Date Reject
    try {
        const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorName: 'John', phone: '0712345678', NIC: '123456789V', type: 'room_visit', date: pastDateStr, time: '10:00 AM' })
        });
        if (res.status === 400) passed('POST /bookings past date -> 400');
        else failed('POST /bookings past date', `Got ${res.status}`);
    } catch(e) { failed('Past Date', e.message); }

    // --- TEST 4: Successful Booking
    let bookingId;
    try {
        const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorName: 'John Doe', phone: '0712345678', NIC: '123456789V', type: 'student_visit', studentId, date: tomorrowStr, time: '02:00 PM' })
        });
        const data = await res.json();
        if (res.status === 201 && data.booking && data.booking.status === 'pending') {
            bookingId = data.booking._id;
            passed('POST /bookings valid -> 201 Created & status pending');
        } else failed('POST /bookings valid', `Got ${res.status} ${JSON.stringify(data)}`);
    } catch(e) { failed('Valid booking', e.message); }

    // --- TEST 5: Visitor GET exclusively own mapping
    try {
        const res = await fetch(`${BASE_URL}/bookings/my?phone=0712345678&NIC=123456789V`);
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data) && data.length > 0) passed('GET /bookings/my (Visitor) -> 200 OK array mapping match');
        else failed('GET /bookings/my', `Got ${res.status}`);
    } catch(e) { failed('GET /bookings/my', e.message); }

    // --- TEST 6: Warden GET all fully populated
    try {
        const res = await fetch(`${BASE_URL}/bookings`, { headers: { 'Authorization': `Bearer ${wardenToken}` }});
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data) && data[0] && data[0].studentId.email) passed('GET /bookings (Warden) -> 200 successfully populated student Object');
        else failed('GET /bookings (Warden)', `Got ${res.status} | Data: ${JSON.stringify(data)}`);
    } catch(e) { failed('GET /bookings (Warden)', e.message); }

    // --- TEST 7: Warden PUT update logic
    if (bookingId) {
        try {
            const res = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
                method: 'PUT', headers: { 'Authorization': `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            const data = await res.json();
            if (res.status === 200 && data.booking.status === 'approved') passed('PUT /bookings/:id (Warden) -> 200 status globally Approved');
            else failed('PUT /bookings/:id (Warden)', `Got ${res.status}`);
        } catch(e) { failed('PUT /bookings/:id', e.message); }
    }

    console.log('\n--- FINAL SUMMARY ---');
    report.forEach(r => console.log(r));
    process.exit(0);
}

testBookings();
