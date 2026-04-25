/**
 * ============================================================
 *  TEST SUITE: Complaints  (/api/complaints)
 *  Tests: create complaint, get my complaints, get all (warden),
 *         update status, delete complaint.
 * ============================================================
 */

const { BASE_URL, setupAuth, makeReporter, printSummary, disconnectDB } = require('./test_helpers');

async function runComplaintTests() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ⚠️  COMPLAINTS API TESTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const report = [];
    const { passed, failed } = makeReporter(report);
    const { studentToken, wardenToken } = await setupAuth('complaint_' + Date.now());

    let complaintId = null;

    // ── T1: Create complaint missing fields ───────────────────
    try {
        const res = await fetch(`${BASE_URL}/complaints`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Broken Light' }) // missing description
        });
        if (res.status === 400) passed('POST /complaints missing fields → 400');
        else failed('POST /complaints missing fields', `Expected 400, got ${res.status}`);
    } catch (e) { failed('POST /complaints missing fields', e.message); }

    // ── T2: Create valid complaint (Student) ──────────────────
    try {
        const res = await fetch(`${BASE_URL}/complaints`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Broken Window', description: 'Window in my room is broken' })
        });
        const data = await res.json();
        if (res.status === 201 && data.complaint?._id) {
            complaintId = data.complaint._id;
            passed('POST /complaints valid → 201 Created');
        } else {
            failed('POST /complaints valid', `Status ${res.status} | ${JSON.stringify(data)}`);
        }
    } catch (e) { failed('POST /complaints valid', e.message); }

    // ── T3: Get my complaints (Student) ───────────────────────
    try {
        const res = await fetch(`${BASE_URL}/complaints/my-complaints`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data.complaints) && data.complaints.length > 0) {
            passed('GET /complaints/my-complaints → 200 with array');
        } else {
            failed('GET /complaints/my-complaints', `Status ${res.status}`);
        }
    } catch (e) { failed('GET /complaints/my-complaints', e.message); }

    // ── T4: Get all complaints (Warden) ───────────────────────
    try {
        const res = await fetch(`${BASE_URL}/complaints`, {
            headers: { Authorization: `Bearer ${wardenToken}` }
        });
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data.complaints)) {
            passed('GET /complaints (Warden) → 200 with array');
        } else {
            failed('GET /complaints (Warden)', `Status ${res.status}`);
        }
    } catch (e) { failed('GET /complaints (Warden)', e.message); }

    // ── T5: Update complaint status (Warden) ──────────────────
    if (complaintId) {
        try {
            const res = await fetch(`${BASE_URL}/complaints/${complaintId}/status`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'in-progress' })
            });
            const data = await res.json();
            if (res.status === 200 && data.complaint?.status === 'in-progress') {
                passed('PUT /complaints/:id/status → 200 updated');
            } else {
                failed('PUT /complaints/:id/status', `Status ${res.status} | ${JSON.stringify(data)}`);
            }
        } catch (e) { failed('PUT /complaints/:id/status', e.message); }

        // ── T6: Delete complaint (Warden) ─────────────────────────
        try {
            const res = await fetch(`${BASE_URL}/complaints/${complaintId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${wardenToken}` }
            });
            if (res.status === 200) passed('DELETE /complaints/:id → 200 deleted');
            else failed('DELETE /complaints/:id', `Status ${res.status}`);
        } catch (e) { failed('DELETE /complaints/:id', e.message); }
    }

    printSummary('Complaints', report);
    return report;
}

if (require.main === module) {
    runComplaintTests().then(() => disconnectDB()).then(() => process.exit(0));
}

module.exports = runComplaintTests;
