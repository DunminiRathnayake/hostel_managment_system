import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const StudentsPanel = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axiosInstance.get('/users/students');
                setStudents(res.data);
            } catch (err) {
                console.error("Failed to fetch students");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    if (loading) return <div style={{color:'#64748b'}}>Loading student database...</div>;

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.studentPhone?.includes(search)
    );

    return (
        <div className="panel-container">
            <h1 className="panel-title">All Registered Students</h1>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <input 
                    type="text" 
                    placeholder="Search by name, email, or phone..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    style={{ padding: '0.8rem 1rem', width: '350px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
                <span className="badge badge-purple" style={{fontSize: '1rem'}}>Total Students: {students.length}</span>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold' }}>Name</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold' }}>Email / Campus</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold' }}>Contact</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold' }}>Parents</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold' }}>Assigned Room</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 'bold' }}>Profile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((s, idx) => (
                                <tr key={s._id} style={{ borderTop: '1px solid #e2e8f0', background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                                    
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                {s.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>{s.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <p style={{ margin: 0, color: '#334155', fontWeight: '500' }}>{s.email}</p>
                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{s.campus || 'N/A'}</p>
                                    </td>
                                    
                                    <td style={{ padding: '1.2rem 1.5rem', color: '#475569', fontWeight: '500' }}>
                                        {s.studentPhone || 'N/A'}
                                    </td>

                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <p style={{ margin: 0, color: '#334155', fontWeight: '500' }}>{s.parentName || 'N/A'}</p>
                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{s.parentPhone || 'No mapping'}</p>
                                    </td>
                                    
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <span className={`badge ${s.assignedRoom === 'Unassigned' ? 'badge-yellow' : 'badge-green'}`} style={{ fontWeight: 'bold' }}>
                                            {s.assignedRoom === 'Unassigned' ? 'Pending' : `Room ${s.assignedRoom}`}
                                        </span>
                                    </td>
                                    
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <span className={`badge ${s.status === 'active' ? 'badge-blue' : 'badge-red'}`} style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                            {s.status}
                                        </span>
                                    </td>

                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                        No students found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentsPanel;
