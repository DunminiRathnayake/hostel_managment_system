import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../api/axios';

const RoomsPanel = () => {
    const [rooms, setRooms] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);

    const [roomNumber, setRoomNumber] = useState('');
    const [capacity, setCapacity] = useState('');
    const [roomType, setRoomType] = useState('Standard');

    

    const [editRoomId, setEditRoomId] = useState(null);
    const [editRoomNumber, setEditRoomNumber] = useState('');
    const [editCapacity, setEditCapacity] = useState('');
    const [editType, setEditType] = useState('Standard');

    const suggestedRoomNumber = useMemo(() => {
        if (!rooms || rooms.length === 0) return '101';
        let maxNum = 0;
        let suggested = '101';
        rooms.forEach(r => {
            const numStr = String(r.roomNumber);
            const match = numStr.match(/^(.*?)(\d+)$/);
            if (match) {
                const currentNum = parseInt(match[2], 10);
                if (currentNum > maxNum) {
                    maxNum = currentNum;
                    const newNumStr = (currentNum + 1).toString().padStart(match[2].length, '0');
                    suggested = `${match[1]}${newNumStr}`;
                }
            }
        });
        return maxNum === 0 ? '101' : suggested;
    }, [rooms]);

    // Pre-fill on initial load if empty
    useEffect(() => {
        if (!roomNumber && rooms.length > 0) {
            setRoomNumber(suggestedRoomNumber);
        } else if (!roomNumber && rooms.length === 0) {
            setRoomNumber('101');
        }
    }, [rooms.length]); // Only run when total number of rooms changes (e.g. after fetch/add)

    const fetchRooms = async () => {
        try {
            const res = await axiosInstance.get(`/rooms?t=${Date.now()}`);
            const fetchedRooms = res.data.rooms || [];
            // Sort to display newest rooms first
            fetchedRooms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRooms(fetchedRooms);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axiosInstance.get(`/users/students?t=${Date.now()}`);
            setStudents(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchStudents();
    }, []);

    const handleOccupancyChange = async (roomId, newOccupancy) => {
        try {
            await axiosInstance.put(`/rooms/${roomId}/occupancy`, { occupied: parseInt(newOccupancy, 10) });
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update occupancy.');
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

    const handleAssignStudent = async (roomId, studentId) => {
        if (!studentId) return;
        const student = students.find(s => s._id === studentId);
        
        if (student && student.assignedRoomId && student.assignedRoomId !== roomId) {
            if (!window.confirm(`${student.name} is already assigned to Room ${student.assignedRoom}. Remove and reassign?`)) {
                return;
            }
            try {
                await axiosInstance.post('/rooms/remove', { studentId, roomId: student.assignedRoomId });
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to remove from current room');
                return;
            }
        }

        try {
            await axiosInstance.post('/rooms/allocate', { studentId, roomId });
            fetchRooms();
            fetchStudents();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign room');
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
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 500px)', gap: '2rem', marginBottom: '3rem' }}>
                
                {/* Add New Room Card */}
                <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        ➕ Add New Room
                    </h3>
                    <form onSubmit={handleAddRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <input type="text" placeholder={`Room No. (e.g. ${suggestedRoomNumber})`} value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                                {roomNumber !== suggestedRoomNumber && (
                                    <span style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.4rem', cursor: 'pointer', fontWeight: '600', transition: 'color 0.2s', alignSelf: 'flex-start' }} onClick={() => setRoomNumber(suggestedRoomNumber)}>
                                        💡 Suggest: {suggestedRoomNumber}
                                    </span>
                                )}
                            </div>
                            <input type="number" placeholder="Capacity" value={capacity} onChange={e => setCapacity(e.target.value)} required min="1" style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', height: '100%' }} />
                        </div>
                        <select value={roomType} onChange={e => setRoomType(e.target.value)} required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}>
                            <option value="Standard">Standard</option>
                            <option value="Premium">Premium</option>
                        </select>
                        <button type="submit" disabled={loadingAction} className="action-btn" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem', fontWeight: '600' }}>
                            {loadingAction ? 'Adding...' : 'Add Room'}
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
                    const currentOccupancy = room.currentOccupancy || 0;
                    const spotsLeft = room.capacity - currentOccupancy;
                    const isFull = spotsLeft <= 0;
                    const percentFull = Math.min((currentOccupancy / room.capacity) * 100, 100);
                    
                    const statusText = isFull ? 'Occupied' : `Available (${spotsLeft} slot${spotsLeft !== 1 ? 's' : ''})`;
                    const statusBadgeClass = isFull ? 'badge-red' : 'badge-green';
                    const barColor = isFull ? '#ef4444' : '#3b82f6';

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
                                <span className={`badge ${statusBadgeClass}`} style={{ fontWeight: 'bold' }}>
                                    {statusText}
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', marginBottom: '0.8rem', fontWeight: '500' }}>
                                <span>Occupied: <strong style={{color: isFull ? '#ef4444' : '#10b981'}}>{currentOccupancy}</strong></span>
                                <span>Capacity: <strong>{room.capacity}</strong></span>
                            </div>

                            {/* Dynamic visual capacity bar */}
                            <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden', marginBottom: '1.2rem' }}>
                                <div style={{ height: '100%', width: `${percentFull}%`, background: barColor, transition: 'all 0.4s ease' }}></div>
                            </div>

                            {/* Occupancy Dropdown */}
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.2rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', marginBottom: '0.6rem', display: 'block' }}>Set Occupancy Level:</label>
                                <select 
                                    value={currentOccupancy}
                                    onChange={(e) => handleOccupancyChange(room._id, e.target.value)}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.9rem', color: '#1e293b', cursor: 'pointer', marginBottom: '1rem' }}
                                >
                                    {Array.from({ length: room.capacity + 1 }, (_, i) => {
                                        const left = room.capacity - i;
                                        const label = i === room.capacity ? 'Occupied' : `Available (${left} slot${left !== 1 ? 's' : ''})`;
                                        return <option key={i} value={i}>{label}</option>;
                                    })}
                                </select>

                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', marginBottom: '0.6rem', display: 'block' }}>Assign Student:</label>
                                <select
                                    value=""
                                    onChange={(e) => handleAssignStudent(room._id, e.target.value)}
                                    disabled={isFull}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: isFull ? '#f1f5f9' : 'white', fontSize: '0.9rem', color: '#1e293b', cursor: isFull ? 'not-allowed' : 'pointer' }}
                                >
                                    <option value="" disabled>{isFull ? 'Room is Full' : 'Select a student...'}</option>
                                    {students.filter(s => s.status === 'active' && s.assignedRoom === 'Unassigned').map(s => (
                                        <option key={s._id} value={s._id}>
                                            {s.name} (Unassigned)
                                        </option>
                                    ))}
                                </select>
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
