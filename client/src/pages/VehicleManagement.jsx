import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import axios from "axios";
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'; // Import Bootstrap DataTables CSS
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5"; // Import Bootstrap integration for DataTables
import Papa from 'papaparse'; // Import PapaParse for CSV parsing

function VehicleManagement() {
  const { auth } = useContext(AuthContext); // Access auth context
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const [selectedFile, setSelectedFile] = useState(null); // State to store the selected file
  const [alertMessage, setAlertMessage] = useState(''); // State to handle alert visibility, message, and type
  const [alertType, setAlertType] = useState(''); // New state for alert type
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (auth.loading) return;

    if (!auth.status) {
      navigate('/login');
    } else {
      axios.get('http://localhost:3001/api/user/status', { withCredentials: true })
        .then((response) => {
          return handlePermission(response.data.user.Permission);
        })
        .then(() => {
          fetchVehicles();
        })
        .catch((error) => {
          const errorMessage = error.response?.data?.error || error.message;
          setAlertMessage(errorMessage);
          setAlertType('danger');
        });
    }
  }, [auth.status, auth.loading, navigate]);

  useEffect(() => {
    // Initialize DataTable after vehicles data is fetched
    if (vehicles.length) {
      const datatable= $('#vehiclesTable').DataTable();
      datatable.destroy(); // Destroy the DataTable instance before reinitializing
      $('#vehiclesTable').DataTable({order: []}); // Initialize DataTable with sorting on the first column
    }
  }, [vehicles]);

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

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/vehicle/all', { withCredentials: true });
      setVehicles(response.data);
    } catch (error) {
      setAlertMessage('Error fetching vehicles: ' + (error.response?.data?.message || error.message));
      setAlertType('danger');
    } finally {
      setIsLoading(false);
      
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
          const vehicles = results.data;
          try {
            await axios.post('http://localhost:3001/api/vehicle/upload', { vehicles }, { withCredentials: true });
            setAlertMessage('Vehicle Data uploaded successfully');
            setAlertType('success');
          } catch (error) {
            setAlertMessage('Error: ' + (error.response?.data?.message || error.message));
            setAlertType('danger');
          } finally {
            fetchVehicles();
            setTimeout(() => navigate(0), 3000);
          }
        },
        error: (error) => {
          setAlertMessage('Error parsing CSV file: ' + error.message);
          setAlertType('danger');
        }
      });
    }
  };

  const handleDelete = async (vehicleId, vehicleCarPlateNumber) => {
    if (window.confirm(`Are you sure you want to delete or reject this "${vehicleCarPlateNumber}"?`)) {
      try {
        await axios.delete(`http://localhost:3001/api/vehicle/${vehicleId}`, { withCredentials: true });
        setAlertMessage('Vehicle deleted/rejected successfully');
        setAlertType('success');
        fetchVehicles();
        setTimeout(() => navigate(0), 3000);
      } catch (error) {
        setAlertMessage('Error deleting vehicle: ' + (error.response?.data?.message || error.message));
        setAlertType('danger');
      }
    }
  };

  const handleApprove = async (vehicleId, vehicleCarPlateNumber) => {
    try {
      await axios.put(`http://localhost:3001/api/vehicle/approve/${vehicleId}`, {}, { withCredentials: true });
      setAlertMessage(`Vehicle plate number ${vehicleCarPlateNumber} approved successfully`);
      setAlertType('success');
    } catch (error) {
      setAlertMessage('Error approving vehicle: ' + (error.response?.data?.message || error.message));
      setAlertType('danger');
    } finally {
      fetchVehicles();
      setTimeout(() => navigate(0), 3000);
    }
  };

  

  return (
    <div className="container mt-4">
      <h1>Vehicle Management</h1>
        {/* Bootstrap dismissible alert */}
        {alertMessage && (
          <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
            {alertMessage}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => navigate(0)}></button>
          </div>
        )}
      <div>{/* Added to solve Datatables rendering issue */}
        <table id="vehiclesTable" className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Username</th>
              <th>Contact Number</th>
              <th>Building Information</th>
              <th>Owner Request</th>
              <th>Car Plate Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>
                {vehicle.ownerName} (
                  {vehicle.ownerPermissions.owner
                    ? 'Owner'
                    : vehicle.ownerPermissions.tenant
                    ? 'Tenant'
                    : 'N/A'}
                  )
              </td>
              <td>{vehicle.ownerContact}</td>
              <td>
                {vehicle.ownerBuilding.map((building, index) => (
                  <div key={index}>
                    {building.block}-{building.level}-{building.unit}
                  </div>
                ))}
              </td>
              <td>{vehicle.ownerComments}</td>
              <td>{vehicle.carPlateNumber}</td>
              <td>
                {vehicle.approvalStatus ? (
                  <button onClick={() => handleDelete(vehicle.id, vehicle.carPlateNumber)} className="btn btn-danger btn-sm me-2 mt-2">
                        🗑️ Delete
                  </button>
                    ) : (
                  <div>
                    <button onClick={() => handleApprove(vehicle.id, vehicle.carPlateNumber)} className="btn btn-success btn-sm me-2 mt-2">
                          ✅ Approve
                    </button>
                    <button onClick={() => handleDelete(vehicle.id, vehicle.carPlateNumber)}className="btn btn-warning btn-sm me-2 mt-2">                   
                          ❌ Reject
                    </button>
                  </div>)}
              </td>
            </tr>))}          
          </tbody>
        </table>
      </div>
    
    <h4 className="mt-4">Bulk Upload Vehicle CSV</h4>
      <div className="input-group mb-4">
        <input type="file" className="form-control" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleFileUpload} className="btn btn-success">Upload</button>
      </div>
    </div>
  )
}

export default VehicleManagement
