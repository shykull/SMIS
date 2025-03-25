import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Table, Modal } from 'react-bootstrap';
import { AuthContext } from '../helpers/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';

function VehicleManagement() {
  const { auth } = useContext(AuthContext); // Access auth context
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const [vehicle, setVehicles] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState({
    owner_car: ''
  });

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
            fetchVechicles();
            fetchVehicleSetting();
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

  return (
    <div>
        <h1>Vehicle Management</h1>
      
    </div>
  )
}

export default VehicleManagement
