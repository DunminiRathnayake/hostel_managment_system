import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfilePanel from '../components/student/ProfilePanel';
import StudentPaymentsPanel from '../components/student/StudentPaymentsPanel';
import StudentComplaintsPanel from '../components/student/StudentComplaintsPanel';
import StudentCheckInsPanel from '../components/student/StudentCheckInsPanel';
import StudentQRPanel from '../components/student/StudentQRPanel';
import StudentCleaningPanel from '../components/student/StudentCleaningPanel';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const { logout, user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfilePanel />;
            case 'payments': return <StudentPaymentsPanel />;
            case 'complaints': return <StudentComplaintsPanel />;
            case 'qrcode': return <StudentQRPanel />;
            case 'checkins': return <StudentCheckInsPanel />;
            case 'cleaning': return <StudentCleaningPanel />;
            default: return <ProfilePanel />;
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar student-sidebar">
                <div className="sidebar-header">
                    <h2>Student Dashboard</h2>
                    <p className="user-badge">{user?.name}</p>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>My Profile</button>
                    <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>My Payments</button>
                    <button className={activeTab === 'qrcode' ? 'active' : ''} onClick={() => setActiveTab('qrcode')}>My QR Code</button>
                    <button className={activeTab === 'complaints' ? 'active' : ''} onClick={() => setActiveTab('complaints')}>Complaints</button>
                    <button className={activeTab === 'checkins' ? 'active' : ''} onClick={() => setActiveTab('checkins')}>Check-in History</button>
                    <button className={activeTab === 'cleaning' ? 'active' : ''} onClick={() => setActiveTab('cleaning')}>Cleaning Schedule</button>
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </aside>
            <main className="dashboard-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default StudentDashboard;
