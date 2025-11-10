import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  Calendar, 
  Clock,
  FileText,
  Shield
} from 'lucide-react';
import { leaveAPI } from '../services/api';

const ManagerPanel = ({ user }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!user) {
      console.log('❌ ManagerPanel: User not available yet');
      setLoading(false);
      return;
    }

    if (user.role_name === 'employee') {
      console.log('❌ ManagerPanel: Access denied - employee role');
      setLoading(false);
      return;
    }

    console.log('✅ ManagerPanel: Loading pending requests for manager');
    loadPendingRequests();
  }, [user]);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 ManagerPanel: Calling leaveAPI.getPending()');
      
      const response = await leaveAPI.getPending();
      
      console.log('📦 ManagerPanel: API Response:', response);
      
      const requests = response.data || [];
      console.log(`📋 ManagerPanel: Setting ${requests.length} pending requests`);
      
      setPendingRequests(requests);
    } catch (error) {
      console.error('❌ ManagerPanel: Error loading pending requests:', error);
      setError('Failed to load pending requests. Please try again.');
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      setUpdatingId(requestId);
      console.log(`🔄 ManagerPanel: Updating request ${requestId} to ${status}`);
      await leaveAPI.updateStatus(requestId, status);
      
      // Optimistic update
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Show success message
      const statusText = status === 'approved' ? 'approved' : 'rejected';
      showToast(`Request ${statusText} successfully!`, 'success');
      
    } catch (error) {
      console.error('❌ ManagerPanel: Error updating request:', error);
      showToast('Error updating request: ' + (error.response?.data?.error || error.message), 'error');
      // Reload to sync with server
      loadPendingRequests();
    } finally {
      setUpdatingId(null);
    }
  };

  const showToast = (message, type = 'info') => {
    // Simple toast implementation - bisa diganti dengan toast library
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
      type === 'success' 
        ? 'bg-green-50 border-green-500 text-green-800' 
        : 'bg-red-50 border-red-500 text-red-800'
    }`;
    toast.innerHTML = `
      <div class="flex items-center">
        <${type === 'success' ? 'CheckCircle' : 'XCircle'} class="w-5 h-5 mr-2" />
        <span class="font-medium">${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  // Loading State
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
            <p className="text-gray-600 mt-1">Leave requests awaiting your approval</p>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Access Denied
  if (user && user.role_name === 'employee') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600 mb-4">You don't have permission to access the manager panel.</p>
        <p className="text-sm text-gray-500">Please contact your administrator if you believe this is an error.</p>
      </motion.div>
    );
  }

  // Error State
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
            <p className="text-gray-600 mt-1">Leave requests awaiting your approval</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Requests</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadPendingRequests}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
          <p className="text-gray-600 mt-1">Leave requests awaiting your approval</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingRequests.length} pending
          </div>
          <button
            onClick={loadPendingRequests}
            className="inline-flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Requests List */}
      <AnimatePresence>
        {pendingRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600 mb-6">No pending leave requests at the moment.</p>
            <button
              onClick={loadPendingRequests}
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Again
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                exit={{ opacity: 0, x: 20 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Request Info */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 lg:mb-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.employee_name || 'Unknown Employee'}
                        </p>
                        <p className="text-sm text-gray-500">Employee</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {request.leave_type?.toLowerCase() || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">Type</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.start_date} to {request.end_date}
                        </p>
                        <p className="text-sm text-gray-500">Dates</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.total_days || 0} days
                        </p>
                        <p className="text-sm text-gray-500">Duration</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:flex-col lg:space-y-2 lg:space-x-0 xl:flex-row xl:space-y-0 xl:space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'approved')}
                      disabled={updatingId === request.id}
                      className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {updatingId === request.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'rejected')}
                      disabled={updatingId === request.id}
                      className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {updatingId === request.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Reason */}
                {request.reason && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Reason:</span> {request.reason}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Debug Info - Hidden in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600 font-mono">
            Debug: {pendingRequests.length} requests • User: {user?.role_name}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ManagerPanel;