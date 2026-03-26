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
            const res = await axiosInstance.get('/users/students');
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
            alert('Room assigned successfully!');
            setSelectedStudentId('');
            setSelectedRoomId('');
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to allocate room.');
        } finally {
            setAllocating(false);
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

    if (loading) return <div style={{ color: '#64748b' }}>Loading Room configurations...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Room Management</h1>

            <div className="form-card">
                <h3>Create New Room</h3>
                <form onSubmit={handleAddRoom} className="inline-form">
                    <input type="text" placeholder="Room Number (e.g., A101)" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required />
                    <input type="number" placeholder="Capacity" value={capacity} onChange={e => setCapacity(e.target.value)} required min="1" />
                    <select value={roomType} onChange={e => setRoomType(e.target.value)} required style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                        <option value="Suite">Suite</option>
                    </select>
                    <button type="submit" disabled={loadingAction} className="action-btn">
                        {loadingAction ? 'Adding...' : 'Add Room'}
                    </button>
                </form>
            </div>

            <div className="form-card" style={{ marginTop: '2rem' }}>
                <h3>Assign Student to Room</h3>
                <form onSubmit={handleAllocateRoom} className="inline-form">
                    <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} required style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', flex: 1 }}>
                        <option value="" disabled>Select Student</option>
                        {students.map(s => <option key={s._id} value={s._id}>{s.name || 'Unnamed Student'}</option>)}
                    </select>
                    <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} required style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', flex: 1 }}>
                        <option value="" disabled>Select Room</option>
                        {rooms.filter(r => r.currentOccupancy < r.capacity && (r.status === 'available' || !r.status)).map(r => (
                            <option key={r._id} value={r._id}>{r.roomNumber} ({r.capacity - r.currentOccupancy} spots left)</option>
                        ))}
                    </select>
                    <button type="submit" disabled={allocating} className="action-btn btn-success" style={{ background: '#10b981' }}>
                        {allocating ? 'Assigning...' : 'Assign Room'}
                    </button>
                </form>
            </div>

            <div className="table-responsive" style={{ marginTop: '2rem' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Room Identifier</th>
                            <th>Total Capacity</th>
                            <th>Currently Occupied</th>
                            <th>Status Tag</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map(room => (
                            <tr key={room._id}>
                                <td>{room.roomNumber}</td>
                                <td>{room.capacity} Headcount</td>
                                <td>{room.currentOccupancy || 0} Assigned</td>
                                <td>
                                    <select
                                        value={room.status || 'available'}
                                        onChange={(e) => updateRoomStatus(room._id, e.target.value)}
                                        className={`badge ${room.status === 'available' || !room.status ? 'badge-green' : room.status === 'maintenance' ? 'badge-yellow' : 'badge-red'}`}
                                        style={{ border: 'none', outline: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center', textTransform: 'capitalize' }}
                                    >
                                        <option value="available" style={{ color: '#1e293b' }}>Available</option>
                                        <option value="occupied" style={{ color: '#1e293b' }}>Occupied</option>
                                        <option value="booked" style={{ color: '#1e293b' }}>Booked</option>
                                        <option value="maintenance" style={{ color: '#1e293b' }}>Maintenance</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {rooms.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No configured rooms present locally.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoomsPanel;
