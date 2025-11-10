import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  BarChart3,
  Building,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { leaveAPI } from '../services/api';

const DashboardReports = ({ user }) => {
  const [stats, setStats] = useState({});
  const [departmentStats, setDepartmentStats] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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
      setExporting(true);
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
    } finally {
      setExporting(false);
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
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">Comprehensive leave analytics and reports</p>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          </div>
          <p className="text-gray-600">Comprehensive leave analytics and reports</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportReport}
            disabled={exporting}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {exporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Employees" 
          value={stats.total_employees} 
          color="blue"
          icon={<Users className="w-6 h-6" />}
          trend={stats.employee_growth}
        />
        <StatCard 
          title="Pending Requests" 
          value={stats.pending_requests} 
          color="amber"
          icon={<Clock className="w-6 h-6" />}
          trend={stats.pending_trend}
        />
        <StatCard 
          title="Approved This Month" 
          value={stats.approved_this_month} 
          color="green"
          icon={<CheckCircle className="w-6 h-6" />}
          trend={stats.approval_trend}
        />
        <StatCard 
          title="Leave Utilization" 
          value={`${stats.leave_utilization?.toFixed(1) || 0}%`} 
          color="purple"
          icon={<TrendingUp className="w-6 h-6" />}
          trend={stats.utilization_trend}
        />
      </div>

      {/* Department Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Department Overview</h3>
          </div>
          <span className="text-sm text-gray-500">
            {departmentStats.length} departments
          </span>
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-100 border-b border-gray-200 text-sm font-medium text-gray-900">
            <div>Department</div>
            <div className="text-center">Employees</div>
            <div className="text-center">Total Leaves</div>
            <div className="text-center">Avg Days</div>
            <div className="text-center">Utilization</div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {departmentStats.map((dept, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="grid grid-cols-5 gap-4 p-4 hover:bg-white transition-colors duration-200"
              >
                <div className="font-medium text-gray-900">{dept.department}</div>
                <div className="text-center text-gray-700">{dept.total_employees}</div>
                <div className="text-center text-gray-700">{dept.total_leaves}</div>
                <div className="text-center text-gray-700">{dept.avg_leave_days?.toFixed(1)}</div>
                <div className="text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    dept.utilization_rate >= 80 
                      ? 'bg-red-100 text-red-800'
                      : dept.utilization_rate >= 60
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {dept.utilization_rate?.toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Monthly Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Monthly Trends</h3>
          </div>
          <span className="text-sm text-gray-500">
            Last {monthlyTrends.length} months
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {monthlyTrends.map((trend, index) => {
            const maxLeaves = Math.max(...monthlyTrends.map(t => t.leaves));
            const percentage = (trend.leaves / maxLeaves) * 100;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center hover:shadow-md transition-all duration-200"
              >
                <div className="text-sm font-medium text-blue-900 mb-2">
                  {trend.month}
                </div>
                
                {/* Bar Chart Visualization */}
                <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="text-2xl font-bold text-blue-900">
                  {trend.leaves}
                </div>
                <div className="text-xs text-blue-700 font-medium">
                  leaves
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 pt-6 border-t border-gray-200"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_leave_requests}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.approval_rate?.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Approval Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{stats.avg_processing_time?.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avg Processing Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{stats.peak_month}</div>
            <div className="text-sm text-gray-600">Peak Month</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({ title, value, color, icon, trend }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', value: 'text-blue-700' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', value: 'text-amber-700' },
    green: { bg: 'bg-green-100', text: 'text-green-600', value: 'text-green-700' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', value: 'text-purple-700' }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
          {icon}
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

export default DashboardReports;