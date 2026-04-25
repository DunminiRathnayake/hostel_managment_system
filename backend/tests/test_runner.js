/**
 *  MASTER TEST RUNNER
 *  Executes all test suites in the `tests/` directory sequentially.
 */

const { disconnectDB } = require('./test_helpers');

// Import all test suites
const runAuthTests = require('./test_auth');
const runRoomTests = require('./test_rooms');
const runComplaintTests = require('./test_complaints');
const runBookingTests = require('./test_bookings');
const runPaymentTests = require('./test_payments');
const runQRTests = require('./test_qr');

async function runAllTests() {
    console.log('======================================================');
    console.log('       HOSTEL MANAGEMENT SYSTEM - TEST SUITE RUNNER');
    console.log('======================================================');

    let totalPass = 0;
    let totalFail = 0;
    let totalTests = 0;

    const runAndAccumulate = async (testRunner) => {
        const report = await testRunner();
        report.forEach(r => {
            totalTests++;
            if (r.status === 'PASS') totalPass++;
            if (r.status === 'FAIL') totalFail++;
        });
    };

    try {
        await runAndAccumulate(runAuthTests);
        await runAndAccumulate(runRoomTests);
        await runAndAccumulate(runComplaintTests);
        await runAndAccumulate(runBookingTests);
        await runAndAccumulate(runPaymentTests);
        await runAndAccumulate(runQRTests);

        console.log('\n======================================================');
        console.log('               OVERALL TEST RESULTS');
        console.log('======================================================');
        console.log(`  Total Tests : ${totalTests}`);
        console.log(`  Passed      : ${totalPass}`);
        console.log(`  Failed      : ${totalFail}`);
        console.log('======================================================\n');

        // Automatically clean up dummy data created during tests
        const cleanTestData = require('../scripts/cleanup_tests');
        await cleanTestData();

        if (totalFail > 0) {
            console.log('❌ Some tests failed. Please check the logs above.');
            process.exitCode = 1;
        } else {
            console.log('✅ All tests passed successfully!');
        }

    } catch (error) {
        console.error('CRITICAL ERROR DURING TEST RUN:', error);
        process.exitCode = 1;
    } finally {
        await disconnectDB();
        process.exit(process.exitCode || 0);
    }
}

runAllTests();
