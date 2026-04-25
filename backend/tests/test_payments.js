/**
 * ============================================================
 *  TEST SUITE: Payments  (/api/payments)
 *  Tests: create payment (with file), validation, get my payments,
 *         get all (warden), update status, role guards.
 * ============================================================
 */

const { BASE_URL, setupAuth, makeReporter, printSummary, disconnectDB } = require('./test_helpers');

async function runPaymentTests() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  💳  PAYMENTS API TESTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const report = [];
    const { passed, failed } = makeReporter(report);
    const { studentToken, wardenToken } = await setupAuth('payment_' + Date.now());

    // ── T1: Missing Fields (Student) ──────────────────────────
    try {
        const formData = new FormData();
        formData.append('amount', '500'); // missing category and paymentType
        const res = await fetch(`${BASE_URL}/payments`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${studentToken}` }, body: formData
        });
        if (res.status === 400) passed('POST /payments missing fields → 400');
        else failed('POST /payments missing fields', `Got ${res.status}`);
    } catch (e) { failed('POST /payments missing fields', e.message); }

    // ── T2: category="other" no description ───────────────────
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
        if (res.status === 400) passed('POST /payments category "other" no description → 400');
        else failed('POST /payments category "other" no description', `Got ${res.status}`);
    } catch (e) { failed('POST /payments category "other"', e.message); }

    // ── T3: Invalid file type ─────────────────────────────────
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
        if (res.status === 400) passed('POST /payments invalid file type → 400');
        else failed('POST /payments invalid file type', `Got ${res.status}`);
    } catch (e) { failed('POST /payments invalid file type', e.message); }

    // ── T4: Successful Payment ────────────────────────────────
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
            passed('POST /payments valid → 201 Created');
            if (data.payment.slipImage.includes('/uploads/payments/')) {
                passed('Multer file path stored correctly');
            } else {
                failed('Multer file path', data.payment.slipImage);
            }
        } else {
            failed('POST /payments valid', `Got ${res.status}`);
        }
    } catch (e) { failed('POST /payments valid', e.message); }

    // ── T5: GET /my payments (Student) ────────────────────────
    try {
        const res = await fetch(`${BASE_URL}/payments/my`, { headers: { 'Authorization': `Bearer ${studentToken}` } });
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data) && data.length > 0) passed('GET /payments/my → 200 array');
        else failed('GET /payments/my', `Got ${res.status}`);
    } catch (e) { failed('GET /payments/my', e.message); }

    // ── T6: Warden GET all (Role separation) ──────────────────
    try {
        const res = await fetch(`${BASE_URL}/payments`, { headers: { 'Authorization': `Bearer ${wardenToken}` } });
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data)) passed('GET /payments (Warden) → 200');
        else failed('GET /payments (Warden)', `Got ${res.status}`);
    } catch (e) { failed('GET /payments (Warden)', e.message); }

    // ── T7: Student tries GET all (Security) ──────────────────
    try {
        const res = await fetch(`${BASE_URL}/payments`, { headers: { 'Authorization': `Bearer ${studentToken}` } });
        if (res.status === 403) passed('GET /payments (Student) → blocked 403');
        else failed('GET /payments (Student)', `Got ${res.status}`);
    } catch (e) { failed('GET /payments (Student)', e.message); }

    // ── T8: Student tries PUT status (Security) ───────────────
    if (paymentId) {
        try {
            const res = await fetch(`${BASE_URL}/payments/${paymentId}`, {
                method: 'PUT', headers: { 'Authorization': `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            if (res.status === 403) passed('PUT /payments/:id (Student) → blocked 403');
            else failed('PUT /payments/:id (Student)', `Got ${res.status}`);
        } catch (e) { failed('PUT /payments/:id (Student)', e.message); }

        // ── T9: Warden updates status ─────────────────────────
        try {
            const res = await fetch(`${BASE_URL}/payments/${paymentId}`, {
                method: 'PUT', headers: { 'Authorization': `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            const data = await res.json();
            if (res.status === 200 && data.payment.status === 'approved') passed('PUT /payments/:id (Warden) → 200 approved');
            else failed('PUT /payments/:id (Warden)', `Got ${res.status}`);
        } catch (e) { failed('PUT /payments/:id (Warden)', e.message); }
    }

    printSummary('Payments', report);
    return report;
}

if (require.main === module) {
    runPaymentTests().then(() => disconnectDB()).then(() => process.exit(0));
}

module.exports = runPaymentTests;
