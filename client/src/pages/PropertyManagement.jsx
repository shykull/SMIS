import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from 'react-select';
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
  const [buildingsAssoc, setBuildingsAssoc] = useState([]); // State to store building associations
  const [users, setUsers] = useState([]); // State to store users data
  const [selectedBuilding, setSelectedBuilding] = useState(null); // State to store the selected building
  const [selectedOwner, setSelectedOwner] = useState(''); // State to store the selected owner
  const [selectedTenant, setSelectedTenant] = useState(''); // State to store the selected tenant

  useEffect(() => {
    fetchBuildings();
    fetchBuildingsAssoc();
    fetchUsers();
  }, []);

  useEffect(() => {
    // Initialize DataTable after buildings data is fetched
    if (buildings.length) {
      $('#buildTable').DataTable();
    }
  }, [buildings]);

  const fetchBuildings = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/build/all', { withCredentials: true });
      setBuildings(response.data);
    } catch (error) {
      setAlertMessage('Error fetching buildings: ' + (error.response?.data?.message || error.message));
      setAlertType('danger');
    }
  };

  const fetchBuildingsAssoc = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/build/assoc/all', { withCredentials: true });
      setBuildingsAssoc(response.data);
    } catch (error) {
      setAlertMessage('Error fetching building associations: ' + (error.response?.data?.message || error.message));
      setAlertType('danger');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/user/all', { withCredentials: true });
      setUsers(response.data);
     // console.log('Users:', response.data);
    } catch (error) {
      setAlertMessage('Error fetching users: ' + (error.response?.data?.message || error.message));
      setAlertType('danger');
    }
  };

  useEffect(() => {
    if (buildings.length && buildingsAssoc.length && users.length) {
      const updatedBuildings = buildings.map(building => {
        const assoc = buildingsAssoc.filter(assoc => assoc.BuildingId === building.id);
        const ownerAssoc = assoc.find(assoc => users.find(user => user.id === assoc.UserId && user.Permission.owner));
        const tenantAssoc = assoc.find(assoc => users.find(user => user.id === assoc.UserId && user.Permission.tenant));
        const owner = ownerAssoc ? users.find(user => user.id === ownerAssoc.UserId) : null;
        const tenant = tenantAssoc ? users.find(user => user.id === tenantAssoc.UserId) : null;

        return {
          ...building,
          OwnerName: owner ? `${owner.firstname} ${owner.lastname}` : '',
          OwnerContact: owner ? owner.contact : '',
          TenantName: tenant ? `${tenant.firstname} ${tenant.lastname}` : '',
          TenantContact: tenant ? tenant.contact : ''
        };
      });

      setBuildings(updatedBuildings);
    }
  }, [buildingsAssoc, users]);

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
    const assoc = buildingsAssoc.filter(assoc => assoc.BuildingId === building.id);
    const ownerAssoc = assoc.find(assoc => users.find(user => user.id === assoc.UserId && user.Permission.owner));
    const tenantAssoc = assoc.find(assoc => users.find(user => user.id === assoc.UserId && user.Permission.tenant));
    setSelectedOwner(ownerAssoc ? ownerAssoc.UserId : '');
    setSelectedTenant(tenantAssoc ? tenantAssoc.UserId : '');
  };

  const handleOwnerChange = (selectedOption) => {
    setSelectedOwner(selectedOption ? selectedOption.value : '');
  };

  const handleTenantChange = (selectedOption) => {
    setSelectedTenant(selectedOption ? selectedOption.value : '');
  };

  const handleUpdate = async () => {
    try {
      // Delete existing associations if owner or tenant changes
      try {
        await axios.delete(`http://localhost:3001/api/build/assoc/${selectedBuilding.id}`, { withCredentials: true });
      } catch (deleteError) {
        //console.error('Error deleting existing associations:', deleteError);
        // Continue regardless of the delete error
      }
  
      // Create new associations
      if (selectedOwner) {
        await axios.post('http://localhost:3001/api/build/assoc', { UserId: selectedOwner, BuildingId: selectedBuilding.id }, { withCredentials: true });
      }
      if (selectedTenant) {
        await axios.post('http://localhost:3001/api/build/assoc', { UserId: selectedTenant, BuildingId: selectedBuilding.id }, { withCredentials: true });
      }
  
      setAlertMessage('Building updated successfully');
      setAlertType('success'); // Set alert type to success
      fetchBuildingsAssoc(); // Refresh building data
      setSelectedBuilding(null); // Close the form
    } catch (error) {
      setAlertMessage('Error updating building: ' + (error.response?.data?.message || error.message));
      setAlertType('danger'); // Set alert type to danger
    }
  };

  const ownerOptions = users.filter(user => user.Permission.owner).map(user => ({
    value: user.id,
    label: `${user.firstname} ${user.lastname}`
  }));

  const tenantOptions = users.filter(user => user.Permission.tenant).map(user => ({
    value: user.id,
    label: `${user.firstname} ${user.lastname}`
  }));

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

{selectedBuilding && (
        <div className="mt-4">
          <h4>Edit Building Association</h4>
          <h5>{selectedBuilding.block} - {selectedBuilding.level} - {selectedBuilding.unit}</h5>
          <div className="mb-3">
            <label htmlFor="ownerSelect" className="form-label">Select Owner</label>
            <Select
              id="ownerSelect"
              value={ownerOptions.find(option => option.value === selectedOwner)}
              onChange={handleOwnerChange}
              options={ownerOptions}
              isClearable
            />
          </div>
          <div className="mb-3">
            <label htmlFor="tenantSelect" className="form-label">Select Tenant</label>
            <Select
              id="tenantSelect"
              value={tenantOptions.find(option => option.value === selectedTenant)}
              onChange={handleTenantChange}
              options={tenantOptions}
              isClearable
            />
          </div>
          <button onClick={handleUpdate} className="btn btn-primary">Update</button>
          <button onClick={() => setSelectedBuilding(null)} className="btn btn-secondary ms-2">Cancel</button>
        </div>
      )}

      <h4 className="mt-4">Development Avaliable Units</h4>
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
              <td className="text-center">{building.block}</td>
              <td className="text-center">{building.level}</td>
              <td className="text-center">{building.unit}</td>
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

      

      <h4 className="mt-4">Bulk Upload Units CSV</h4>
      <div className="input-group mb-4">
        <input type="file" className="form-control" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleFileUpload} className="btn btn-success">Upload</button>
      </div>

    </div>
  );
}

export default PropertyManagement;

