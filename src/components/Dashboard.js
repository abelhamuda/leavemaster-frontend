import React from 'react';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div>
      <header style={{ 
        background: '#2c3e50', 
        color: 'white', 
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1>LeaveMaster</h1>
        <div>
          <span>Welcome, {user.name} ({user.is_manager ? 'Manager' : 'Employee'})</span>
          <button 
            onClick={onLogout}
            style={{ marginLeft: '15px', padding: '5px 10px' }}
          >
            Logout
          </button>
        </div>
      </header>
      
      <div style={{ padding: '20px' }}>
        <div style={{ 
          background: '#ecf0f1', 
          padding: '20px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3>Leave Balance</h3>
          <p>Total Days: {user.total_leave_days}</p>
          <p>Remaining: {user.remaining_leave_days}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;