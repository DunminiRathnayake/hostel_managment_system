import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const RoomsPanel = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);

    const [roomNumber, setRoomNumber] = useState('');
    const [capacity, setCapacity] = useState('');
    const [roomType, setRoomType] = useState('Standard');

    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [allocating, setAllocating] = useState(false);

    const [editRoomId, setEditRoomId] = useState(null);
    const [editRoomNumber, setEditRoomNumber] = useState('');
    const [editCapacity, setEditCapacity] = useState('');
    const [editType, setEditType] = useState('Standard');

    const fetchRooms = async () => {
        try {
            const res = await axiosInstance.get('/rooms');
            setRooms(res.data.rooms || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await axiosInstance.get('/users/students?unassigned=true');
            setStudents(res.data || []);
        } catch (err) {
            console.error('Failed to fetch students', err);
        }
    };

    const handleAllocateRoom = async (e) => {
        e.preventDefault();
        setAllocating(true);
        try {
            await axiosInstance.post('/rooms/allocate', {
                studentId: selectedStudentId,
                roomId: selectedRoomId
            });
            alert('Student assigned successfully!');
            setSelectedStudentId('');
            setSelectedRoomId('');
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign student.');
        } finally {
            setAllocating(false);
        }
    };

    const handleSaveEdit = async (id) => {
        try {
            await axiosInstance.put(`/rooms/${id}`, {
                roomNumber: editRoomNumber,
                capacity: parseInt(editCapacity, 10),
                type: editType
            });
            setEditRoomId(null);
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to edit room parameters.');
        }
    };

    const updateRoomStatus = async (id, status) => {
        try {
            await axiosInstance.put(`/rooms/${id}/status`, { status });
            fetchRooms();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        setLoadingAction(true);
        try {
            await axiosInstance.post('/rooms', {
                roomNumber,
                capacity: parseInt(capacity, 10),
                type: roomType
            });
            setRoomNumber('');
            setCapacity('');
            setRoomType('Standard');
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add room.');
        } finally {
            setLoadingAction(false);
        }
    };

    if (loading) return <div style={{ color: '#64748b' }}>Loading Room Data...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Room Management</h1>

            {/* Top Action Forms Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                
                {/* Add New Room Card */}
                <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        ➕ Add New Room
                    </h3>
                    <form onSubmit={handleAddRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input type="text" placeholder="Room No. (e.g. 101)" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            <input type="number" placeholder="Capacity" value={capacity} onChange={e => setCapacity(e.target.value)} required min="1" style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                        </div>
                        <select value={roomType} onChange={e => setRoomType(e.target.value)} required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}>
                            <option value="Standard">Standard</option>
                            <option value="Premium">Premium</option>
                            <option value="Suite">Suite</option>
                        </select>
                        <button type="submit" disabled={loadingAction} className="action-btn" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem', fontWeight: '600' }}>
                            {loadingAction ? 'Adding...' : 'Add Room'}
                        </button>
                    </form>
                </div>

                {/* Assign Student to Room Card */}
                <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        👨‍🎓 Assign Student
                    </h3>
                    <form onSubmit={handleAllocateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}>
                            <option value="" disabled>Select a Student</option>
                            {students.map(s => <option key={s._id} value={s._id}>{s.name || 'Unnamed Student'}</option>)}
                        </select>
                        
                        <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}>
                            <option value="" disabled>Select available Room</option>
                            {rooms.filter(r => r.currentOccupancy < r.capacity && (r.status === 'available' || !r.status)).map(r => (
                                <option key={r._id} value={r._id}>Room {r.roomNumber} ({r.capacity - r.currentOccupancy} spots left)</option>
                            ))}
                        </select>

                        <button type="submit" disabled={allocating} className="action-btn btn-success" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem', fontWeight: '600', background: '#10b981' }}>
                            {allocating ? 'Assigning...' : 'Assign Student'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Room List Heading */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#334155' }}>Current Rooms</h2>
                <span className="badge badge-blue">Total: {rooms.length}</span>
            </div>

            {/* Room Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {rooms.map(room => {
                    const percentFull = Math.min(((room.currentOccupancy || 0) / room.capacity) * 100, 100);
                    
                    // Priority override for manual status
                    const isAvailableOverride = room.status === 'available' || !room.status;
                    const isOccupiedOverride = room.status === 'occupied';
                    const isMaintenance = room.status === 'maintenance';
                    
                    // Only map mathematically full if NOT forcefully overridden as Available
                    const isFull = (percentFull >= 100 && !isAvailableOverride) || isOccupiedOverride;
                    
                    let displayWidth = isOccupiedOverride ? 100 : percentFull;
                    let displayOccupied = room.currentOccupancy || 0;

                    if (isAvailableOverride && percentFull >= 100) {
                        displayWidth = 50; // User explicitly requested "blue half line" for liberated rooms
                        if (displayOccupied > 0) displayOccupied -= 1; // Visually sync the label down to 1 bed freed
                    }
                    
                    let barColor = '#3b82f6'; // Blue default
                    if (isFull) barColor = '#ef4444'; // Red if mathematically full or marked occupied
                    if (isMaintenance) barColor = '#f59e0b'; // Yellow if maintenance

                    if (editRoomId === room._id) {
                        return (
                            <div key={room._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', animation: 'fadeIn 0.2s ease' }}>
                                <h3 style={{fontSize:'1.2rem', marginBottom:'1rem', color:'#1e293b'}}>✏️ Edit Info</h3>
                                <div style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
                                    <input type="text" value={editRoomNumber} onChange={e=>setEditRoomNumber(e.target.value)} placeholder="Room No" required style={{padding:'0.8rem', borderRadius:'8px', border:'1px solid #cbd5e1', outline:'none'}} />
                                    <input type="number" min="1" value={editCapacity} onChange={e=>setEditCapacity(e.target.value)} placeholder="Capacity" required style={{padding:'0.8rem', borderRadius:'8px', border:'1px solid #cbd5e1', outline:'none'}} />
                                    <select value={editType} onChange={e=>setEditType(e.target.value)} style={{padding:'0.8rem', borderRadius:'8px', border:'1px solid #cbd5e1', outline:'none', background:'white'}}>
                                        <option value="Standard">Standard</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Suite">Suite</option>
                                    </select>
                                    <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem'}}>
                                        <button onClick={() => handleSaveEdit(room._id)} style={{flex:1, padding:'0.8rem', background:'#10b981', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Save</button>
                                        <button onClick={() => setEditRoomId(null)} style={{flex:1, padding:'0.8rem', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={room._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                             onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)'; }}
                             onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(0,0,0,0.05)'; }}>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.4rem', margin: 0, color: '#1e293b' }}>Room {room.roomNumber}</h3>
                                <select
                                    value={room.status || 'available'}
                                    onChange={(e) => updateRoomStatus(room._id, e.target.value)}
                                    className={`badge ${room.status === 'available' || !room.status ? 'badge-green' : room.status === 'maintenance' ? 'badge-yellow' : 'badge-red'}`}
                                    style={{ border: 'none', outline: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center', textTransform: 'capitalize', fontWeight: 'bold' }}
                                >
                                    <option value="available" style={{ color: '#1e293b' }}>Available</option>
                                    <option value="occupied" style={{ color: '#1e293b' }}>Occupied</option>
                                    <option value="booked" style={{ color: '#1e293b' }}>Booked</option>
                                    <option value="maintenance" style={{ color: '#1e293b' }}>Maintenance</option>
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', marginBottom: '0.8rem', fontWeight: '500' }}>
                                <span>Occupied: <strong style={{color: isFull ? '#ef4444' : '#10b981'}}>{displayOccupied}</strong></span>
                                <span>Capacity: <strong>{room.capacity}</strong></span>
                            </div>

                            {/* Beautiful visual capacity bar strictly respecting manual Status overrides */}
                            <div style={{ background: '#f1f5f9', borderRadius: '999px', height: '8px', overflow: 'hidden', marginBottom: '1.2rem' }}>
                                <div style={{ height: '100%', width: `${displayWidth}%`, background: barColor, transition: 'all 0.4s ease' }}></div>
                            </div>
                            
                            <button onClick={() => { setEditRoomId(room._id); setEditRoomNumber(room.roomNumber); setEditCapacity(room.capacity); setEditType(room.type); }} style={{ width: '100%', padding: '0.7rem', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }} onMouseEnter={e => {e.currentTarget.style.background='#f1f5f9'; e.currentTarget.style.color='#334155'}} onMouseLeave={e => {e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.color='#64748b'}}>
                                ✏️ Edit Room Settings
                            </button>
                        </div>
                    );
                })}
                
                {rooms.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛏️</div>
                        <h3>No Rooms Available</h3>
                        <p>Create your first room using the form above.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomsPanel;
