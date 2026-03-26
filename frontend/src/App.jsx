import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import WardenDashboard from './pages/WardenDashboard';
import StudentDashboard from './pages/StudentDashboard';
import VisitorDashboard from './pages/VisitorDashboard';
import Scanner from './pages/Scanner';
import ProtectedRoute from './routes/ProtectedRoute';
import Landing from './pages/Landing';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/gallery" element={<Gallery />} />
            
            <Route 
              path="/home" 
              element={
                <ProtectedRoute allowedRoles={["warden", "student", "visitor"]}>
                  <Home />
                </ProtectedRoute>
              } 
            />
        
        <Route 
          path="/warden" 
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <WardenDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/visitor" 
          element={<VisitorDashboard />} 
        />
        
        {/* Kiosk Hardware Endpoint natively detached explicitly from internal dependencies */}
        <Route 
          path="/scanner" 
          element={<Scanner />} 
        />
      </Routes>
      </div>
     </div>
    </Router>
  );
}

export default App;
