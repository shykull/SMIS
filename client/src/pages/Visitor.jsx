import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Table, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';

function Visitor() {
  const [visitors, setVisitors] = useState([]);
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
    fetchVisitors();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    setFormData({
      visitorName: visitor.visitorName,
      visitorCar: visitor.carPlateNumber,
      visitStartDate: visitor.visitStartDate,
      visitEndDate: visitor.visitEndDate
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

  return (
    <Container className="mt-4">
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
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formLeavingDateTime">
                <Form.Label>Leaving Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="visitEndDate"
                  value={formData.visitEndDate}
                  onChange={handleInputChange}
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
            <th>Visitor Name</th>
            <th>Car Plate Number</th>
            <th>Visiting Date & Time</th>
            <th>Leaving Date & Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((visitor) => (
            <tr key={visitor.id}>
              <td>{visitor.visitorName}</td>
              <td>{visitor.carPlateNumber}</td>
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
    </Container>
  );
}

export default Visitor;