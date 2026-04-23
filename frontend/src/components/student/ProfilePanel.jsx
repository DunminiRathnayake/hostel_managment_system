import { useState, useEffect, useContext } from 'react';
import axiosInstance, { API_BASE_URL } from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const ProfilePanel = () => {
    const { login } = useContext(AuthContext);
    const [profile, setProfile] = useState({ fullName: '', email: '', campus: '', emergencyContactName: '', emergencyPhone: '', studentPhone: '', nicFrontImage: '', nicBackImage: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [nicFrontConfig, setNicFrontConfig] = useState(null);
    const [nicBackConfig, setNicBackConfig] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get('/users/profile');
                setProfile({
                    fullName: res.data.fullName || res.data.name || '',
                    email: res.data.email || '',
                    campus: res.data.campus || '',
                    emergencyContactName: res.data.emergencyContactName || res.data.parentName || '',
                    emergencyPhone: res.data.emergencyPhone || res.data.parentPhone || '',
                    studentPhone: res.data.studentPhone || '',
                    nicFrontImage: res.data.nicFrontImage || res.data.nicFront || '',
                    nicBackImage: res.data.nicBackImage || res.data.nicBack || ''
                });
            } catch (err) { }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();

        // Validations
        const phoneRegex = /^\d{10}$/;
        if (profile.studentPhone && !phoneRegex.test(profile.studentPhone)) {
            return alert('Student Phone number must be exactly 10 digits.');
        }
        if (profile.emergencyPhone && !phoneRegex.test(profile.emergencyPhone)) {
            return alert('Emergency Phone number must be exactly 10 digits.');
        }

        setSaving(true);
        try {
            const formData = new FormData();
            Object.keys(profile).forEach(key => {
                // Avoid rewriting unchanged image strings as "null" files
                if (key !== 'nicFrontImage' && key !== 'nicBackImage') {
                    formData.append(key, profile[key]);
                }
            });
            if (nicFrontConfig) formData.append('nicFront', nicFrontConfig);
            if (nicBackConfig) formData.append('nicBack', nicBackConfig);

            // Let browser set the multipart boundary implicitly by avoiding explicit Content-Type headers
            const res = await axiosInstance.put('/users/profile', formData);
            alert('Done! Profile updated.');
            
            // Update context without erasing the core `role` property
            const token = localStorage.getItem('token');
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...currentUser, name: res.data.fullName || res.data.name }; 
            login(updatedUser, token);
            
            setProfile({
                ...profile,
                nicFrontImage: res.data.nicFrontImage || profile.nicFrontImage,
                nicBackImage: res.data.nicBackImage || profile.nicBackImage
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
                        <input type="text" value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} required />
                    </div>
                    <div className="form-group-alt">
                        <label>Email ID</label>
                        <input type="email" value={profile.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} title="Emails cannot be modified post-registration" />
                    </div>
                    <div className="form-group-alt">
                        <label>Campus</label>
                        <input type="text" value={profile.campus} onChange={e => setProfile({ ...profile, campus: e.target.value })} placeholder="e.g. SLIIT, CINEC" />
                    </div>
                    <div className="form-group-alt">
                        <label>Student Phone</label>
                        <input type="tel" value={profile.studentPhone} onChange={e => setProfile({ ...profile, studentPhone: e.target.value })} placeholder="07XXXXXXXX" />
                    </div>
                    <div className="form-group-alt">
                        <label>Emergency Contact Name</label>
                        <input type="text" value={profile.emergencyContactName} onChange={e => setProfile({ ...profile, emergencyContactName: e.target.value })} placeholder="Parent/Guardian Name" />
                    </div>
                    <div className="form-group-alt">
                        <label>Emergency Phone</label>
                        <input type="tel" value={profile.emergencyPhone} onChange={e => setProfile({ ...profile, emergencyPhone: e.target.value })} placeholder="07XXXXXXXX" />
                    </div>

                    <div className="form-group-alt" style={{ marginTop: '1rem' }}>
                        <label>NIC Front Image</label>
                        {profile.nicFrontImage && <img src={`${API_BASE_URL}${profile.nicFrontImage}`} alt="NIC Front" style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '0.5rem' }} />}
                        <input type="file" accept="image/*" onChange={e => setNicFrontConfig(e.target.files[0])} />
                    </div>
                    <div className="form-group-alt">
                        <label>NIC Back Image</label>
                        {profile.nicBackImage && <img src={`${API_BASE_URL}${profile.nicBackImage}`} alt="NIC Back" style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '0.5rem' }} />}
                        <input type="file" accept="image/*" onChange={e => setNicBackConfig(e.target.files[0])} />
                    </div>
                    
                    <button type="submit" disabled={saving} className="action-btn" style={{ marginTop: '1.5rem', padding: '1rem', background: '#8b5cf6' }}>
                        {saving ? 'Saving changes...' : 'Save Profile Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default ProfilePanel;
