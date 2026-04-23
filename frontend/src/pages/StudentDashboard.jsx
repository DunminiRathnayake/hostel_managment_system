import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfilePanel from '../components/student/ProfilePanel';
import StudentPaymentsPanel from '../components/student/StudentPaymentsPanel';
import StudentComplaintsPanel from '../components/student/StudentComplaintsPanel';
import StudentCheckInsPanel from '../components/student/StudentCheckInsPanel';
import StudentQRPanel from '../components/student/StudentQRPanel';
import StudentCleaningPanel from '../components/student/StudentCleaningPanel';
import StudentOverviewPanel from '../components/student/StudentOverviewPanel';
import StudentReviewPanel from '../components/student/StudentReviewPanel';
import StudentVisitorPanel from '../components/student/StudentVisitorPanel';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const { logout, user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <StudentOverviewPanel setActiveTab={setActiveTab} />;
            case 'room': return <ProfilePanel />;
            case 'payments': return <StudentPaymentsPanel />;
            case 'complaints': return <StudentComplaintsPanel />;
            case 'cleaning': return <StudentCleaningPanel />;
            case 'qrcode': return <StudentQRPanel />;
            case 'visitors': return <StudentVisitorPanel />;
            case 'rate': return <StudentReviewPanel />;
            default: return <StudentOverviewPanel setActiveTab={setActiveTab} />;
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
                    <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
                    <button className={activeTab === 'room' ? 'active' : ''} onClick={() => setActiveTab('room')}>My Profile</button>
                    <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>Payments</button>
                    <button className={activeTab === 'complaints' ? 'active' : ''} onClick={() => setActiveTab('complaints')}>Complaints</button>
                    <button className={activeTab === 'cleaning' ? 'active' : ''} onClick={() => setActiveTab('cleaning')}>Cleaning</button>
                    <button className={activeTab === 'qrcode' ? 'active' : ''} onClick={() => setActiveTab('qrcode')}>QR Code</button>
                    <button className={activeTab === 'visitors' ? 'active' : ''} onClick={() => setActiveTab('visitors')}>Visitors</button>
                    <button className={activeTab === 'rate' ? 'active' : ''} onClick={() => setActiveTab('rate')}>Rate Hostel</button>
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
