import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const VisitorDashboard = () => {
    const [activeTab, setActiveTab] = useState('book'); // 'book' or 'status'

    // Booking Form State
    const [visitorName, setVisitorName] = useState('');
    const [phone, setPhone] = useState('');
    const [NIC, setNIC] = useState('');
    const [type, setType] = useState('room_visit');
    const [studentId, setStudentId] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Status Check State
    const [checkPhone, setCheckPhone] = useState('');
    const [checkNIC, setCheckNIC] = useState('');
    const [myBookings, setMyBookings] = useState([]);
    const [checking, setChecking] = useState(false);
    const [statusError, setStatusError] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            if (type !== 'student_visit') return;
            try {
                const res = await axiosInstance.get('/users/students');
                setStudents(res.data);
                if (res.data.length > 0) setStudentId(res.data[0]._id);
            } catch (err) { console.error('Failed to isolate student identities safely'); }
        };
        fetchStudents();
    }, [type]);

    const handleBook = async (e) => {
        e.preventDefault();
        setErrorMsg(''); setSuccessMsg('');

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone.replace(/[^0-9]/g, ''))) {
            return setErrorMsg('Please enter a valid 10-digit phone number.');
        }
        if (NIC.length < 9) {
            return setErrorMsg('Please enter a valid NIC.');
        }

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            return setErrorMsg('You cannot book a date in the past.');
        }

        const [hours, minutes] = time.split(':').map(Number);

        setLoading(true);
        try {
            const payload = { visitorName, phone, NIC, type, date, time };
            if (type === 'student_visit') payload.studentId = studentId;

            await axiosInstance.post('/bookings', payload);
            setSuccessMsg('Done! Your appointment is successfully booked.');
            setVisitorName(''); setPhone(''); setNIC(''); setType('room_visit'); setDate(''); setTime('');
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckStatus = async (e) => {
        e.preventDefault();
        setStatusError('');
        setMyBookings([]);
        setChecking(true);
        try {
            const res = await axiosInstance.get(`/bookings/my?phone=${checkPhone}&NIC=${checkNIC}`);
            setMyBookings(res.data);
            if (res.data.length === 0) setStatusError('No booked visits found for this information.');
        } catch (err) {
            setStatusError('Something went wrong. Could not check status.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 1.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>

            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Hostel Visits</h1>
                <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Friendly, fast, and simple booking for our guests.</p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Modern Segmented Control Tabs */}
                <div style={{ display: 'flex', background: '#e2e8f0', padding: '0.4rem', borderRadius: '12px', marginBottom: '2.5rem' }}>
                    <button
                        onClick={() => { setActiveTab('book'); setSuccessMsg(''); setErrorMsg(''); }}
                        style={{ flex: 1, padding: '1rem', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', background: activeTab === 'book' ? 'white' : 'transparent', color: activeTab === 'book' ? '#3b82f6' : '#64748b', boxShadow: activeTab === 'book' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none' }}>
                        📅 Book Visit
                    </button>
                    <button
                        onClick={() => { setActiveTab('status'); setStatusError(''); }}
                        style={{ flex: 1, padding: '1rem', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', background: activeTab === 'status' ? 'white' : 'transparent', color: activeTab === 'status' ? '#3b82f6' : '#64748b', boxShadow: activeTab === 'status' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none' }}>
                        🔍 Check Status
                    </button>
                </div>

                {/* Content Panels */}
                <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>

                    {activeTab === 'book' ? (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h2 style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                Book Your Visit
                            </h2>

                            {successMsg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #34d399', fontWeight: 'bold' }}>✅ {successMsg}</div>}
                            {errorMsg && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fca5a5', fontWeight: 'bold' }}>⚠️ {errorMsg}</div>}

                            <form onSubmit={handleBook} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Your Full Name</label>
                                    <input type="text" required value={visitorName} onChange={e => setVisitorName(e.target.value)} placeholder="e.g. Enter your Name.." style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Phone Number</label>
                                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XXXXXXXX" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>NIC Number</label>
                                    <input type="text" required value={NIC} onChange={e => setNIC(e.target.value)} placeholder="National ID" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Select Date</label>
                                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', background: 'white' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Select Time</label>
                                    <select required value={time} onChange={e => setTime(e.target.value)} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', background: 'white', cursor: 'pointer' }}>
                                        <option value="" disabled>Choose a time slot...</option>
                                        {Array.from({ length: 24 }).map((_, i) => {
                                            const hour = Math.floor(i / 2) + 8;
                                            const min = i % 2 === 0 ? '00' : '30';
                                            const timeString24 = `${hour.toString().padStart(2, '0')}:${min}`;
                                            const period = hour >= 12 ? 'PM' : 'AM';
                                            const hour12 = hour > 12 ? hour - 12 : hour;
                                            const timeString12 = `${hour12.toString().padStart(2, '0')}:${min} ${period}`;
                                            return <option key={timeString24} value={timeString24}>{timeString12}</option>;
                                        })}
                                    </select>
                                </div>

                                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Who are you visiting?</label>
                                    <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', background: 'white', cursor: 'pointer' }}>
                                        <option value="room_visit">Visit to check rooms</option>
                                        <option value="student_visit">Visit a student</option>
                                    </select>
                                </div>

                                {type === 'student_visit' && (
                                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'fadeIn 0.3s ease' }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Select Student</label>
                                        <select required value={studentId} onChange={e => setStudentId(e.target.value)} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', background: 'white', cursor: 'pointer' }}>
                                            {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                <button type="submit" disabled={loading} style={{ gridColumn: '1 / -1', background: '#3b82f6', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', padding: '1.2rem', marginTop: '1rem', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }} onMouseEnter={e => e.currentTarget.style.background = '#2563eb'} onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}>
                                    {loading ? 'Submitting...' : 'Book Visit'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h2 style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                Check Visit Status
                            </h2>
                            <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>Enter your tracking details below.</p>

                            {statusError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fca5a5', fontWeight: 'bold' }}>⚠️ {statusError}</div>}

                            <form onSubmit={handleCheckStatus} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                <input type="tel" required placeholder="Phone Number" value={checkPhone} onChange={e => setCheckPhone(e.target.value)} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', width: '100%' }} />
                                <input type="text" required placeholder="NIC Number" value={checkNIC} onChange={e => setCheckNIC(e.target.value)} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', width: '100%' }} />
                                <button type="submit" disabled={checking} style={{ background: '#0f172a', color: 'white', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
                                    {checking ? 'Checking...' : 'Check Status'}
                                </button>
                            </form>

                            {myBookings.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.5s ease', marginTop: '3rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Your Booked Visits</h3>
                                    {myBookings.map(b => (
                                        <div key={b._id} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                                            <div>
                                                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', color: '#1e293b', textTransform: 'capitalize' }}>{b.type.replace('_', ' ')}</h4>
                                                <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>
                                                    📅 {new Date(b.date).toLocaleDateString()} at ⏰ {b.time}
                                                </p>
                                            </div>
                                            <span style={{
                                                padding: '0.6rem 1.2rem',
                                                borderRadius: '999px',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                fontSize: '0.85rem',
                                                background: b.status === 'approved' ? '#d1fae5' : b.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                                color: b.status === 'approved' ? '#065f46' : b.status === 'rejected' ? '#991b1b' : '#92400e',
                                                border: `1px solid ${b.status === 'approved' ? '#34d399' : b.status === 'rejected' ? '#fca5a5' : '#fde68a'}`
                                            }}>
                                                {b.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default VisitorDashboard;
