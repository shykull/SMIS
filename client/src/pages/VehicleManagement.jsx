import React, { useEffect, useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Container, Table } from 'react-bootstrap';
import { AuthContext } from '../helpers/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import Papa from 'papaparse';

function VehicleManagement() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const dataTableRef = useRef(null); // Ref for DataTable instance
  const [vehicles, setVehicles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
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
    // Initialize DataTable when vehicles data is loaded
    if (vehicles.length > 0) {
      // Destroy existing DataTable instance if it exists
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        $(tableRef.current).empty(); // Clear table contents
      }
      
      // Initialize new DataTable instance
      dataTableRef.current = $(tableRef.current).DataTable();
    }

    // Cleanup function
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
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
          }
        },
        error: (error) => {
          setAlertMessage('Error parsing CSV file: ' + error.message);
          setAlertType('danger');
        }
      });
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
    }
  };

  const handleDelete = async (vehicleId, vehicleCarPlateNumber) => {
    if (window.confirm(`Are you sure you want to delete or reject this "${vehicleCarPlateNumber}"?`)) {
      try {
        await axios.delete(`http://localhost:3001/api/vehicle/${vehicleId}`, { withCredentials: true });
        setAlertMessage('Vehicle deleted/rejected successfully');
        setAlertType('success');
        fetchVehicles();
      } catch (error) {
        setAlertMessage('Error deleting vehicle: ' + (error.response?.data?.message || error.message));
        setAlertType('danger');
      }
    }
  };

  return (
    <Container className="mt-4">
      {isLoading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="mt-3">Loading Vehicles...</h3>
        </div>
      ) : (
        <>
          <h1>Vehicle Management</h1>
          {alertMessage && (
            <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
              {alertMessage}
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close"
                onClick={() => setAlertMessage('')}
              ></button>
            </div>
          )}
          <Table
            ref={tableRef}
            id="vehicleTable"
            striped
            bordered
            hover
            className="mt-4"
          >
            <thead>
              <tr>
                <th>Owner (Permission)</th>
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
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(vehicle.id, vehicle.carPlateNumber)}
                      >
                        🗑️ Delete
                      </Button>
                    ) : (
                      <div>
                        <Button
                          variant="success"
                          className="me-2 mt-2"
                          size="sm"
                          onClick={() => handleApprove(vehicle.id, vehicle.carPlateNumber)}
                        >
                          ✅ Approve
                        </Button>
                        <Button
                          variant="warning"
                          className="me-2 mt-2"
                          size="sm"
                          onClick={() => handleDelete(vehicle.id, vehicle.carPlateNumber)}
                        >
                          ❌ Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {!isLoading && vehicles.length === 0 && (
            <div className="alert alert-info mt-4">No vehicles found</div>
          )}
          <h4 className="mt-4">Bulk Upload Vehicle CSV</h4>
          <div className="input-group mb-4">
            <input
              type="file"
              className="form-control"
              accept=".csv"
              onChange={handleFileChange}
            />
            <button onClick={handleFileUpload} className="btn btn-success">
              Upload
            </button>
          </div>
        </>
      )}
    </Container>
  );
}

export default VehicleManagement;