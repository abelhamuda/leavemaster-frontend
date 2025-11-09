import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LeaveRequest from './components/LeaveRequest';
import LeaveList from './components/LeaveList';
import ManagerPanel from './components/ManagerPanel';
import CalendarView from './components/CalendarView';
import AdvancedDashboard from './components/AdvancedDashboard';
import UserManagement from './components/UserManagement';
import WebSocketNotification from './components/WebSocketNotification';

function App() {
  const [user, setUser] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleRequestCreated = () => {
    setRefresh(prev => prev + 1);
  };

  // Helper functions untuk check permissions
  const canAccessUserManagement = () => {
    return user?.role_name === 'admin' || user?.role_name === 'super_admin';
  };

  const canAccessAnalytics = () => {
    return user?.role_name === 'manager' || user?.role_name === 'admin' || user?.role_name === 'super_admin';
  };

  const canApproveLeaves = () => {
    return user?.role_name === 'manager' || user?.role_name === 'admin' || user?.role_name === 'super_admin';
  };

  const canViewTeamCalendar = () => {
    return user?.role_name === 'manager' || user?.role_name === 'admin' || user?.role_name === 'super_admin';
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ background: '#ecf0f1', minHeight: '100vh' }}>
      <Dashboard user={user} onLogout={handleLogout} />
      <WebSocketNotification />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation Tabs dengan Role-based Access */}
        <div style={{ 
          marginBottom: '20px',
          background: 'white',
          borderRadius: '5px',
          padding: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Leave Requests - Available untuk semua */}
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                padding: '10px 20px',
                background: activeTab === 'requests' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'requests' ? 'white' : '#2c3e50',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              📋 Leave Requests
            </button>

            {/* Calendar - Available untuk semua */}
            <button
              onClick={() => setActiveTab('calendar')}
              style={{
                padding: '10px 20px',
                background: activeTab === 'calendar' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'calendar' ? 'white' : '#2c3e50',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              📅 Calendar
            </button>

            {/* Analytics - Hanya untuk Manager, Admin, Super Admin */}
            {canAccessAnalytics() && (
              <button
                onClick={() => setActiveTab('dashboard')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'dashboard' ? '#3498db' : '#ecf0f1',
                  color: activeTab === 'dashboard' ? 'white' : '#2c3e50',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                📊 Analytics
              </button>
            )}

            {/* User Management - Hanya untuk Admin & Super Admin */}
            {canAccessUserManagement() && (
              <button
                onClick={() => setActiveTab('users')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'users' ? '#3498db' : '#ecf0f1',
                  color: activeTab === 'users' ? 'white' : '#2c3e50',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                👥 User Management
              </button>
            )}

            {/* Role Badge */}
            <div style={{ 
              marginLeft: 'auto',
              padding: '8px 16px',
              background: getRoleColor(user.role_name),
              color: 'white',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {user.role_name?.toUpperCase() || 'EMPLOYEE'}
            </div>
          </div>
        </div>

        {/* Content based on active tab dan permissions */}
        {activeTab === 'requests' && (
          <>
            <LeaveRequest onRequestCreated={handleRequestCreated} />
            {canApproveLeaves() && <ManagerPanel user={user} />}
            <LeaveList refresh={refresh} />
          </>
        )}

        {activeTab === 'calendar' && (
          <CalendarView user={user} />
        )}

        {activeTab === 'dashboard' && canAccessAnalytics() && (
          <AdvancedDashboard user={user} />
        )}

        {activeTab === 'users' && canAccessUserManagement() && (
          <UserManagement user={user} />
        )}

        {/* Access Denied Message */}
        {(activeTab === 'dashboard' && !canAccessAnalytics()) || 
         (activeTab === 'users' && !canAccessUserManagement()) && (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '10px',
            textAlign: 'center',
            color: '#e74c3c'
          }}>
            <h2>🚫 Access Denied</h2>
            <p>You don't have permission to access this feature.</p>
            <p>Required role: {activeTab === 'dashboard' ? 'Manager, Admin, or Super Admin' : 'Admin or Super Admin'}</p>
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                background: '#3498db',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '15px'
              }}
            >
              Go to Leave Requests
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// Helper function untuk role colors
const getRoleColor = (roleName) => {
  switch (roleName) {
    case 'super_admin': return '#e74c3c';
    case 'admin': return '#3498db';
    case 'manager': return '#f39c12';
    case 'employee': return '#2ecc71';
    default: return '#95a5a6';
  }
};

export default App;