/**
 * ============================================================
 *  TEST SUITE: Room Management  (/api/rooms)
 *  Tests: add room, get rooms, allocate student, remove student,
 *         capacity enforcement, duplicate room number, role guards.
 * ============================================================
 */

const { BASE_URL, setupAuth, makeReporter, printSummary, disconnectDB } = require('./test_helpers');

async function runRoomTests() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🛏️  ROOM MANAGEMENT API TESTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const report = [];
    const { passed, failed } = makeReporter(report);
    const { studentToken, wardenToken, studentId } = await setupAuth('room_' + Date.now());

    const uniqueRoom = `TEST-${Date.now()}`;
    let roomId = null;

    // ── T1: Student cannot add a room (role guard) ────────────
    try {
        const res = await fetch(`${BASE_URL}/rooms`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomNumber: uniqueRoom, capacity: 2, type: 'Standard' })
        });
        if (res.status === 403) passed('Student POST /rooms → 403 Forbidden');
        else failed('Student POST /rooms role guard', `Expected 403, got ${res.status}`);
    } catch (e) { failed('Student POST /rooms', e.message); }

    // ── T2: Warden adds a room (missing fields) ───────────────
    try {
        const res = await fetch(`${BASE_URL}/rooms`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomNumber: uniqueRoom }) // missing capacity & type
        });
        if (res.status === 400) passed('POST /rooms missing fields → 400');
        else failed('POST /rooms missing fields', `Expected 400, got ${res.status}`);
    } catch (e) { failed('POST /rooms missing fields', e.message); }

    // ── T3: Warden adds a valid room ─────────────────────────
    try {
        const res = await fetch(`${BASE_URL}/rooms`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomNumber: uniqueRoom, capacity: 2, type: 'Standard' })
        });
        const data = await res.json();
        if (res.status === 201 && data.room?._id) {
            roomId = data.room._id;
            passed(`POST /rooms valid → 201 (Room: ${uniqueRoom})`);
        } else {
            failed('POST /rooms valid', `Status ${res.status} | ${JSON.stringify(data)}`);
        }
    } catch (e) { failed('POST /rooms valid', e.message); }

    // ── T4: Duplicate room number rejected ────────────────────
    if (roomId) {
        try {
            const res = await fetch(`${BASE_URL}/rooms`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomNumber: uniqueRoom, capacity: 1, type: 'Standard' })
            });
            if (res.status === 400) passed('POST /rooms duplicate room number → 400');
            else failed('Duplicate room number', `Expected 400, got ${res.status}`);
        } catch (e) { failed('Duplicate room number', e.message); }
    }

    // ── T5: Get all rooms ─────────────────────────────────────
    try {
        const res = await fetch(`${BASE_URL}/rooms`, {
            headers: { Authorization: `Bearer ${wardenToken}` }
        });
        const data = await res.json();
        if (res.status === 200 && Array.isArray(data.rooms)) {
            passed(`GET /rooms → 200 (${data.rooms.length} room(s))`);
        } else {
            failed('GET /rooms', `Status ${res.status}`);
        }
    } catch (e) { failed('GET /rooms', e.message); }

    // ── T6: Allocate student to room ──────────────────────────
    if (roomId) {
        try {
            const res = await fetch(`${BASE_URL}/rooms/allocate`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, roomId })
            });
            const data = await res.json();
            if (res.status === 201 && data.allocation) {
                passed('POST /rooms/allocate → 201 student allocated');
            } else {
                failed('POST /rooms/allocate', `Status ${res.status} | ${JSON.stringify(data)}`);
            }
        } catch (e) { failed('POST /rooms/allocate', e.message); }

        // ── T7: Double-allocate same student → rejected ───────
        try {
            const res = await fetch(`${BASE_URL}/rooms/allocate`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, roomId })
            });
            if (res.status === 400) passed('Double-allocate same student → 400');
            else failed('Double-allocate guard', `Expected 400, got ${res.status}`);
        } catch (e) { failed('Double-allocate guard', e.message); }

        // ── T8: Update room occupancy ─────────────────────────
        try {
            const res = await fetch(`${BASE_URL}/rooms/${roomId}/occupancy`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ occupied: 1 })
            });
            const data = await res.json();
            if (res.status === 200 && data.room) passed('PUT /rooms/:id/occupancy → 200 updated');
            else failed('PUT /rooms/:id/occupancy', `Status ${res.status}`);
        } catch (e) { failed('PUT /rooms/:id/occupancy', e.message); }

        // ── T9: Over-capacity occupancy rejected ──────────────
        try {
            const res = await fetch(`${BASE_URL}/rooms/${roomId}/occupancy`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ occupied: 999 })
            });
            if (res.status === 400) passed('Over-capacity occupancy → 400');
            else failed('Over-capacity guard', `Expected 400, got ${res.status}`);
        } catch (e) { failed('Over-capacity guard', e.message); }

        // ── T10: Remove student from room ─────────────────────
        try {
            const res = await fetch(`${BASE_URL}/rooms/remove`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, roomId })
            });
            const data = await res.json();
            if (res.status === 200) passed('POST /rooms/remove → 200 student removed');
            else failed('POST /rooms/remove', `Status ${res.status} | ${JSON.stringify(data)}`);
        } catch (e) { failed('POST /rooms/remove', e.message); }

        // ── T11: Edit room details ─────────────────────────────
        try {
            const res = await fetch(`${BASE_URL}/rooms/${roomId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${wardenToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomNumber: uniqueRoom, capacity: 3, type: 'Premium' })
            });
            const data = await res.json();
            if (res.status === 200 && data.room?.capacity === 3) passed('PUT /rooms/:id → 200 room updated');
            else failed('PUT /rooms/:id', `Status ${res.status}`);
        } catch (e) { failed('PUT /rooms/:id', e.message); }
    }

    printSummary('Rooms', report);
    return report;
}

if (require.main === module) {
    runRoomTests().then(() => disconnectDB()).then(() => process.exit(0));
}

module.exports = runRoomTests;
