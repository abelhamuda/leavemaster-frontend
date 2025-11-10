import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  FileText, 
  Calendar, 
  BarChart3, 
  Users, 
  Shield,
  Menu,
  X
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
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

  // const canViewTeamCalendar = () => {
  //   return user?.role_name === 'manager' || user?.role_name === 'admin' || user?.role_name === 'super_admin';
  // };

  const navigationItems = [
    {
      id: 'requests',
      label: 'Leave Requests',
      icon: FileText,
      available: true,
      description: 'Manage leave applications'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      available: true,
      description: 'View leave calendar'
    },
    {
      id: 'dashboard',
      label: 'Analytics',
      icon: BarChart3,
      available: canAccessAnalytics(),
      description: 'Reports and insights'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      available: canAccessUserManagement(),
      description: 'Manage team members'
    }
  ];

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard user={user} onLogout={handleLogout} />
      <WebSocketNotification />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white shadow-sm border border-gray-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:w-80 flex-shrink-0 ${
              mobileMenuOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColorClasses(user.role_name)}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role_name?.toUpperCase() || 'EMPLOYEE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  item.available && (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-blue-50 border border-blue-200 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activeTab === item.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </button>
                  )
                ))}
              </nav>

              {/* Logout Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Leave Requests Tab */}
                {activeTab === 'requests' && (
                  <div className="space-y-6">
                    <LeaveRequest onRequestCreated={handleRequestCreated} />
                    {canApproveLeaves() && <ManagerPanel user={user} />}
                    <LeaveList refresh={refresh} />
                  </div>
                )}

                {/* Calendar Tab */}
                {activeTab === 'calendar' && (
                  <CalendarView user={user} />
                )}

                {/* Analytics Tab */}
                {activeTab === 'dashboard' && canAccessAnalytics() && (
                  <AdvancedDashboard user={user} />
                )}

                {/* User Management Tab */}
                {activeTab === 'users' && canAccessUserManagement() && (
                  <UserManagement user={user} />
                )}

                {/* Access Denied */}
                  {((activeTab === 'dashboard' && !canAccessAnalytics()) || 
                  (activeTab === 'users' && !canAccessUserManagement())) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center"
                  >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-4">
                      You don't have permission to access this feature.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Required role: {activeTab === 'dashboard' 
                        ? 'Manager, Admin, or Super Admin' 
                        : 'Admin or Super Admin'
                      }
                    </p>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Go to Leave Requests
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

// Helper function untuk role colors
const getRoleColorClasses = (roleName) => {
  switch (roleName) {
    case 'super_admin':
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'admin':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'manager':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'employee':
      return 'bg-green-100 text-green-800 border border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

export default App;