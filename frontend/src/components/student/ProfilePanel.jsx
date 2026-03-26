import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const ProfilePanel = () => {
    const { login } = useContext(AuthContext);
    const [profile, setProfile] = useState({ name: '', email: '', campus: '', parentName: '', parentPhone: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get('/users/profile');
                setProfile({ 
                    name: res.data.name || '', 
                    email: res.data.email || '', 
                    campus: res.data.campus || '', 
                    parentName: res.data.parentName || '', 
                    parentPhone: res.data.parentPhone || '' 
                });
            } catch (err) { } 
            finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axiosInstance.put('/users/profile', profile);
            alert('Done! Profile updated.');
            // Update context 
            const token = localStorage.getItem('token');
            login(res.data, token);
        } catch (err) { alert('Failed to update profile'); } 
        finally { setSaving(false); }
    };

    if (loading) return <div style={{color:'#64748b'}}>Retrieving encrypted student file...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">My Profile</h1>
            <div className="form-card" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleUpdate} style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
                    <div className="form-group-alt">
                        <label>Full Name</label>
                        <input type="text" value={profile.name} onChange={e=>setProfile({...profile, name: e.target.value})} required />
                    </div>
                    <div className="form-group-alt">
                        <label>Email</label>
                        <input type="email" value={profile.email} disabled style={{opacity:0.6}} />
                    </div>
                    <div className="form-group-alt">
                        <label>Campus</label>
                        <input type="text" value={profile.campus} onChange={e=>setProfile({...profile, campus: e.target.value})} placeholder="e.g. South Block" />
                    </div>
                    <div className="form-group-alt">
                        <label>Emergency Contact Name</label>
                        <input type="text" value={profile.parentName} onChange={e=>setProfile({...profile, parentName: e.target.value})} placeholder="Parent's Name" />
                    </div>
                    <div className="form-group-alt">
                        <label>Emergency Phone</label>
                        <input type="text" value={profile.parentPhone} onChange={e=>setProfile({...profile, parentPhone: e.target.value})} placeholder="+94 XXXXXXXX" />
                    </div>
                    <button type="submit" disabled={saving} className="action-btn" style={{marginTop:'1.5rem', padding:'1rem', background: '#8b5cf6'}}>
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default ProfilePanel;
