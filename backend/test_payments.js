const BASE_URL = 'http://localhost:5000/api';

async function testPayments() {
    console.log('--- STARTING PAYMENT API TESTS ---\n');
    let report = [];
    const passed = (name) => { console.log(`✅ PASSED: ${name}`); report.push(`✅ ${name}`); };
    const failed = (name, msg) => { console.log(`❌ FAILED: ${name} - ${msg}`); report.push(`❌ ${name}`); };

    // 1. Setup Auth
    let studentToken, wardenToken;
    const sEmail = `student_${Date.now()}@test.com`;
    const wEmail = `warden_${Date.now()}@test.com`;

    // Register Student
    await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Student', email: sEmail, password: 'pass', role: 'student' })
    });
    const sRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sEmail, password: 'pass' })
    });
    studentToken = (await sRes.json()).token;

    // Register Warden
    await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Warden', email: wEmail, password: 'pass', role: 'warden' })
    });
    const wRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: wEmail, password: 'pass' })
    });
    wardenToken = (await wRes.json()).token;

    if (!studentToken || !wardenToken) {
        console.log('❌ Failed to initialize auth tokens!');
        return;
    }

    // --- TEST 1: Missing Fields (Student)
    try {
        const formData = new FormData();
        formData.append('amount', '500'); // missing category and paymentType
        const res = await fetch(`${BASE_URL}/payments`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${studentToken}` }, body: formData
        });
        if (res.status === 400) passed('POST /payments missing fields -> 400');
        else failed('POST /payments missing fields', `Got ${res.status}`);
    } catch (e) { failed('POST /payments missing fields', e.message); }

    // --- TEST 2: category="other" no description
    try {
        const formData = new FormData();
        formData.append('amount', '500');
        formData.append('category', 'other');
        formData.append('paymentType', 'bank');
        const blob = new Blob(['dummy'], { type: 'image/jpeg' });
        formData.append('slipImage', blob, 'test.jpg');
        
        const res = await fetch(`${BASE_URL}/payments`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${studentToken}` }, body: formData
        });
        if (res.status === 400) passed('POST /payments category "other" no description -> 400');
        else failed('POST /payments category "other" no description', `Got ${res.status}`);
    } catch (e) { failed('POST /payments category "other"', e.message); }

    // --- TEST 3: Invalid file type
    try {
        const formData = new FormData();
        formData.append('amount', '500');
        formData.append('category', 'monthly');
        formData.append('paymentType', 'online');
        const blob = new Blob(['dummy'], { type: 'text/plain' });
        formData.append('slipImage', blob, 'test.txt'); // Invalid type
        
        const res = await fetch(`${BASE_URL}/payments`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${studentToken}` }, body: formData
        });
        if (res.status === 400) passed('POST /payments invalid file type -> 400');
        else failed('POST /payments invalid file type', `Got ${res.status}`);
    } catch (e) { failed('POST /payments invalid file type', e.message); }

    // --- TEST 4: Successful Payment
    let paymentId;
    try {
        const formData = new FormData();
        formData.append('amount', '1000');
        formData.append('category', 'key_money');
        formData.append('paymentType', 'bank');
        const blob = new Blob(['dummy'], { type: 'image/jpeg' });
        formData.append('slipImage', blob, 'test.jpg');
        
        const res = await fetch(`${BASE_URL}/payments`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${studentToken}` }, body: formData
        });
        const data = await res.json();
        
        if (res.status === 201 && data.payment && data.payment.status === 'pending') {
            paymentId = data.payment._id;
            passed('POST /payments valid -> 201 & status pending');
            if (data.payment.slipImage.includes('/uploads/payments/')) {
                passed('Multer file path stored correctly in DB');
            } else {
                failed('Multer file path', data.payment.slipImage);
            }
        } else {
            failed('POST /payments valid', `Got ${res.status} | ${JSON.stringify(data)}`);
        }
    } catch (e) { failed('POST /payments valid', e.message); }

    // --- TEST 5: GET /my payments (Student)
    try {
        const res = await fetch(`${BASE_URL}/payments/my`, { headers: { 'Authorization': `Bearer ${studentToken}` } });
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data) && data.length > 0) passed('GET /payments/my -> 200 and valid array');
        else failed('GET /payments/my', `Got ${res.status}`);
    } catch (e) { failed('GET /payments/my', e.message); }

    // --- TEST 6: Warden GET all (Role separation)
    try {
        const res = await fetch(`${BASE_URL}/payments`, { headers: { 'Authorization': `Bearer ${wardenToken}` } });
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data) && data[0].studentId.email) passed('GET /payments (Warden) -> 200 + student population');
        else failed('GET /payments (Warden)', `Got ${res.status}`);
    } catch (e) { failed('GET /payments (Warden)', e.message); }

    // --- TEST 7: Student tries GET all (Security)
    try {
        const res = await fetch(`${BASE_URL}/payments`, { headers: { 'Authorization': `Bearer ${studentToken}` } });
        if (res.status === 403) passed('GET /payments (Student) -> blocked 403');
        else failed('GET /payments (Student)', `Got ${res.status}`);
    } catch (e) { failed('GET /payments (Student)', e.message); }

    // --- TEST 8: Unauthorized Request
    try {
        const res = await fetch(`${BASE_URL}/payments/my`);
        if (res.status === 401) passed('GET /payments/my without JWT -> blocked 401');
        else failed('GET /payments/my without JWT', `Got ${res.status}`);
    } catch (e) { failed('GET /payments/my without JWT', e.message); }

    // --- TEST 9: Student tries PUT status (Security)
    if (paymentId) {
        try {
            const res = await fetch(`${BASE_URL}/payments/${paymentId}`, {
                method: 'PUT', headers: { 'Authorization': `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            if (res.status === 403) passed('PUT /payments/:id (Student) -> blocked 403');
            else failed('PUT /payments/:id (Student)', `Got ${res.status}`);
        } catch (e) { failed('PUT /payments/:id (Student)', e.message); }

        // --- TEST 10: Warden updates status
        try {
            const res = await fetch(`${BASE_URL}/payments/${paymentId}`, {
                method: 'PUT', headers: { 'Authorization': `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            const data = await res.json();
            if (res.status === 200 && data.payment.status === 'approved') passed('PUT /payments/:id (Warden) -> 200 and mapped approved target');
            else failed('PUT /payments/:id (Warden)', `Got ${res.status}`);
        } catch (e) { failed('PUT /payments/:id (Warden)', e.message); }
    } else {
        failed('PUT updates', 'No paymentId generated to execute Warden tests');
    }

    console.log('\n--- FINAL SUMMARY ---');
    report.forEach(r => console.log(r));
    process.exit(0);
}

testPayments();
