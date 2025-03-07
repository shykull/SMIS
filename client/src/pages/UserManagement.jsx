import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'; // Import Bootstrap DataTables CSS
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5"; // Import Bootstrap integration for DataTables
import Papa from 'papaparse'; // Import PapaParse for CSV parsing
import { CSVLink } from "react-csv"; // Import CSVLink from react-csv

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ id: '', username: '', email: '', contact: '', firstname: '', lastname: '', password: '', permissions: {} });
  const [selectedFile, setSelectedFile] = useState(null); // State to store the selected file
  // State to handle alert visibility, message, and type
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(''); // New state for alert type

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
    const response = await axios.get('http://localhost:3001/api/user/all', { withCredentials: true }); // Adjust your API endpoint
    setUsers(response.data);
   // console.log(response.data);
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
      email: userForm.email,
      contact: userForm.contact,
      firstname: userForm.firstname,
      lastname: userForm.lastname,
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

    try {
      if (userForm.id) {
        await axios.put(`http://localhost:3001/api/user/updateUser`, payload, { withCredentials: true });
        setAlertMessage('User updated successfully');
        setAlertType('success'); // Set alert type to success
      } else {
        await axios.post('http://localhost:3001/api/user', payload, { withCredentials: true });
        setAlertMessage('User added successfully');
        setAlertType('success'); // Set alert type to success
      }
      fetchUsers();
      setUserForm({ id: '', username: '', email: '', contact: '', firstname: '', lastname: '', password: '', permissions: {} }); // Reset form
    } catch (error) {
      setAlertMessage('Error: ' + (error.response?.data?.message || error.message));
      setAlertType('danger'); // Set alert type to danger
    }
  };

  const handleEdit = (user) => {
    setUserForm({
      id: user.id,
      username: user.username,
      email: user.email,
      contact: user.contact,
      firstname: user.firstname,
      lastname: user.lastname,
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

  const handleDelete = async (id, username) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the user "${username}"?`);
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/user/${id}`, { withCredentials: true });
      setAlertMessage('User deleted successfully');
      setAlertType('success'); // Set alert type to success
      fetchUsers();
    } catch (error) {
      setAlertMessage('Error: ' + (error.response?.data?.message || error.message));
      setAlertType('danger'); // Set alert type to danger
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      Papa.parse(selectedFile, {
        header: true,
        complete: async (results) => {
          const users = results.data;
          try {
            const response = await axios.post('http://localhost:3001/api/user/upload', { users }, { withCredentials: true });
            setAlertMessage('Users uploaded successfully');
            setAlertType('success'); // Set alert type to success
            fetchUsers();
          } catch (error) {
            setAlertMessage('Error: ' + (error.response?.data?.message || error.message));
            setAlertType('danger'); // Set alert type to danger
          }
        },
        error: (error) => {
          setAlertMessage('Error parsing CSV file: ' + error.message);
          setAlertType('danger'); // Set alert type to danger
        }
      });
    }
  };

  const csvHeaders = [
    { label: "username", key: "username" },
    { label: "email", key: "email" },
    { label: "contact", key: "contact" },
    { label: "firstname", key: "firstname" },
    { label: "lastname", key: "lastname" },
  ];

  return (
    <div className="container mt-4">
      <h1>User Management</h1>
      {/* Bootstrap dismissible alert */}
      {alertMessage && (
        <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
          {alertMessage}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setAlertMessage('')}></button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="row mb-4">
        <input
          type="hidden"
          name="id"
          value={userForm.id || ''}
        />
        <div className="col-12 mb-3">
          <input
            type="text"
            name="username"
            className="form-control"
            placeholder="Username"
            value={userForm.username || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="col-6 mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            value={userForm.email || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="col-6 mb-3">
          <input
            type="text"
            name="contact"
            className="form-control"
            placeholder="Contact"
            value={userForm.contact || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="col-6 mb-3">
          <input
            type="text"
            name="firstname"
            className="form-control"
            placeholder="First Name"
            value={userForm.firstname || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="col-6 mb-3">
          <input
            type="text"
            name="lastname"
            className="form-control"
            placeholder="Last Name"
            value={userForm.lastname || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="col-12 mb-3">
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Reset Password"
            value={userForm.password || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="row mb-3">
          <h4>Permissions</h4>
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
                <button onClick={() => handleEdit(user)} className="btn btn-warning btn-sm me-1">🖊️ Edit</button>
                <button onClick={() => handleDelete(user.id, user.username)} className="btn btn-danger btn-sm">🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CSVLink
        data={users}
        headers={csvHeaders}
        filename={"users.csv"}
        className="btn btn-secondary mt-3 mb-3 col-12"
        target="_blank"
      >
        Download CSV
      </CSVLink>
      <hr />
      <h4 className="mt-4">Bulk Upload User CSV</h4>
      <div className="input-group mb-4">
        <input type="file" className="form-control" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleFileUpload} className="btn btn-success">Upload</button>
      </div>    
    </div>
  );
}

export default UserManagement;
