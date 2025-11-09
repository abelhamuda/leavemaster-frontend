import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../services/api';

const ManagerPanel = ({ user }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      console.log('❌ ManagerPanel: User not available yet');
      setLoading(false);
      return;
    }

    // Check if user actually has permission
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
      console.log('📊 ManagerPanel: Response data:', response.data);
      
      // Pastikan response.data adalah array, jika null gunakan array kosong
      const requests = response.data || [];
      console.log(`📋 ManagerPanel: Setting ${requests.length} pending requests`);
      
      setPendingRequests(requests);
    } catch (error) {
      console.error('❌ ManagerPanel: Error loading pending requests:', error);
      setError('Failed to load pending requests');
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      console.log(`🔄 ManagerPanel: Updating request ${requestId} to ${status}`);
      await leaveAPI.updateStatus(requestId, status);
      alert(`Request ${status} successfully!`);
      loadPendingRequests(); // Reload data setelah update
    } catch (error) {
      console.error('❌ ManagerPanel: Error updating request:', error);
      alert('Error updating request: ' + (error.response?.data?.error || error.message));
    }
  };

  // DEBUG: Log ketika component render
  console.log('🔄 ManagerPanel: Rendering with state:', {
    loading,
    error,
    pendingRequestsCount: pendingRequests.length,
    user: user ? { id: user.id, role: user.role_name } : 'no user'
  });

  // Tampilkan loading state
  if (loading) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3>Pending Leave Requests</h3>
        <p>Loading pending requests...</p>
      </div>
    );
  }

  // Tampilkan message jika user tidak memiliki akses
  if (user && user.role_name === 'employee') {
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3>Access Denied</h3>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  // Tampilkan error state
  if (error) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3>Pending Leave Requests</h3>
        <p style={{ color: 'red' }}>{error}</p>
        <button 
          onClick={loadPendingRequests}
          style={{ padding: '8px 16px', background: '#3498db', color: 'white' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '5px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3>Pending Leave Requests</h3>
      
      {/* DEBUG info */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '10px', 
        marginBottom: '15px',
        borderRadius: '3px',
        fontSize: '12px',
        color: '#666'
      }}>
        Debug: Showing {pendingRequests.length} pending requests
      </div>
      
      {/* Pastikan pendingRequests adalah array sebelum menggunakan .length */}
      {!pendingRequests || pendingRequests.length === 0 ? (
        <div>
          <p>No pending requests.</p>
          <button 
            onClick={loadPendingRequests}
            style={{ 
              padding: '8px 16px', 
              background: '#3498db', 
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Employee</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Type</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Dates</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Days</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Reason</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((request) => (
              <tr key={request.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {request.employee_name || 'Unknown Employee'}
                </td>
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
                  <button 
                    onClick={() => handleStatusUpdate(request.id, 'approved')}
                    style={{ 
                      background: '#2ecc71', 
                      color: 'white', 
                      marginRight: '5px',
                      padding: '5px 10px',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                    style={{ 
                      background: '#e74c3c', 
                      color: 'white',
                      padding: '5px 10px',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManagerPanel;