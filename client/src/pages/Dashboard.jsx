import React, { useState, useContext, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; // Adjust the path as needed
import { AuthContext } from '../helpers/AuthContext';
import axios from "axios";
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import PropertyManagement from './PropertyManagement';
import TaskManagement from './TaskManagement';
import VisitorManagement from './VisitorManagement';
import AdminOverview from './AdminOverview';

function Dashboard() {
  const { auth } = useContext(AuthContext); // Access auth context
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const [alertMessage, setAlertMessage] = useState('');

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
              })
              .catch((error) => {
                  // Improved error handling: Checking for both response data and fallback to a message
              const errorMessage = error.response && error.response.data && error.response.data.error
              ? error.response.data.error
              : error.message;
          
              setAlertMessage( errorMessage); // Display error
              });
    }
  }, [auth.status, auth.loading, navigate]);

  return (
    <div className="d-flex">
      {/* Bootstrap dismissible alert */}
      {alertMessage && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {alertMessage}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setAlertMessage('')}></button>
        </div>
      )}

      <Sidebar />
      <div className="container-fluid col-10 mt-3">
        <Routes>
          <Route path="" element={<AdminOverview />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="property-management" element={<PropertyManagement />} />
          <Route path="visitor-management" element={<VisitorManagement />} />
          <Route path="task-management" element={<TaskManagement />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;
