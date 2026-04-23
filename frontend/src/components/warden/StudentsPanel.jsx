import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../api/axios';

const StudentsPanel = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchStudents = async () => {
        try {
            const res = await axiosInstance.get('/users/students');
            setStudents(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDeactivate = async (studentId) => {
        if (!window.confirm("Are you sure you want to checkout/remove this student? They will be deactivated and removed from their room.")) return;
        try {
            await axiosInstance.put(`/users/deactivate/${studentId}`);
            fetchStudents(); // refresh UI
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to deactivate student');
        }
    };

    const filteredStudents = useMemo(() => {
        if (!Array.isArray(students)) return [];
        const term = (search || '').toLowerCase();
        return students.filter(s => {
            const name = (s.name || '').toLowerCase();
            const email = (s.email || '').toLowerCase();
            const phone = (s.studentPhone || '');
            return name.includes(term) || email.includes(term) || phone.includes(term);
        });
    }, [students, search]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>📂 Loading student directory...</div>;

    return (
        <div className="panel-container fade-in">
            <h1 className="panel-title">Hostel Resident Directory</h1>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <input 
                        type="text" 
                        placeholder="Search residents..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        style={{ padding: '0.8rem 1rem 0.8rem 2.8rem', width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                    />
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                </div>
                <div style={{ background: '#f1f5f9', padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#475569' }}>
                    Total: {students.length}
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Student</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Campus / Contact</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Guardians</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Accommodation</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>No student records found.</td>
                                </tr>
                            ) : (
                                filteredStudents.map((s, idx) => (
                                    <tr key={s._id} style={{ borderTop: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fcfdfe', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem' }}>
                                                    {(s.name || 'S').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{s.name || 'Unknown Student'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            <div style={{ fontWeight: '500', color: '#475569' }}>{s.studentPhone || 'No Contact'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.campus || 'Main Campus'}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            <div style={{ fontWeight: '500', color: '#475569' }}>{s.parentName || 'N/A'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.parentPhone || 'No emergency number'}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            <span style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', background: s.assignedRoom === 'Unassigned' ? '#fffbeb' : '#f0fdf4', color: s.assignedRoom === 'Unassigned' ? '#b45309' : '#15803d', border: '1px solid currentColor' }}>
                                                {s.assignedRoom === 'Unassigned' ? 'Unassigned' : `Room ${s.assignedRoom}`}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.status === 'active' ? '#22c55e' : '#cbd5e1' }}></div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: s.status === 'active' ? '#1e293b' : '#94a3b8', textTransform: 'capitalize' }}>
                                                    {s.status || 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            {s.status === 'active' && (
                                                <button 
                                                    style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                                    onClick={() => handleDeactivate(s._id)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
                .fade-in { animation: fadeIn 0.5s ease; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default StudentsPanel;
