import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Download,
  Mail,
  Building,
  Shield,
  UserCheck,
  UserX,
  Eye,
  EyeOff
} from 'lucide-react';
import { reportsAPI } from '../services/api';

const UserManagement = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    name: '',
    email: '',
    password: '',
    position: '',
    department_id: '',
    role_id: '',
    manager_id: '',
    total_leave_days: 12
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [employeesRes, rolesRes, deptRes] = await Promise.all([
        reportsAPI.apiClient.get('/employees'),
        reportsAPI.apiClient.get('/roles'),
        reportsAPI.apiClient.get('/departments')
      ]);

      setEmployees(employeesRes.data);
      setRoles(rolesRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        employee_id: newEmployee.employee_id,
        name: newEmployee.name,
        email: newEmployee.email,
        password: newEmployee.password,
        position: newEmployee.position,
        department_id: parseInt(newEmployee.department_id),
        role_id: parseInt(newEmployee.role_id),
        manager_id: newEmployee.manager_id ? parseInt(newEmployee.manager_id) : null,
        total_leave_days: parseInt(newEmployee.total_leave_days) || 12
      };

      console.log('🆕 Sending employee data:', employeeData);
      const response = await reportsAPI.apiClient.post('/employees', employeeData);
      console.log('✅ Employee created response:', response.data);
      
      await loadUserData();
      
      setShowCreateModal(false);
      setNewEmployee({
        employee_id: '', name: '', email: '', password: '', position: '',
        department_id: '', role_id: '', manager_id: '', total_leave_days: 12
      });
      
      // Show success message
      alert('Employee created successfully!');
    } catch (error) {
      console.error('❌ CREATE EMPLOYEE ERROR:', error);
      
      let errorMessage = 'Error creating employee: ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred';
      }
      
      alert(errorMessage);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      await reportsAPI.apiClient.put(`/employees/${selectedEmployee.id}`, selectedEmployee);
      setShowEditModal(false);
      setSelectedEmployee(null);
      loadUserData();
      alert('Employee updated successfully!');
    } catch (error) {
      alert('Error updating employee: ' + error.response?.data?.error);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await reportsAPI.apiClient.delete(`/employees/${id}`);
        loadUserData();
        alert('Employee deactivated successfully!');
      } catch (error) {
        alert('Error deactivating employee: ' + error.response?.data?.error);
      }
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || emp.department_id?.toString() === filterDepartment;
    const matchesRole = !filterRole || emp.role_id?.toString() === filterRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

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
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600 mt-1">Manage employees, roles, and departments</p>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border border-gray-200 rounded-xl">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
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
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            </div>
            <p className="text-gray-600">Manage employees, roles, and departments</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="w-4 h-4 text-gray-400" />
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="w-4 h-4 text-gray-400" />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button className="inline-flex items-center justify-center px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Employees ({filteredEmployees.length})
            </h3>
            <span className="text-sm text-gray-500">
              Showing {filteredEmployees.length} of {employees.length} employees
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((emp, index) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {emp.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {emp.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {emp.employee_id} • {emp.position}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {emp.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{emp.department_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColorClasses(emp.role_name)}`}>
                      {emp.role_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      emp.is_active 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {emp.is_active ? (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setShowEditModal(true);
                        }}
                        className="inline-flex items-center p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="inline-flex items-center p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No employees found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Employee Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal
            title="Add New Employee"
            onClose={() => setShowCreateModal(false)}
          >
            <form onSubmit={handleCreateEmployee} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Employee ID"
                  type="text"
                  value={newEmployee.employee_id}
                  onChange={e => setNewEmployee({...newEmployee, employee_id: e.target.value})}
                  required
                />
                <FormField
                  label="Full Name"
                  type="text"
                  value={newEmployee.name}
                  onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                  required
                />
              </div>

              <FormField
                label="Email"
                type="email"
                value={newEmployee.email}
                onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                required
              />

              <div className="relative">
                <FormField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={newEmployee.password}
                  onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Position"
                  type="text"
                  value={newEmployee.position}
                  onChange={e => setNewEmployee({...newEmployee, position: e.target.value})}
                  required
                />
                <FormField
                  label="Leave Days"
                  type="number"
                  value={newEmployee.total_leave_days}
                  onChange={e => setNewEmployee({...newEmployee, total_leave_days: parseInt(e.target.value)})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Department"
                  value={newEmployee.department_id}
                  onChange={e => setNewEmployee({...newEmployee, department_id: e.target.value})}
                  options={departments}
                  required
                />
                <SelectField
                  label="Role"
                  value={newEmployee.role_id}
                  onChange={e => setNewEmployee({...newEmployee, role_id: e.target.value})}
                  options={roles}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Employee Modal */}
      <AnimatePresence>
        {showEditModal && selectedEmployee && (
          <Modal
            title="Edit Employee"
            onClose={() => setShowEditModal(false)}
          >
            <form onSubmit={handleUpdateEmployee} className="space-y-6">
              <FormField
                label="Full Name"
                type="text"
                value={selectedEmployee.name}
                onChange={e => setSelectedEmployee({...selectedEmployee, name: e.target.value})}
              />

              <FormField
                label="Email"
                type="email"
                value={selectedEmployee.email}
                onChange={e => setSelectedEmployee({...selectedEmployee, email: e.target.value})}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Position"
                  type="text"
                  value={selectedEmployee.position}
                  onChange={e => setSelectedEmployee({...selectedEmployee, position: e.target.value})}
                />
                <FormField
                  label="Leave Days"
                  type="number"
                  value={selectedEmployee.total_leave_days}
                  onChange={e => setSelectedEmployee({...selectedEmployee, total_leave_days: parseInt(e.target.value)})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Department"
                  value={selectedEmployee.department_id || ''}
                  onChange={e => setSelectedEmployee({...selectedEmployee, department_id: parseInt(e.target.value)})}
                  options={departments}
                />
                <SelectField
                  label="Role"
                  value={selectedEmployee.role_id || ''}
                  onChange={e => setSelectedEmployee({...selectedEmployee, role_id: parseInt(e.target.value)})}
                  options={roles}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedEmployee.is_active}
                  onChange={e => setSelectedEmployee({...selectedEmployee, is_active: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-900">Active Employee</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Update Employee
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Modal Component
const Modal = ({ title, children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          ×
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  </motion.div>
);

// Form Field Components
const FormField = ({ label, type, value, onChange, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-900 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-900 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
    >
      <option value="">Select {label}</option>
      {options.map(option => (
        <option key={option.id} value={option.id}>{option.name}</option>
      ))}
    </select>
  </div>
);

// Helper function untuk role colors
const getRoleColorClasses = (roleName) => {
  switch (roleName) {
    case 'super_admin':
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'admin':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'manager':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'employee':
      return 'bg-green-100 text-green-800 border border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

export default UserManagement;