import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../services/api';

const DashboardReports = ({ user }) => {
  const [stats, setStats] = useState({});
  const [departmentStats, setDepartmentStats] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [statsRes, deptRes, trendsRes] = await Promise.all([
        leaveAPI.get('/reports/dashboard-stats'),
        leaveAPI.get('/reports/department-stats'),
        leaveAPI.get('/reports/monthly-trends')
      ]);

      setStats(statsRes.data);
      setDepartmentStats(deptRes.data);
      setMonthlyTrends(trendsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await leaveAPI.get('/reports/export');
      
      // Create and download CSV file
      const csvContent = convertToCSV(response.data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leave-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3>Dashboard Reports</h3>
        <p>Loading dashboard data...</p>
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3>📊 Analytics Dashboard</h3>
        <button 
          onClick={exportReport}
          style={{
            padding: '8px 16px',
            background: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📥 Export Report
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <StatCard 
          title="Total Employees" 
          value={stats.total_employees} 
          color="#3498db"
          icon="👥"
        />
        <StatCard 
          title="Pending Requests" 
          value={stats.pending_requests} 
          color="#f39c12"
          icon="⏳"
        />
        <StatCard 
          title="Approved This Month" 
          value={stats.approved_this_month} 
          color="#2ecc71"
          icon="✅"
        />
        <StatCard 
          title="Leave Utilization" 
          value={`${stats.leave_utilization?.toFixed(1) || 0}%`} 
          color="#9b59b6"
          icon="📈"
        />
      </div>

      {/* Department Statistics */}
      <div style={{ marginBottom: '30px' }}>
        <h4>Department Overview</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Department</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Employees</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Leaves</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Avg Days</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Utilization</th>
            </tr>
          </thead>
          <tbody>
            {departmentStats.map((dept, index) => (
              <tr key={index}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{dept.department}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{dept.total_employees}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{dept.total_leaves}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{dept.avg_leave_days?.toFixed(1)}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {dept.utilization_rate?.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly Trends */}
      <div>
        <h4>Monthly Trends</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '10px'
        }}>
          {monthlyTrends.map((trend, index) => (
            <div key={index} style={{
              background: '#ecf0f1',
              padding: '15px',
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#666' }}>{trend.month}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{trend.leaves}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>leaves</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, icon }) => (
  <div style={{
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`,
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: color, marginBottom: '5px' }}>
      {value}
    </div>
    <div style={{ fontSize: '14px', color: '#666' }}>{title}</div>
  </div>
);

export default DashboardReports;