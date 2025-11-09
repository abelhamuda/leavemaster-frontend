import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';

const UserManagement = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

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

    // Langsung create employee (skip debug test)
    console.log('🚀 Creating employee...');
    const response = await reportsAPI.apiClient.post('/employees', employeeData);
    console.log('✅ Employee created response:', response.data);
    
    // Refresh data
    await loadUserData();
    
    setShowCreateModal(false);
    setNewEmployee({
      employee_id: '', name: '', email: '', password: '', position: '',
      department_id: '', role_id: '', manager_id: '', total_leave_days: 12
    });
    
    alert('Employee created successfully!');
  } catch (error) {
    console.error('❌ CREATE EMPLOYEE ERROR:');
    console.error('   Error object:', error);
    console.error('   Response data:', error.response?.data);
    console.error('   Status:', error.response?.status);
    console.error('   Headers:', error.response?.headers);
    
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

  if (loading) {
    return (
      <div style={{ background: 'white', padding: '40px', textAlign: 'center' }}>
        <h3>👥 Loading User Management...</h3>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
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
          <h1 style={{ margin: 0, color: '#2c3e50' }}>👥 User Management</h1>
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Manage employees, roles, and departments
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            background: '#27ae60',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ➕ Add Employee
        </button>
      </div>

      {/* Employees Table */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '10px'
      }}>
        <h3>Employees ({employees.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Department</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Role</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{emp.employee_id}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <div style={{ fontWeight: 'bold' }}>{emp.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{emp.position}</div>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{emp.email}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{emp.department_name}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <span style={{ 
                    background: getRoleColor(emp.role_name),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {emp.role_name}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <span style={{ 
                    background: emp.is_active ? '#d4edda' : '#f8d7da',
                    color: emp.is_active ? '#155724' : '#721c24',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {emp.is_active ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setShowEditModal(true);
                    }}
                    style={{
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '5px'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(emp.id)}
                    style={{
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Employee Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '500px',
            maxWidth: '90vw'
          }}>
            <h3>➕ Add New Employee</h3>
            <form onSubmit={handleCreateEmployee}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    value={newEmployee.employee_id}
                    onChange={e => setNewEmployee({...newEmployee, employee_id: e.target.value})}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label>Name *</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Email *</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Password *</label>
                <input
                  type="password"
                  value={newEmployee.password}
                  onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label>Position *</label>
                  <input
                    type="text"
                    value={newEmployee.position}
                    onChange={e => setNewEmployee({...newEmployee, position: e.target.value})}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label>Leave Days</label>
                  <input
                    type="number"
                    value={newEmployee.total_leave_days}
                    onChange={e => setNewEmployee({...newEmployee, total_leave_days: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <label>Department *</label>
                  <select
                    value={newEmployee.department_id}
                    onChange={e => setNewEmployee({...newEmployee, department_id: e.target.value})}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Role *</label>
                  <select
                    value={newEmployee.role_id}
                    onChange={e => setNewEmployee({...newEmployee, role_id: e.target.value})}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '500px',
            maxWidth: '90vw'
          }}>
            <h3>✏️ Edit Employee</h3>
            <form onSubmit={handleUpdateEmployee}>
              <div style={{ marginBottom: '15px' }}>
                <label>Name</label>
                <input
                  type="text"
                  value={selectedEmployee.name}
                  onChange={e => setSelectedEmployee({...selectedEmployee, name: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Email</label>
                <input
                  type="email"
                  value={selectedEmployee.email}
                  onChange={e => setSelectedEmployee({...selectedEmployee, email: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label>Position</label>
                  <input
                    type="text"
                    value={selectedEmployee.position}
                    onChange={e => setSelectedEmployee({...selectedEmployee, position: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label>Leave Days</label>
                  <input
                    type="number"
                    value={selectedEmployee.total_leave_days}
                    onChange={e => setSelectedEmployee({...selectedEmployee, total_leave_days: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label>Department</label>
                  <select
                    value={selectedEmployee.department_id || ''}
                    onChange={e => setSelectedEmployee({...selectedEmployee, department_id: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Role</label>
                  <select
                    value={selectedEmployee.role_id || ''}
                    onChange={e => setSelectedEmployee({...selectedEmployee, role_id: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedEmployee.is_active}
                    onChange={e => setSelectedEmployee({...selectedEmployee, is_active: e.target.checked})}
                    style={{ marginRight: '8px' }}
                  />
                  Active Employee
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Update Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const getRoleColor = (roleName) => {
  switch (roleName) {
    case 'super_admin': return '#e74c3c';
    case 'admin': return '#3498db';
    case 'manager': return '#f39c12';
    case 'employee': return '#2ecc71';
    default: return '#95a5a6';
  }
};

export default UserManagement;