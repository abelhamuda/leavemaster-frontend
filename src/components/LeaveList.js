import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../services/api';

const LeaveList = ({ refresh }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaveRequests();
  }, [refresh]);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getMyRequests();
      // Pastikan response.data adalah array
      setLeaveRequests(response.data || []);
    } catch (error) {
      console.error('Error loading leave requests:', error);
      setLeaveRequests([]); // Set ke array kosong jika error
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#2ecc71';
      case 'rejected': return '#e74c3c';
      case 'pending': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>My Leave Requests</h3>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '5px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3>My Leave Requests</h3>
      {!leaveRequests || leaveRequests.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Type</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Dates</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Days</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Reason</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => (
              <tr key={request.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {request.leave_type || 'N/A'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {request.start_date} to {request.end_date}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {request.total_days || 0}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {request.reason || 'No reason provided'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <span style={{ 
                    color: getStatusColor(request.status),
                    fontWeight: 'bold'
                  }}>
                    {request.status ? request.status.toUpperCase() : 'UNKNOWN'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaveList;