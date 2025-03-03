import React from 'react';
import Sidebar from '../components/Sidebar'; // Adjust the path as needed
import UserManagement from './UserManagement';
import { Routes, Route, Navigate } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="container-fluid col-10 mt-3">
        <Routes>
          {/*<Route path="/" element={<Navigate to="user-management" />} />*/} // TODO Admin Dashboard
          <Route path="user-management" element={<UserManagement />} />
          {/* <Route path="/dashboard/property-management" element={<PropertyManagement />} />
          <Route path="/dashboard/visitor-management" element={<VisitorManagement />} />
          <Route path="/dashboard/task-management" element={<TaskManagement />} /> */}
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;
