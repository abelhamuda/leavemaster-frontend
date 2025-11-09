import React, { useState } from 'react';
import { leaveAPI } from '../services/api';

const LeaveRequest = ({ onRequestCreated }) => {
  const [formData, setFormData] = useState({
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = endDate - startDate;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const totalDays = calculateDays(formData.start_date, formData.end_date);
    if (totalDays <= 0) {
      alert('End date must be after start date');
      return;
    }

    try {
      await leaveAPI.create({
        ...formData,
        total_days: totalDays
      });
      alert('Leave request submitted successfully!');
      setFormData({
        leave_type: 'annual',
        start_date: '',
        end_date: '',
        reason: ''
      });
      onRequestCreated();
    } catch (error) {
      alert('Error submitting request: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '5px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3>Request Leave</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Leave Type:</label>
          <select
            value={formData.leave_type}
            onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Start Date:</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => {
              const newFormData = {...formData, start_date: e.target.value};
              setFormData(newFormData);
            }}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>End Date:</label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => {
              const newFormData = {...formData, end_date: e.target.value};
              setFormData(newFormData);
            }}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Total Days: {calculateDays(formData.start_date, formData.end_date)}</label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Reason:</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            required
            style={{ width: '100%', padding: '8px', minHeight: '80px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px', background: '#3498db', color: 'white' }}>
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default LeaveRequest;