import { useState, useEffect, useContext } from 'react';
import axiosInstance, { API_BASE_URL } from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const ProfilePanel = () => {
    const { login } = useContext(AuthContext);
    const [profile, setProfile] = useState({ name: '', email: '', campus: '', parentName: '', parentPhone: '', studentPhone: '', nicFront: '', nicBack: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [nicFrontConfig, setNicFrontConfig] = useState(null);
    const [nicBackConfig, setNicBackConfig] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get('/users/profile');
                setProfile({
                    name: res.data.name || '',
                    email: res.data.email || '',
                    campus: res.data.campus || '',
                    parentName: res.data.parentName || '',
                    parentPhone: res.data.parentPhone || '',
                    studentPhone: res.data.studentPhone || '',
                    nicFront: res.data.nicFront || '',
                    nicBack: res.data.nicBack || ''
                });
            } catch (err) { }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();

        // Validations
        const phoneRegex = /^[0-9]{10}$/;
        if (profile.studentPhone && !phoneRegex.test(profile.studentPhone.replace(/[^0-9]/g, ''))) {
            return alert('Please enter a valid 10-digit Student Phone number.');
        }
        if (profile.parentPhone && !phoneRegex.test(profile.parentPhone.replace(/[^0-9]/g, ''))) {
            return alert('Please enter a valid 10-digit Emergency Phone number.');
        }

        if (!profile.nicFront && !nicFrontConfig) {
            return alert('NIC Front Image is required.');
        }
        if (!profile.nicBack && !nicBackConfig) {
            return alert('NIC Back Image is required.');
        }

        setSaving(true);
        try {
            const formData = new FormData();
            Object.keys(profile).forEach(key => {
                // Avoid rewriting unchanged image strings as "null" files
                if (key !== 'nicFront' && key !== 'nicBack') {
                    formData.append(key, profile[key]);
                }
            });
            if (nicFrontConfig) formData.append('nicFront', nicFrontConfig);
            if (nicBackConfig) formData.append('nicBack', nicBackConfig);

            const res = await axiosInstance.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Done! Profile updated.');
            // Update context without erasing the core `role` property needed natively for Dashboard routing organically
            const token = localStorage.getItem('token');
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...currentUser, name: profile.name }; // Safely merge natively seamlessly 
            login(updatedUser, token);
            
            setProfile({
                ...profile,
                nicFront: res.data.nicFront || profile.nicFront,
                nicBack: res.data.nicBack || profile.nicBack
            });
        } catch (err) { alert('Failed to update profile'); }
        finally { setSaving(false); }
    };

    if (loading) return <div style={{ color: '#64748b' }}>Retrieving encrypted student file...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">My Profile</h1>
            <div className="form-card" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div className="form-group-alt">
                        <label>Full Name</label>
                        <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required />
                    </div>
                    <div className="form-group-alt">
                        <label>Email</label>
                        <input type="email" value={profile.email} disabled style={{ opacity: 0.6 }} />
                    </div>
                    <div className="form-group-alt">
                        <label>Campus</label>
                        <input type="text" value={profile.campus} onChange={e => setProfile({ ...profile, campus: e.target.value })} placeholder="e.g. SLIIT,CINEC" />
                    </div>
                    <div className="form-group-alt">
                        <label>Student Phone</label>
                        <input type="text" value={profile.studentPhone} onChange={e => setProfile({ ...profile, studentPhone: e.target.value })} placeholder=" 07XXXXXXXX" />
                    </div>
                    <div className="form-group-alt">
                        <label>Emergency Contact Name</label>
                        <input type="text" value={profile.parentName} onChange={e => setProfile({ ...profile, parentName: e.target.value })} placeholder="Parent's Name" />
                    </div>
                    <div className="form-group-alt">
                        <label>Emergency Phone</label>
                        <input type="text" value={profile.parentPhone} onChange={e => setProfile({ ...profile, parentPhone: e.target.value })} placeholder="07XXXXXXXX" />
                    </div>

                    <div className="form-group-alt" style={{ marginTop: '1rem' }}>
                        <label>NIC Front Image</label>
                        {profile.nicFront && <img src={`${API_BASE_URL}${profile.nicFront}`} alt="NIC Front" style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '0.5rem' }} />}
                        <input type="file" accept="image/*" onChange={e => setNicFrontConfig(e.target.files[0])} />
                    </div>
                    <div className="form-group-alt">
                        <label>NIC Back Image</label>
                        {profile.nicBack && <img src={`${API_BASE_URL}${profile.nicBack}`} alt="NIC Back" style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '0.5rem' }} />}
                        <input type="file" accept="image/*" onChange={e => setNicBackConfig(e.target.files[0])} />
                    </div>
                    <button type="submit" disabled={saving} className="action-btn" style={{ marginTop: '1.5rem', padding: '1rem', background: '#8b5cf6' }}>
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default ProfilePanel;
