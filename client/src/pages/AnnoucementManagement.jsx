import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import axios from 'axios';
import { Button, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'; // Import Bootstrap DataTables CSS
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import { stripHtml } from '../helpers/stripHtml';

function AnnoucementManagement() {
  const { auth } = useContext(AuthContext); // Access auth context
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', title: '', content: '', attachFile: null });
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');

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
            fetchAnnouncements();
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
    if (announcements.length) {
      $('#announcementTable').DataTable();
    }
  }, [announcements]);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/announce', { withCredentials: true });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };
  
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

  const handleShowModal = (announcement = { id: '', title: '', content: '', attachFile: null }) => {
    setFormData(announcement);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ id: '', title: '', content: '', attachFile: null });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleContentChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachFile: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    if (formData.attachFile) {
      formDataToSend.append('attachFile', formData.attachFile);
    }

    try {
      if (formData.id) {
        await axios.put(`http://localhost:3001/api/announce/${formData.id}`, formDataToSend, { withCredentials: true });
        setAlertMessage('Announcement updated successfully');
        setAlertType('success');
      } else {
        await axios.post('http://localhost:3001/api/announce', formDataToSend, { withCredentials: true });
        setAlertMessage('Announcement created successfully');
        setAlertType('success');
      }
      fetchAnnouncements();
      handleCloseModal();
    } catch (error) {
      setAlertMessage('Error: ' + (error.response?.data?.message || error.message));
      setAlertType('danger');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this announcement?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/announce/${id}`, { withCredentials: true });
      setAlertMessage('Announcement deleted successfully');
      setAlertType('success');
      fetchAnnouncements();
    } catch (error) {
      setAlertMessage('Error: ' + (error.response?.data?.message || error.message));
      setAlertType('danger');
    }
  };

  const truncateContent = (content) => {
    const strippedContent = stripHtml(content);
    const lines = strippedContent.split('\n');
    return lines.slice(0, 2).join('\n');
  };

  return (
    <div className="container mt-4">
      <h1>Announcement Management</h1>
      {alertMessage && (
        <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
          {alertMessage}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setAlertMessage('')}></button>
        </div>
      )}
      <Button className="mb-3" variant="primary" onClick={() => handleShowModal()}> <FontAwesomeIcon icon={faVolumeHigh} size="lg" style={{ marginRight: '5px' }} /> Create Announcement</Button>
      <table id="announcementTable" className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Title</th>
            <th>Content</th>
            <th>Attachment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((announcement) => (
            <tr key={announcement.id}>
              <td>{announcement.title}</td>
              <td>{truncateContent(announcement.content)}</td>
              <td>{announcement.attachment}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleShowModal(announcement)}>Edit</Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleDelete(announcement.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? 'Edit Announcement' : 'Create Announcement'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <ReactQuill
                value={formData.content}
                onChange={handleContentChange}
                modules={{
                  toolbar: [
                    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                    [{size: []}],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                    ['image', 'video'],
                    ['clean']
                  ],
                }}
                formats={[
                  'header', 'font', 'size',
                  'bold', 'italic', 'underline', 'strike', 'blockquote',
                  'list', 'bullet', 'indent',
                  'image', 'video'
                ]}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Attachment</Form.Label>
              <Form.Control
                type="file"
                name="attachFile"
                onChange={handleFileChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {formData.id ? 'Update' : 'Create'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default AnnoucementManagement;