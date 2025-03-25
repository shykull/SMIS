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

function VisitorManagement() {
  const { auth } = useContext(AuthContext); // Access auth context
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const [visitors, setVisitors] = useState([]);
  const [visitorSetting, setVisitorSetting] = useState({});
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState({
    visit_days: '',
    visit_hours: '',
    visit_duration: ''
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
            fetchVisitors();
            fetchVisitorsSetting();
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

  useEffect(() => {
    if (visitors.length) {
      $('#visitorTable').DataTable();
    }
  }, [visitors]);

  const fetchVisitors = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/visitor/all', { withCredentials: true });
      setVisitors(response.data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    }
  };

  const fetchVisitorsSetting = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/visitor/setting', { withCredentials: true });
      setVisitorSetting(response.data);
      setSettingsFormData(response.data);
    } catch (error) {
      console.error('Error fetching Visitor Settings:', error);
    }
  };

  const handleSettingsInputChange = (e) => {
    const { name, value } = e.target;
    setSettingsFormData({ ...settingsFormData, [name]: value });
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:3001/api/visitor/setting', settingsFormData, { withCredentials: true });
      fetchVisitorsSetting();
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleShowSettingsModal = () => setShowSettingsModal(true);
  const handleCloseSettingsModal = () => setShowSettingsModal(false);

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
    <Container className="mt-4">
      <h1>Visitor Management</h1>
      <Button variant="primary" onClick={handleShowSettingsModal}>
        Update Settings
      </Button>

      <Table id="visitorTable" striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Owner Name</th>
            <th>Owner Contact</th>
            <th>Owner Building</th>
            <th>Visitor Name</th>
            <th>Visitor Contact</th>
            <th>Visitor Car</th>
            <th>Visit Start Date</th>
            <th>Visit End Date</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((visitor) => (
            <tr key={visitor.id}>
              <td>{visitor.ownerName}</td>
              <td>{visitor.ownerContact}</td>
              <td>
                {visitor.ownerBuilding.map((building, index) => (
                  <div key={index}>
                    {building.block}-{building.level}-{building.unit}
                  </div>
                ))}
              </td>
              <td>{visitor.visitorName}</td>
              <td>{visitor.visitorContact}</td>
              <td>{visitor.visitorCar}</td>
              <td>{new Date(visitor.visitStartDate).toLocaleString()}</td>
              <td>{new Date(visitor.visitEndDate).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showSettingsModal} onHide={handleCloseSettingsModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Visitor Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSettingsSubmit}>
            <Form.Group controlId="formVisitDays">
              <Form.Label>Visit Days</Form.Label>
              <Form.Control
                type="number"
                name="visit_days"
                value={settingsFormData.visit_days}
                onChange={handleSettingsInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formVisitHours" className="mt-3">
              <Form.Label>Visit Hours</Form.Label>
              <Form.Control
                type="number"
                name="visit_hours"
                value={settingsFormData.visit_hours}
                onChange={handleSettingsInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formVisitDuration" className="mt-3">
              <Form.Label>Visit Duration</Form.Label>
              <Form.Control
                type="number"
                name="visit_duration"
                value={settingsFormData.visit_duration}
                onChange={handleSettingsInputChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3">
              Update Settings
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default VisitorManagement;
