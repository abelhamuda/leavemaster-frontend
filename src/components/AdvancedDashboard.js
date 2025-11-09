import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { leaveAPI } from '../services/api';
import { reportsAPI } from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdvancedDashboard = ({ user }) => {
  const [stats, setStats] = useState({});
  const [departmentStats, setDepartmentStats] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [leaveTypeDistribution, setLeaveTypeDistribution] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Gunakan reportsAPI yang benar
      const [
        statsRes,
        deptRes,
        trendsRes,
        distributionRes,
        activitiesRes
      ] = await Promise.all([
        reportsAPI.getDashboardStats(),
        reportsAPI.getDepartmentStats(),
        reportsAPI.getMonthlyTrends(),
        reportsAPI.getLeaveTypeDistribution(),
        reportsAPI.getRecentActivities()
      ]);

      setStats(statsRes.data);
      setDepartmentStats(deptRes.data);
      setMonthlyTrends(trendsRes.data);
      setLeaveTypeDistribution(distributionRes.data);
      setRecentActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    // Simple PDF export implementation
    const printContent = document.getElementById('dashboard-content');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>LeaveMaster Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
            .chart-container { margin: 30px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <h1>LeaveMaster Analytics Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Chart data configurations
  const monthlyTrendsChart = {
    labels: monthlyTrends.map(t => t.month),
    datasets: [
      {
        label: 'Approved',
        data: monthlyTrends.map(t => t.approved),
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Pending',
        data: monthlyTrends.map(t => t.pending),
        borderColor: '#f39c12',
        backgroundColor: 'rgba(243, 156, 18, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Rejected',
        data: monthlyTrends.map(t => t.rejected),
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const departmentChart = {
    labels: departmentStats.map(d => d.department),
    datasets: [
      {
        label: 'Total Leaves',
        data: departmentStats.map(d => d.total_leaves),
        backgroundColor: '#3498db',
      },
      {
        label: 'Pending',
        data: departmentStats.map(d => d.pending_count),
        backgroundColor: '#f39c12',
      },
    ],
  };

  const leaveTypeChart = {
    labels: leaveTypeDistribution.map(d => d.type),
    datasets: [
      {
        data: leaveTypeDistribution.map(d => d.count),
        backgroundColor: leaveTypeDistribution.map(d => d.color),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h3>📊 Loading Advanced Dashboard...</h3>
        <p>Please wait while we load your analytics data</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <div id="dashboard-content">
        {/* Header */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#2c3e50' }}>📊 Analytics Dashboard</h1>
            <p style={{ margin: 0, color: '#7f8c8d' }}>
              Real-time insights and analytics for leave management
            </p>
          </div>
          <button
            onClick={exportToPDF}
            style={{
              background: '#27ae60',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📥 Export Report
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ 
          background: 'white', 
          padding: '10px', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['overview', 'departments', 'trends', 'activities'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  background: activeTab === tab ? '#3498db' : '#ecf0f1',
                  color: activeTab === tab ? 'white' : '#2c3e50',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'overview' ? '📈 Overview' :
                 tab === 'departments' ? '👥 Departments' :
                 tab === 'trends' ? '📅 Trends' : '🔄 Activities'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Statistics Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <StatCard 
                title="Total Employees" 
                value={stats.total_employees} 
                icon="👥"
                color="#3498db"
                change="+2%"
              />
              <StatCard 
                title="Pending Requests" 
                value={stats.pending_requests} 
                icon="⏳"
                color="#f39c12"
                change="+5%"
              />
              <StatCard 
                title="Approved This Month" 
                value={stats.approved_this_month} 
                icon="✅"
                color="#2ecc71"
                change="+12%"
              />
              <StatCard 
                title="Leave Utilization" 
                value={`${stats.leave_utilization?.toFixed(1) || 0}%`} 
                icon="📈"
                color="#9b59b6"
                change="-3%"
              />
              <StatCard 
                title="Avg Processing Time" 
                value={`${stats.avg_processing_time?.toFixed(1) || 0}h`} 
                icon="⚡"
                color="#e74c3c"
                change="-15%"
              />
              <StatCard 
                title="Total Leaves This Year" 
                value={stats.total_leaves_this_year} 
                icon="📅"
                color="#1abc9c"
                change="+8%"
              />
            </div>

            {/* Charts Row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Monthly Trends Chart */}
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3>Monthly Leave Trends</h3>
                <div style={{ height: '300px' }}>
                  <Line 
                    data={monthlyTrendsChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Leave Type Distribution */}
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3>Leave Type Distribution</h3>
                <div style={{ height: '300px' }}>
                  <Doughnut 
                    data={leaveTypeChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div>
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <h3>Department Performance</h3>
              <div style={{ height: '400px' }}>
                <Bar 
                  data={departmentChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                    },
                  }}
                />
              </div>
            </div>

            {/* Department Table */}
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '10px'
            }}>
              <h3>Department Statistics</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', border: '1px solid #ddd' }}>Department</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd' }}>Employees</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd' }}>Total Leaves</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd' }}>Avg Days</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd' }}>Utilization</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd' }}>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentStats.map((dept, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{dept.department}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{dept.total_employees}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{dept.total_leaves}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{dept.avg_leave_days?.toFixed(1)}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        {dept.utilization_rate?.toFixed(1)}%
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        <span style={{ 
                          background: dept.pending_count > 0 ? '#fff3cd' : '#d1ecf1',
                          color: dept.pending_count > 0 ? '#856404' : '#0c5460',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {dept.pending_count} pending
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        {activeTab === 'activities' && (
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '10px'
          }}>
            <h3>Recent Activities</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {recentActivities.map((activity, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: getStatusColor(activity.status),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px'
                  }}>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>
                      {activity.employee_name} - {activity.leave_type} Leave
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {activity.start_date} to {activity.end_date} • 
                      Status: <span style={{ 
                        color: getStatusColor(activity.status),
                        fontWeight: 'bold'
                      }}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '12px', color: '#999' }}>
                    <div>{new Date(activity.created_at).toLocaleDateString()}</div>
                    <div>by {activity.action_by}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components
const StatCard = ({ title, value, icon, color, change }) => (
  <div style={{
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: color, marginBottom: '5px' }}>
      {value}
    </div>
    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>{title}</div>
    <div style={{ 
      fontSize: '12px', 
      color: change.startsWith('+') ? '#2ecc71' : '#e74c3c'
    }}>
      {change} from last month
    </div>
  </div>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'approved': return '#2ecc71';
    case 'pending': return '#f39c12';
    case 'rejected': return '#e74c3c';
    default: return '#95a5a6';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'approved': return '✅';
    case 'pending': return '⏳';
    case 'rejected': return '❌';
    default: return '💡';
  }
};

export default AdvancedDashboard;