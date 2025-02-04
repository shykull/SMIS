import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'; // Import Bootstrap DataTables CSS
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5"; // Import Bootstrap integration for DataTables

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ id: null, username: '', password: '', permissions: {} });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Initialize DataTable after users data is fetched
    if (users.length) {
      $('#userTable').DataTable();
    }
  }, [users]);

  const fetchUsers = async () => {
    const response = await axios.get('http://localhost:3001/api/user/all',{withCredentials: true,}); // Adjust your API endpoint
    setUsers(response.data);
    console.log(response.data)
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  const handlePermissionsChange = (permission) => {
    setUserForm(prevForm => ({
      ...prevForm,
      permissions: {
        ...prevForm.permissions,
        [permission]: !prevForm.permissions[permission] // Toggle the permission value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: userForm.id,
      username: userForm.username,
      password: userForm.password,
      permissions: {
        visitor: userForm.permissions.visitor || false,
        owner: userForm.permissions.owner || false,
        tenant: userForm.permissions.tenant || false,
        sys_admin: userForm.permissions.sys_admin || false,
        prop_manager: userForm.permissions.prop_manager || false,
        site_manager: userForm.permissions.site_manager || false,
        admin: userForm.permissions.admin || false,
        account: userForm.permissions.account || false,
        tech: userForm.permissions.tech || false,
        security: userForm.permissions.security || false,
      },
    };

    if (userForm.id) {
      await axios.put(`http://localhost:3001/api/user/updateUser`, payload, { withCredentials: true });
    } else {
      await axios.post('http://localhost:3001/api/user', payload, { withCredentials: true });
    }
    fetchUsers();
    setUserForm({ id: null, username: '', password: '', permissions: {} }); // Reset form
  };

  const handleEdit = (user) => {
    setUserForm({ 
      id: user.id, 
      username: user.username, 
      password: '', // Keep password empty for security reasons
      permissions: { 
        visitor: user.Permission.visitor,
        owner: user.Permission.owner,
        tenant: user.Permission.tenant,
        sys_admin: user.Permission.sys_admin,
        prop_manager: user.Permission.prop_manager,
        site_manager: user.Permission.site_manager,
        admin: user.Permission.admin,
        account: user.Permission.account,
        tech: user.Permission.tech,
        security: user.Permission.security,
      }
    });
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3001/api/user/${id}`, { withCredentials: true });
    fetchUsers();
  };

  return (
    <div className="container mt-4">
      <h1>User Management</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="hidden"
          name="id"
          value={userForm.id}
        />
        <div className="mb-3">
          <input
            type="text"
            name="username"
            className="form-control"
            placeholder="Username"
            value={userForm.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Reset Password"
            value={userForm.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="row mb-3">
          <label className="form-label">Permissions</label>
          {Object.keys(userForm.permissions).length > 0 && (
            <>
              {Object.keys(userForm.permissions).map((permission) => (
                <div key={permission} className="form-check col-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={userForm.permissions[permission] || false}
                    onChange={() => handlePermissionsChange(permission)}
                  />
                  <label className="form-check-label">{permission}</label>
                </div>
              ))}
            </>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          {userForm.id ? 'Update User' : 'Add User'}
        </button>
      </form>
      <table id="userTable" className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Contact</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.contact}</td>
              <td>{user.firstname}</td>
              <td>{user.lastname}</td>
              <td>
                <button onClick={() => handleEdit(user)} className="btn btn-warning btn-sm me-1">Edit</button>
                <button onClick={() => handleDelete(user.id)} className="btn btn-danger btn-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
