import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Table, Modal } from 'react-bootstrap';
import { AuthContext } from '../helpers/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';

function Visitor() {
  const { auth } = useContext(AuthContext); // Access auth context
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [visitorSetting, setVisitorSetting] = useState({});
  const [userProfile, setUserProfile] = useState({});
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorCar: '',
    visitStartDate: '',
    visitEndDate: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editVisitorId, setEditVisitorId] = useState(null);

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
          fetchVisitors();
          fetchVisitorsSetting();
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
      const response = await axios.get('http://localhost:3001/api/visitor', { withCredentials: true });
      setVisitors(response.data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    }
  };

  const fetchVisitorsSetting = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/visitor/setting', { withCredentials: true });
      setVisitorSetting(response.data);
    } catch (error) {
      console.error('Error fetching Visitor Settings:', error);
    }
  };

  const handleVisitStartInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'visitStartDate') {
      const visitStartDate = new Date(value);
      const visitEndDate = new Date(value);
      visitEndDate.setHours(visitEndDate.getHours() + (visitorSetting.visit_hours)); // Default to 8 hours if not set

      // Ensure visitStartDate is not more than the allowed days from today's date
      const maxStartDate = new Date();
      maxStartDate.setDate(maxStartDate.getDate() + (visitorSetting.visit_days)); // Default to 7 days if not set
      if (visitStartDate > maxStartDate) {
        alert(`Visit start date cannot be more than the allowed ${visitorSetting.visit_days} days from today.`);
        setFormData({ ...formData, visitStartDate: '' });
        return;
      }

      setFormData({
        ...formData,
        visitStartDate: value,
        visitEndDate: new Date(visitEndDate.getTime() - visitEndDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVisitEndInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'visitEndDate') {
      const visitEndDate = new Date(value);
      const visitStartDate = new Date(formData.visitStartDate);

      // Ensure visitEndDate is not more than the allowed duration from visitStartDate
      const maxEndDate = new Date(visitStartDate);
      maxEndDate.setDate(maxEndDate.getDate() + (visitorSetting.visit_duration)); // Default to 7 days if not set
      if (visitEndDate > maxEndDate) {
        alert(`Visit end date cannot be more than the allowed ${visitorSetting.visit_duration} days from visit start date.`);
        setFormData({ ...formData, visitEndDate: '' });
        return;
      }

      setFormData({
        ...formData,
        [name]: new Date(visitEndDate.getTime() - visitEndDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:3001/api/visitor/${editVisitorId}`, formData, { withCredentials: true });
      } else {
        await axios.post('http://localhost:3001/api/visitor', formData, { withCredentials: true });
      }
      fetchVisitors();
      handleCloseModal();
    } catch (error) {
      console.error('Error registering visitor:', error);
    }
  };

  const handleEdit = (visitor) => {
    const visitStartDate = new Date(visitor.visitStartDate);
    const visitEndDate = new Date(visitor.visitEndDate);

    setFormData({
      visitorName: visitor.visitorName,
      visitorCar: visitor.visitorCar,
      visitStartDate: new Date(visitStartDate.getTime() - visitStartDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      visitEndDate: new Date(visitEndDate.getTime() - visitEndDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    });
    setEditVisitorId(visitor.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setFormData({
      visitorName: '',
      visitorCar: '',
      visitStartDate: '',
      visitEndDate: ''
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditVisitorId(null);
  };

  const getMinDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const getMaxStartDateTime = () => {
    if (!visitorSetting.visit_days) return '';
    const maxStartDate = new Date();
    maxStartDate.setDate(maxStartDate.getDate() + visitorSetting.visit_days);
    const offset = maxStartDate.getTimezoneOffset();
    const localDate = new Date(maxStartDate.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const getMaxEndDateTime = () => {
    if (!formData.visitStartDate || !visitorSetting.visit_duration) return '';
    const visitStartDate = new Date(formData.visitStartDate);
    const maxEndDate = new Date(visitStartDate.getTime() - visitStartDate.getTimezoneOffset() * 60000);
    maxEndDate.setDate(maxEndDate.getDate() + visitorSetting.visit_duration);
    const offset = maxEndDate.getTimezoneOffset();
    const localDate = new Date(maxEndDate.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <Container className="mt-4">
      {auth.permit.visitor ? (
        <div>
          <h1>Visits</h1>
          {visitors.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>📱 Contact Number</th>
                  <th>🏠 Owner Unit</th>
                  <th>📅 Visiting</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor.id}>
                    <td>{visitor.ownerName}</td>
                    <td>{visitor.ownerContact}</td>
                    {visitor.ownerBuilding && visitor.ownerBuilding.length > 0 ? (
                      <td>
                        {visitor.ownerBuilding.map((building, index) => (
                          <div key={index}>
                            {building.block}-{building.level}-{building.unit}
                          </div>
                        ))}
                      </td>
                    ) : (
                      <td>No building info</td>
                    )}
                    <td>{new Date(visitor.visitStartDate).toLocaleString()} ➡️ {new Date(visitor.visitEndDate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No upcoming visits.</p>
          )}
        </div>
      ) : (
        <div>
          <h1>Visitor Registration</h1>
          <Button variant="primary" onClick={handleShowModal}>
            Register Visitor
          </Button>

          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>{editMode ? 'Edit Visitor' : 'Register Visitor'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formVisitorName">
                    <Form.Label>Visitor Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="visitorName"
                      value={formData.visitorName}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="formCarPlateNumber">
                    <Form.Label>Car Plate Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="visitorCar"
                      value={formData.visitorCar}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formVisitingDateTime">
                    <Form.Label>Visiting Date & Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="visitStartDate"
                      value={formData.visitStartDate}
                      onChange={handleVisitStartInputChange}
                      min={getMinDateTime()}
                      max={getMaxStartDateTime()}
                      required
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="formLeavingDateTime">
                    <Form.Label>Leaving Date & Time (default {visitorSetting.visit_hours} hours) </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="visitEndDate"
                      value={formData.visitEndDate}
                      onChange={handleVisitEndInputChange}
                      min={formData.visitStartDate}
                      max={getMaxEndDateTime()}
                      required
                    />
                  </Form.Group>
                </Row>

                <Button variant="primary" type="submit">
                  {editMode ? 'Update Visitor' : 'Register Visitor'}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          <h2 className="mt-4">Visitors</h2>
          <Table id="visitorTable" striped bordered hover>
            <thead>
              <tr>
                <th className="text-center">Visitor Name</th>
                <th className="text-center">Car Plate Number</th>
                <th>Visiting Date & Time</th>
                <th>Leaving Date & Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => (
                <tr key={visitor.id}>
                  <td className="text-center">{visitor.visitorName}</td>
                  <td className="text-center">{visitor.visitorCar}</td>
                  <td>{new Date(visitor.visitStartDate).toLocaleString()}</td>
                  <td>{new Date(visitor.visitEndDate).toLocaleString()}</td>
                  <td>
                    <Button variant="warning" size="sm" onClick={() => handleEdit(visitor)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}

export default Visitor;