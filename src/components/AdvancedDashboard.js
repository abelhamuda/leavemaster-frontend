import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { 
  Download, 
  RefreshCw, 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  BarChart3,
  Building,
  Calendar,
  Activity,
  AlertCircle,
  Zap,
  FileText
} from 'lucide-react';
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
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setRefreshing(true);
      
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

      setStats(statsRes.data || {});
      setDepartmentStats(deptRes.data || []);
      setMonthlyTrends(trendsRes.data || []);
      setLeaveTypeDistribution(distributionRes.data || []);
      setRecentActivities(activitiesRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportToPDF = () => {
    const printContent = document.getElementById('dashboard-content');
    if (!printContent) return;
    
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

  // Chart configurations
  const monthlyTrendsChart = {
    labels: monthlyTrends.length > 0 ? monthlyTrends.map(t => t.month) : ['No Data'],
    datasets: [
      {
        label: 'Approved',
        data: monthlyTrends.length > 0 ? monthlyTrends.map(t => t.approved) : [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        borderWidth: 3,
      },
      {
        label: 'Pending',
        data: monthlyTrends.length > 0 ? monthlyTrends.map(t => t.pending) : [0],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        borderWidth: 3,
      },
      {
        label: 'Rejected',
        data: monthlyTrends.length > 0 ? monthlyTrends.map(t => t.rejected) : [0],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  };

  const departmentChart = {
    labels: departmentStats.length > 0 ? departmentStats.map(d => d.department) : ['No Departments'],
    datasets: [
      {
        label: 'Total Leaves',
        data: departmentStats.length > 0 ? departmentStats.map(d => d.total_leaves) : [0],
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      },
      {
        label: 'Pending',
        data: departmentStats.length > 0 ? departmentStats.map(d => d.pending_count) : [0],
        backgroundColor: '#f59e0b',
        borderRadius: 8,
      },
    ],
  };

  const leaveTypeChart = {
    labels: leaveTypeDistribution.length > 0 ? leaveTypeDistribution.map(d => d.type) : ['No Data'],
    datasets: [
      {
        data: leaveTypeDistribution.length > 0 ? leaveTypeDistribution.map(d => d.count) : [1],
        backgroundColor: leaveTypeDistribution.length > 0 
          ? ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
          : ['#6b7280'],
        borderWidth: 3,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  // Loading State
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">Real-time insights and analytics for leave management</p>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Error State
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={loadDashboardData}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            </div>
            <p className="text-gray-600">Real-time insights and analytics for leave management</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors duration-200"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </button>
            <button
              onClick={exportToPDF}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'departments', label: 'Departments', icon: Building },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'activities', label: 'Activities', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div id="dashboard-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard 
                    title="Total Employees" 
                    value={stats.total_employees || 0} 
                    icon={Users}
                    color="blue"
                    trend={stats.employee_growth}
                  />
                  <StatCard 
                    title="Pending Requests" 
                    value={stats.pending_requests || 0} 
                    icon={Clock}
                    color="amber"
                    trend={stats.pending_trend}
                  />
                  <StatCard 
                    title="Approved This Month" 
                    value={stats.approved_this_month || 0} 
                    icon={CheckCircle}
                    color="green"
                    trend={stats.approval_trend}
                  />
                  <StatCard 
                    title="Leave Utilization" 
                    value={`${(stats.leave_utilization || 0).toFixed(1)}%`} 
                    icon={TrendingUp}
                    color="purple"
                    trend={stats.utilization_trend}
                  />
                  <StatCard 
                    title="Avg Processing Time" 
                    value={`${(stats.avg_processing_time || 0).toFixed(1)}h`} 
                    icon={Zap}
                    color="red"
                    trend={stats.processing_trend}
                  />
                  <StatCard 
                    title="Total Leaves This Year" 
                    value={stats.total_leaves_this_year || 0} 
                    icon={Calendar}
                    color="emerald"
                    trend={stats.leaves_trend}
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Monthly Trends Chart */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Leave Trends</h3>
                    <div className="h-80">
                      <Line 
                        data={monthlyTrendsChart}
                        options={chartOptions}
                      />
                    </div>
                  </div>

                  {/* Leave Type Distribution */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Type Distribution</h3>
                    <div className="h-80">
                      <Doughnut 
                        data={leaveTypeChart}
                        options={chartOptions}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Departments Tab */}
            {activeTab === 'departments' && (
              <div className="space-y-6">
                {/* Department Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
                  <div className="h-96">
                    <Bar 
                      data={departmentChart}
                      options={chartOptions}
                    />
                  </div>
                </div>

                {/* Department Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Statistics</h3>
                  {departmentStats.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Department</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Employees</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Total Leaves</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Avg Days</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Utilization</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Pending</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {departmentStats.map((dept, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{dept.department}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-center">{dept.total_employees}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-center">{dept.total_leaves}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-center">{(dept.avg_leave_days || 0).toFixed(1)}</td>
                              <td className="px-4 py-3 text-sm text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  dept.utilization_rate >= 80 
                                    ? 'bg-red-100 text-red-800'
                                    : dept.utilization_rate >= 60
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {(dept.utilization_rate || 0).toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  dept.pending_count > 0 
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {dept.pending_count} pending
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No department data available</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                {recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.status === 'approved' ? 'bg-green-100 text-green-600' :
                          activity.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {activity.status === 'approved' ? <CheckCircle className="w-5 h-5" /> :
                           activity.status === 'pending' ? <Clock className="w-5 h-5" /> :
                           <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.employee_name} - {activity.leave_type} Leave
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.start_date} to {activity.end_date} • 
                            <span className={`ml-1 font-medium ${
                              activity.status === 'approved' ? 'text-green-600' :
                              activity.status === 'pending' ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              {activity.status}
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>{new Date(activity.created_at).toLocaleDateString()}</div>
                          <div>by {activity.action_by}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activities</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// StatCard Component
const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', value: 'text-blue-700' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', value: 'text-amber-700' },
    green: { bg: 'bg-green-100', text: 'text-green-600', value: 'text-green-700' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', value: 'text-purple-700' },
    red: { bg: 'bg-red-100', text: 'text-red-600', value: 'text-red-700' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', value: 'text-emerald-700' }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      
      <div className={`text-3xl font-bold ${colors.value} mb-1`}>
        {value}
      </div>
      <div className="text-sm text-gray-600 font-medium">
        {title}
      </div>
    </motion.div>
  );
};

export default AdvancedDashboard;