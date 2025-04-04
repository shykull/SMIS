import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import axios from "axios";
import { Form, Button, Container, Table, Modal, Row,Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'; // Import Bootstrap DataTables CSS
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5"; // Import Bootstrap integration for DataTables
import Papa from 'papaparse'; // Import PapaParse for CSV parsing
import { CSVLink } from "react-csv"; // Import CSVLink from react-csv

function UserManagement() {
  const { auth } = useContext(AuthContext); // Access auth context
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ id: '', username: '', email: '', contact: '', firstname: '', lastname: '', password: '', permissions: {} });
  const [selectedFile, setSelectedFile] = useState(null); // State to store the selected file
  const [showModal, setShowModal] = useState(false); // State to handle modal visibility
  // State to handle alert visibility, message, and type
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(''); // New state for alert type

  useEffect(() => {
    if (auth.loading) {
      // While checking auth status, do nothing or show a loader
      return;
    }

    if (!auth.status) {
      // If not authenticated, redirect to login
      navigate('/login');
    } else {
      axios.get('http://localhost:3001/api/user/status', { withCredentials: true })
        .then((response) => {
          setUserProfile(response.data.user);
          handlePermission(response.data.user.Permission)
            .then(() => {
              fetchUsers();
            });
        })
        .catch((error) => {
          // Improved error handling: Checking for both response data and fallback to a message
          const errorMessage = error.response && error.response.data && error.response.data.error
            ? error.response.data.error
            : error.message;

          setAlertMessage(errorMessage); // Display error
        });
    }
  }, [auth.status, auth.loading, navigate]);

  const handlePermission = (permission) => {
    return new Promise((resolve, reject) => {
      const allowedRoles = ['sys_admin', 'prop_manager', 'site_manager'];
      const hasPermission = allowedRoles.some(role => permission[role]);
      if (!hasPermission) {
        navigate('/');
        reject();
      } else {
        resolve();
      }
    });
  };

  useEffect(() => {
    // Initialize DataTable after users data is fetched
    if (users.length) {
      $('#userTable').DataTable();
    }
  }, [users]);

  const fetchUsers = async () => {
    const response = await axios.get('http://localhost:3001/api/user/all', { withCredentials: true }); // Adjust your API endpoint
    setUsers(response.data);
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
      handleCloseModal(); // Close modal after submission
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
    setShowModal(true); // Show modal for editing
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

  const handleShowModal = () => {
    setUserForm({ id: '', username: '', email: '', contact: '', firstname: '', lastname: '', password: '', permissions: {} });
    setShowModal(true); // Show modal for adding new user
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close modal
  };

  const csvHeaders = [
    { label: "username", key: "username" },
    { label: "email", key: "email" },
    { label: "contact", key: "contact" },
    { label: "firstname", key: "firstname" },
    { label: "lastname", key: "lastname" },
  ];

  return (
    <Container className="mt-4">
      <h1>User Management</h1>
      {/* Bootstrap dismissible alert */}
      {alertMessage && (
              <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
                {alertMessage}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setAlertMessage('')}></button>
              </div>
      )}
      <Button variant="primary" onClick={handleShowModal}>
        Add New User
      </Button>
      <Table id="userTable" striped bordered hover className="mt-4">
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
                <Button variant="warning" className="me-2 mt-2" size="sm" onClick={() => handleEdit(user)}>
                🖊️ Edit
                </Button>
                <Button variant="danger" className="me-2 mt-2" size="sm" onClick={() => handleDelete(user.id, user.username)} disabled={userProfile.id === user.id}>
                🗑️ Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
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
        <Button onClick={handleFileUpload} className="btn btn-success">Upload</Button>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{userForm.id ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Bootstrap dismissible alert */}
            {alertMessage && (
              <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
                {alertMessage}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setAlertMessage('')}></button>
              </div>
            )}
            <input type="hidden" name="id" value={userForm.id || ''} />
            <Form.Group controlId="formUsername" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={userForm.username || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userForm.email || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formContact" className="mb-3">
              <Form.Label>Contact</Form.Label>
              <Form.Control
                type="text"
                name="contact"
                value={userForm.contact || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formFirstName" className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstname"
                value={userForm.firstname || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formLastName" className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastname"
                value={userForm.lastname || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Reset Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={userForm.password || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <h4>Permissions</h4>
            <Row className="mb-3">
              {Object.keys(userForm.permissions).length > 0 && (
                <>
                  {Object.keys(userForm.permissions).map((permission) => (
                    <Form.Group as={Col} key={permission} controlId={`formPermission${permission}`}>
                      <Form.Check
                        type="checkbox"
                        label={permission}
                        checked={userForm.permissions[permission] || false}
                        onChange={() => handlePermissionsChange(permission)}
                      />
                    </Form.Group>
                  ))}
                </>
              )}
            </Row>
            <Button variant="primary" type="submit">
              {userForm.id ? 'Update User' : 'Add User'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default UserManagement;
