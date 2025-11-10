import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Send,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { leaveAPI } from '../services/api';

const LeaveRequest = ({ onRequestCreated }) => {
  const [formData, setFormData] = useState({
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = endDate - startDate;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  };

  const validateForm = () => {
    const newErrors = {};
    const totalDays = calculateDays(formData.start_date, formData.end_date);

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && totalDays <= 0) {
      newErrors.end_date = 'End date must be after start date';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const totalDays = calculateDays(formData.start_date, formData.end_date);

    try {
      setLoading(true);
      await leaveAPI.create({
        ...formData,
        total_days: totalDays
      });
      
      setShowSuccess(true);
      setFormData({
        leave_type: 'annual',
        start_date: '',
        end_date: '',
        reason: ''
      });
      setErrors({});
      
      setTimeout(() => {
        setShowSuccess(false);
        onRequestCreated();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting request:', error);
      setErrors({ 
        submit: error.response?.data?.error || error.message || 'Failed to submit request' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear date errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const totalDays = calculateDays(formData.start_date, formData.end_date);
  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave', color: 'blue' },
    { value: 'sick', label: 'Sick Leave', color: 'green' },
    { value: 'personal', label: 'Personal Leave', color: 'purple' },
    { value: 'other', label: 'Other', color: 'gray' }
  ];

  const getLeaveTypeColor = (type) => {
    const colorMap = {
      annual: 'blue',
      sick: 'green',
      personal: 'purple',
      other: 'gray'
    };
    return colorMap[type] || 'gray';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Request Leave</h2>
          <p className="text-gray-600 mt-1">Submit a new leave application</p>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-green-800 font-medium">Leave request submitted successfully!</p>
                <p className="text-green-700 text-sm mt-1">Your request has been sent for approval.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Leave Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Leave Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {leaveTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, leave_type: type.value }))}
                className={`p-3 border-2 rounded-xl text-center transition-all duration-200 ${
                  formData.leave_type === type.value
                    ? `border-${type.color}-500 bg-${type.color}-50 shadow-sm`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-8 h-8 bg-${type.color}-100 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <FileText className={`w-4 h-4 text-${type.color}-600`} />
                </div>
                <span className={`text-sm font-medium ${
                  formData.leave_type === type.value ? `text-${type.color}-700` : 'text-gray-700'
                }`}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleDateChange('start_date', e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.start_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.start_date}
              </p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              End Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleDateChange('end_date', e.target.value)}
                required
                min={formData.start_date || new Date().toISOString().split('T')[0]}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.end_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.end_date}
              </p>
            )}
          </div>
        </div>

        {/* Duration Display */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalDays} day{totalDays !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {totalDays > 0 && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${getLeaveTypeColor(formData.leave_type)}-100 text-${getLeaveTypeColor(formData.leave_type)}-800`}>
                {leaveTypes.find(t => t.value === formData.leave_type)?.label}
              </div>
            )}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Reason for Leave
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, reason: e.target.value }));
              if (errors.reason) {
                setErrors(prev => ({ ...prev, reason: '' }));
              }
            }}
            required
            rows={4}
            placeholder="Please provide a reason for your leave request..."
            className={`block w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
              errors.reason ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.reason}
            </p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Leave Request
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default LeaveRequest;