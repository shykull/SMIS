import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'; // Import Bootstrap DataTables CSS
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5"; // Import Bootstrap integration for DataTables
import Papa from 'papaparse'; // Import PapaParse for CSV parsing

function PropertyManagement() {
  const [selectedFile, setSelectedFile] = useState(null); // State to store the selected file
  const [alertMessage, setAlertMessage] = useState(''); // State to handle alert visibility, message, and type
  const [alertType, setAlertType] = useState(''); // New state for alert type
  const [buildings, setBuildings] = useState([]); // State to store building data
  const [users, setUsers] = useState([]); // State to store users data
  const [selectedBuilding, setSelectedBuilding] = useState(null); // State to store the selected building
  const [selectedUser, setSelectedUser] = useState(''); // State to store the selected user

  useEffect(() => {
    fetchBuildings();
    fetchUsers();
  }, []);

  useEffect(() => {
    // Initialize DataTable after users data is fetched
    if (buildings.length) {
      $('#buildTable').DataTable();
    }
  }, [buildings]);

  const fetchBuildings = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/build/all', { withCredentials: true });
      setBuildings(response.data);
      console.log('Buildings:', response.data);
    } catch (error) {
      setAlertMessage('Error fetching buildings: ' + (error.response?.data?.message || error.message));
      setAlertType('danger');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/user/all', { withCredentials: true });
      setUsers(response.data);
      console.log('Users:', response.data);
    } catch (error) {
      setAlertMessage('Error fetching users: ' + (error.response?.data?.message || error.message));
      setAlertType('danger');
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
          const builds = results.data;
          try {
            const response = await axios.post('http://localhost:3001/api/build/upload', { builds }, { withCredentials: true });
            setAlertMessage('Units uploaded successfully');
            setAlertType('success'); // Set alert type to success
            fetchBuildings(); // Refresh building data
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

  const handleEdit = (building) => {
    setSelectedBuilding(building);
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleUpdate = async () => {
    try {
      await axios.post('http://localhost:3001/api/build/assoc', { UserId: selectedUser, BuildingId: selectedBuilding.id }, { withCredentials: true });
      setAlertMessage('Building updated successfully');
      setAlertType('success'); // Set alert type to success
      fetchBuildings(); // Refresh building data
      setSelectedBuilding(null); // Close the form
    } catch (error) {
      setAlertMessage('Error updating building: ' + (error.response?.data?.message || error.message));
      setAlertType('danger'); // Set alert type to danger
    }
  };

  return (
    <div className="container mt-4">
      <h1>Property Management</h1>
      {/* Bootstrap dismissible alert */}
      {alertMessage && (
        <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
          {alertMessage}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setAlertMessage('')}></button>
        </div>
      )}

      <h4 className="mt-4">Bulk Upload Units CSV</h4>
      <div className="input-group mb-4">
        <input type="file" className="form-control" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleFileUpload} className="btn btn-success">Upload</button>
      </div>

      <h4 className="mt-4">Buildings by Block</h4>
      <table id="buildTable" className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Block</th>
            <th>Level</th>
            <th>Unit</th>
            <th>Owner Name</th>
            <th>Owner Contact</th>
            <th>Tenant Name</th>
            <th>Tenant Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buildings.map((building) => (
            <tr key={building.id}>
              <td>{building.block}</td>
              <td>{building.level}</td>
              <td>{building.unit}</td>
              <td>{building.OwnerName}</td>
              <td>{building.OwnerContact}</td>
              <td>{building.TenantName}</td>
              <td>{building.TenantContact}</td>
              <td>
                <button onClick={() => handleEdit(building)} className="btn btn-warning btn-sm me-1">🖊️ Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedBuilding && (
        <div className="mt-4">
          <h4>Edit Building Association</h4>
          <div className="mb-3">
            <label htmlFor="userSelect" className="form-label">Select User</label>
            <select id="userSelect" className="form-select" value={selectedUser} onChange={handleUserChange}>
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstname} {user.lastname} ({user.Permission.owner ? 'Owner' : user.Permission.tenant ? 'Tenant' : 'Other'})
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleUpdate} className="btn btn-primary">Update</button>
          <button onClick={() => setSelectedBuilding(null)} className="btn btn-secondary ms-2">Cancel</button>
        </div>
      )}
    </div>
  );
}

export default PropertyManagement;

