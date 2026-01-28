import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import axios from "axios";
import { Card, Button, Form, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

function AccountingSettings() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [settings, setSettings] = useState({
    lateInterestRate: 0,
    managementRate: 0,
    utilitiesRate: 0,
    facilitiesBookingRate: 0,
    waterRate: 0,
    taxRate: 0,
  });
  const [originalSettings, setOriginalSettings] = useState({});

  useEffect(() => {
    if (auth.loading) {
      return;
    }

    if (!auth.status) {
      navigate('/login');
    } else {
      axios.get('http://localhost:3001/api/user/status', { withCredentials: true })
        .then((response) => {
          setUserProfile(response.data.user);
          handlePermission(response.data.user.Permission);
          fetchAccountingSettings();
        })
        .catch((error) => {
          const errorMessage = error.response && error.response.data && error.response.data.error
            ? error.response.data.error
            : error.message;
          setAlertMessage(errorMessage);
          setAlertType('danger');
        });
    }
  }, [auth.status, auth.loading, navigate]);

  const handlePermission = (permission) => {
    const allowedRoles = ['sys_admin', 'prop_manager'];
    const hasPermission = allowedRoles.some(role => permission[role]);
    if (!hasPermission) {
      navigate('/');
    }
  };

  const fetchAccountingSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/accounting/settings', { 
        withCredentials: true 
      });
      
      if (response.data && response.data.length > 0) {
        const settingsData = response.data[0];
        setSettingsId(settingsData.id);
        setSettings({
          lateInterestRate: settingsData.lateInterestRate,
          managementRate: settingsData.managementRate,
          utilitiesRate: settingsData.utilitiesRate,
          facilitiesBookingRate: settingsData.facilitiesBookingRate,
          waterRate: settingsData.waterRate,
          taxRate: settingsData.taxRate,
        });
        setOriginalSettings({...settingsData});
      }
      setLoading(false);
    } catch (error) {
      setAlertMessage('Error fetching accounting settings: ' + (error.response?.data?.message || error.message));
      setAlertType('danger');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: parseFloat(value) || 0
    });
  };

  const handleSave = async () => {
    try {
      if (!settingsId) {
        // Create new settings if it doesn't exist
        await axios.post('http://localhost:3001/api/accounting/settings', 
          {
            ...settings,
            lastUpdatedBy: userProfile.firstname + ' ' + userProfile.lastname
          },
          { withCredentials: true }
        );
      } else {
        // Update existing settings
        await axios.put(`http://localhost:3001/api/accounting/settings/${settingsId}`,
          {
            ...settings,
            lastUpdatedBy: userProfile.firstname + ' ' + userProfile.lastname
          },
          { withCredentials: true }
        );
      }
      
      setAlertMessage('Accounting settings saved successfully!');
      setAlertType('success');
      setIsEditing(false);
      setTimeout(() => setAlertMessage(''), 3000);
      fetchAccountingSettings();
    } catch (error) {
      setAlertMessage('Error saving settings: ' + (error.response?.data?.message || error.message));
      setAlertType('danger');
    }
  };

  const handleCancel = () => {
    setSettings(originalSettings);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <h1 className="mb-4">
        <FontAwesomeIcon icon={faExclamationCircle} style={{ marginRight: '10px' }} />
        Accounting Settings
      </h1>

      {/* Alert Messages */}
      {alertMessage && (
        <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
          {alertType === 'success' ? (
            <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '10px' }} />
          ) : (
            <FontAwesomeIcon icon={faExclamationCircle} style={{ marginRight: '10px' }} />
          )}
          {alertMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAlertMessage('')}
          ></button>
        </div>
      )}

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <Card.Title className="mb-0">Rate Configuration</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        Late Interest Rate (%)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="lateInterestRate"
                        value={settings.lateInterestRate}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        step="0.01"
                        min="0"
                        max="100"
                        className={isEditing ? 'is-editable' : ''}
                      />
                      <Form.Text className="text-muted">
                        Applied to overdue payments
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        Management Rate
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="managementRate"
                        value={settings.managementRate}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        step="0.01"
                        min="0"
                        className={isEditing ? 'is-editable' : ''}
                      />
                      <Form.Text className="text-muted">
                        Monthly management fee
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        Utilities Rate
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="utilitiesRate"
                        value={settings.utilitiesRate}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        step="0.01"
                        min="0"
                        className={isEditing ? 'is-editable' : ''}
                      />
                      <Form.Text className="text-muted">
                        Monthly utilities fee
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        Facilities Booking Rate
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="facilitiesBookingRate"
                        value={settings.facilitiesBookingRate}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        step="0.01"
                        min="0"
                        className={isEditing ? 'is-editable' : ''}
                      />
                      <Form.Text className="text-muted">
                        Facilities booking charge
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        Water Rate
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="waterRate"
                        value={settings.waterRate}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        step="0.01"
                        min="0"
                        className={isEditing ? 'is-editable' : ''}
                      />
                      <Form.Text className="text-muted">
                        Water billing rate per unit
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        Tax Rate (%)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="taxRate"
                        value={settings.taxRate}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        step="0.01"
                        min="0"
                        max="100"
                        className={isEditing ? 'is-editable' : ''}
                      />
                      <Form.Text className="text-muted">
                        Applied to applicable charges
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <Card.Title className="mb-0">Actions</Card.Title>
            </Card.Header>
            <Card.Body>
              {!isEditing ? (
                <Button 
                  variant="primary" 
                  className="w-100 mb-3"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Settings
                </Button>
              ) : (
                <>
                  <Button 
                    variant="success" 
                    className="w-100 mb-2"
                    onClick={handleSave}
                  >
                    <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} />
                    Save Changes
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-100"
                    onClick={handleCancel}
                  >
                    <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} />
                    Cancel
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-3">
            <Card.Header className="bg-secondary text-white">
              <Card.Title className="mb-0">Summary</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="small">
                <p><strong>Status:</strong> <span className="badge bg-success">Active</span></p>
                <p><strong>Last Updated:</strong> {originalSettings.lastUpdatedBy || 'System'}</p>
                <p className="text-muted">
                  All rates are configured and ready for use in transaction calculations.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AccountingSettings;
