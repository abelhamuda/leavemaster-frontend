import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download
} from 'lucide-react';
import { leaveAPI } from '../services/api';

const LeaveList = ({ refresh }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaveRequests();
  }, [refresh]);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leaveAPI.getMyRequests();
      setLeaveRequests(response.data || []);
    } catch (error) {
      console.error('Error loading leave requests:', error);
      setError('Failed to load leave requests');
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      approved: {
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle2,
        label: 'Approved'
      },
      rejected: {
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: XCircle,
        label: 'Rejected'
      },
      pending: {
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        icon: Clock,
        label: 'Pending'
      }
    };
    
    return configs[status] || {
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: HelpCircle,
      label: 'Unknown'
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const exportToCSV = () => {
    const headers = ['Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status'];
    const csvData = leaveRequests.map(request => [
      request.leave_type || 'N/A',
      request.start_date,
      request.end_date,
      request.total_days || 0,
      request.reason || 'No reason provided',
      request.status?.toUpperCase() || 'UNKNOWN'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leave-requests-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
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
            <h2 className="text-2xl font-bold text-gray-900">My Leave Requests</h2>
            <p className="text-gray-600 mt-1">History of your leave applications</p>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
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
          <h2 className="text-2xl font-bold text-gray-900">My Leave Requests</h2>
          <p className="text-gray-600 mt-1">History of your leave applications</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {leaveRequests.length > 0 && (
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          )}
          <button
            onClick={loadLeaveRequests}
            className="inline-flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={loadLeaveRequests}
                className="text-red-700 hover:text-red-800 text-sm font-medium mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence>
        {leaveRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Leave Requests</h3>
            <p className="text-gray-600 mb-6">You haven't submitted any leave requests yet.</p>
            <p className="text-sm text-gray-500">
              Start by submitting a new leave request from the form above.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {leaveRequests.map((request, index) => {
              const statusConfig = getStatusConfig(request.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Request Details */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4 lg:mb-0">
                      {/* Leave Type */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">
                            {request.leave_type?.toLowerCase() || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">Type</p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatDate(request.start_date)}
                          </p>
                          <p className="text-sm text-gray-500">
                            to {formatDate(request.end_date)}
                          </p>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {request.total_days || 0} day{request.total_days !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-gray-500">Duration</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${statusConfig.bgColor} rounded-xl flex items-center justify-center`}>
                          <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border`}>
                            {statusConfig.label}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">Status</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  {request.reason && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">Reason:</span>{' '}
                        {request.reason}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {leaveRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-6 border-t border-gray-200"
        >
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <span>Total Requests: <strong>{leaveRequests.length}</strong></span>
              <span>
                Approved: <strong>{leaveRequests.filter(r => r.status === 'approved').length}</strong>
              </span>
              <span>
                Pending: <strong>{leaveRequests.filter(r => r.status === 'pending').length}</strong>
              </span>
              <span>
                Rejected: <strong>{leaveRequests.filter(r => r.status === 'rejected').length}</strong>
              </span>
            </div>
            <div className="mt-2 sm:mt-0">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center text-gray-700 hover:text-gray-900 font-medium"
              >
                <Download className="w-4 h-4 mr-1" />
                Export All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LeaveList;