import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SummaryOverview from '../components/warden/SummaryOverview';
import StudentsPanel from '../components/warden/StudentsPanel';
import RoomsPanel from '../components/warden/RoomsPanel';
import PaymentsPanel from '../components/warden/PaymentsPanel';
import ComplaintsPanel from '../components/warden/ComplaintsPanel';
import BookingsPanel from '../components/warden/BookingsPanel';
import CheckInsPanel from '../components/warden/CheckInsPanel';
import GalleryPanel from '../components/warden/GalleryPanel';
import CleaningPanel from '../components/warden/CleaningPanel';
import ReviewsPanel from '../components/warden/ReviewsPanel';
import './WardenDashboard.css';

const WardenDashboard = () => {
    const { logout, user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsSidebarOpen(false);
        navigate('/');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <SummaryOverview />;
            case 'students': return <StudentsPanel />;
            case 'rooms': return <RoomsPanel />;
            case 'payments': return <PaymentsPanel />;
            case 'complaints': return <ComplaintsPanel />;
            case 'bookings': return <BookingsPanel />;
            case 'checkins': return <CheckInsPanel />;
            case 'gallery': return <GalleryPanel />;
            case 'cleaning': return <CleaningPanel />;
            case 'reviews': return <ReviewsPanel />;
            default: return <SummaryOverview />;
        }
    };

    return (
        <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Sidebar Backdrop Overlay for Mobile */}
            <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>

            {/* Mobile Header */}
            <header className="mobile-header">
                <h2 className="mobile-brand-title">🏢 Staytra</h2>
                <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle Menu">
                    {isSidebarOpen ? '✕' : '☰'}
                </button>
            </header>

            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Warden Dashboard</h2>
                    <p className="user-badge">{user?.name} (Warden)</p>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}>📊 Dashboard</button>
                    <button className={activeTab === 'students' ? 'active' : ''} onClick={() => { setActiveTab('students'); setIsSidebarOpen(false); }}>👨‍🎓 Students</button>
                    <button className={activeTab === 'rooms' ? 'active' : ''} onClick={() => { setActiveTab('rooms'); setIsSidebarOpen(false); }}>🏢 Rooms</button>
                    <button className={activeTab === 'cleaning' ? 'active' : ''} onClick={() => { setActiveTab('cleaning'); setIsSidebarOpen(false); }}>🧹 Cleaning</button>
                    <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }}>💰 Payments</button>
                    <button className={activeTab === 'complaints' ? 'active' : ''} onClick={() => { setActiveTab('complaints'); setIsSidebarOpen(false); }}>📢 Complaints</button>
                    <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }}>🎟️ Visitor Bookings</button>
                    <button className={activeTab === 'checkins' ? 'active' : ''} onClick={() => { setActiveTab('checkins'); setIsSidebarOpen(false); }}>🤳 Check-ins</button>
                    <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => { setActiveTab('gallery'); setIsSidebarOpen(false); }}>🖼️ Gallery Setup</button>
                    <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => { setActiveTab('reviews'); setIsSidebarOpen(false); }}>⭐ Student Reviews</button>
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

export default WardenDashboard;
