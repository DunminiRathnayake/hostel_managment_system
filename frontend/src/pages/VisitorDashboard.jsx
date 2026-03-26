import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import './VisitorDashboard.css';

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
             // Optimize API calls inherently blocking extraneous queries natively
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
        today.setHours(0,0,0,0);
        if (selectedDate < today) {
            return setErrorMsg('You cannot book a date in the past.');
        }

        setLoading(true);
        try {
            const payload = { visitorName, phone, NIC, type, date, time };
            if (type === 'student_visit') payload.studentId = studentId;

            await axiosInstance.post('/bookings', payload);
            setSuccessMsg('Done! Your appointment is booked.');
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
            if (res.data.length === 0) setStatusError('No appointments found for this information.');
        } catch (err) {
            setStatusError('Something went wrong. Could not check status.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="visitor-container">
            <h1 style={{color:'#0369a1', fontSize:'2.4rem', fontWeight:'800', marginBottom:'0.5rem'}}>Hostel Gateway Portal</h1>
            <p style={{color:'#0284c7', fontSize:'1.1rem'}}>Visitor Appointment Booking Portal</p>
            
            <div className="visitor-content">
                <div className="visitor-tabs">
                    <button className={activeTab === 'book' ? 'active' : ''} onClick={() => { setActiveTab('book'); setSuccessMsg(''); setErrorMsg(''); }}>Book an Appointment</button>
                    <button className={activeTab === 'status' ? 'active' : ''} onClick={() => { setActiveTab('status'); setStatusError(''); }}>Check Appointment Status</button>
                </div>

                {activeTab === 'book' ? (
                    <div className="visitor-panel">
                        <h2>Book Your Visit</h2>
                        {successMsg && <div className="error-alert" style={{background:'#d1fae5', color:'#065f46', borderColor:'#34d399'}}>{successMsg}</div>}
                        {errorMsg && <div className="error-alert">{errorMsg}</div>}
                        
                        <form onSubmit={handleBook} style={{display:'flex', flexDirection:'column', gap:'1.2rem'}}>
                            <div className="form-group-alt">
                                <label>Your Full Name</label>
                                <input type="text" required value={visitorName} onChange={e=>setVisitorName(e.target.value)} />
                            </div>
                            <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
                                <div className="form-group-alt" style={{flex:1, minWidth:'200px'}}>
                                    <label>Phone Number</label>
                                    <input type="tel" required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="07XXXXXXXX" />
                                </div>
                                <div className="form-group-alt" style={{flex:1, minWidth:'200px'}}>
                                    <label>NIC Number</label>
                                    <input type="text" required value={NIC} onChange={e=>setNIC(e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="form-group-alt">
                                <label>Visit Type</label>
                                <select value={type} onChange={e=>setType(e.target.value)}>
                                    <option value="room_visit">Visit Rooms</option>
                                    <option value="student_visit">Visit Student</option>
                                </select>
                            </div>

                            {type === 'student_visit' && (
                                <div className="form-group-alt" style={{animation:'fadeIn 0.3s ease'}}>
                                    <label>Select Student</label>
                                    <select required value={studentId} onChange={e=>setStudentId(e.target.value)}>
                                        {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
                                <div className="form-group-alt" style={{flex:1, minWidth:'150px'}}>
                                    <label>Select Date</label>
                                    <input type="date" required value={date} onChange={e=>setDate(e.target.value)} />
                                </div>
                                <div className="form-group-alt" style={{flex:1, minWidth:'150px'}}>
                                    <label>Select Time</label>
                                    <input type="time" required value={time} onChange={e=>setTime(e.target.value)} />
                                </div>
                            </div>
                            
                            <button type="submit" disabled={loading} className="action-btn" style={{background:'#0ea5e9', fontSize:'1.1rem', padding:'1.2rem', marginTop:'1.5rem', borderRadius:'12px'}}>
                                {loading ? 'Submitting...' : 'Book Appointment'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="visitor-panel">
                        <h2>Check Appointment Status</h2>
                        <p style={{color:'#64748b', marginBottom:'2rem'}}>Enter your details below to check your appointment status.</p>

                        {statusError && <div className="error-alert">{statusError}</div>}
                        
                        <form onSubmit={handleCheckStatus} style={{display:'flex', gap:'1rem', marginBottom:'2rem', flexWrap:'wrap'}}>
                            <input type="tel" required placeholder="Phone Number" value={checkPhone} onChange={e=>setCheckPhone(e.target.value)} className="form-group-alt" style={{flex:2, border:'1px solid #cbd5e1', padding:'1rem', borderRadius:'8px', minWidth:'200px'}} />
                            <input type="text" required placeholder="NIC Number" value={checkNIC} onChange={e=>setCheckNIC(e.target.value)} className="form-group-alt" style={{flex:2, border:'1px solid #cbd5e1', padding:'1rem', borderRadius:'8px', minWidth:'200px'}} />
                            <button type="submit" disabled={checking} className="action-btn" style={{flex:1, background:'#0ea5e9', fontSize:'1.1rem', borderRadius:'8px'}}>Check Status</button>
                        </form>

                        {myBookings.length > 0 && (
                            <div className="table-responsive" style={{animation:'fadeIn 0.5s ease'}}>
                            <table className="data-table">
                                <thead><tr><th>Visit Type</th><th>Date & Time</th><th>Status</th></tr></thead>
                                <tbody>
                                    {myBookings.map(b => (
                                        <tr key={b._id}>
                                            <td style={{textTransform:'capitalize'}}>{b.type.replace('_', ' ')}</td>
                                            <td>{new Date(b.date).toLocaleDateString()} strictly at {b.time}</td>
                                            <td><span className={`badge ${b.status==='approved'?'badge-green':b.status==='rejected'?'badge-red':'badge-yellow'}`}>{b.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default VisitorDashboard;
