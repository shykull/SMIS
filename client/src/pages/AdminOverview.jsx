import React, { useEffect, useState }from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Row,Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressBook, faBars, faBuildingLock, faListCheck, faUsersGear, faVolumeHigh, faCar } from '@fortawesome/free-solid-svg-icons';

function AdminOverview() {
   const [pendingVehicleApprovals, setVehiclePendingApprovals] = useState(0);

   useEffect(() => {
    fetchVehiclePendingApprovals();
  }, []);

  // Fetch the count of pending approvals
  const fetchVehiclePendingApprovals = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/vehicle/pending-count', { withCredentials: true });
      setVehiclePendingApprovals(response.data.count);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  return (
    <div>
      <h1>Admin Overview</h1>
      <Row>
        <Col>
          <Link className="btn btn-primary col-5 me-2 mt-1" to="/dashboard/user-management"><FontAwesomeIcon icon={faUsersGear} size="xl" style={{ marginRight: '5px' }} />User Management</Link>
          <Link className="btn btn-primary col-5 me-2 mt-1" to="/dashboard/annoucement-management"><FontAwesomeIcon icon={faVolumeHigh} size="xl" style={{ marginRight: '5px' }} />Announcement Management</Link>
          <Link className="btn btn-primary col-5 me-2 mt-1" to="/dashboard/vehicle-management"><FontAwesomeIcon icon={faCar} size="xl" style={{ marginRight: '5px' }} />Vehicle Management
            {pendingVehicleApprovals > 0 && (
              <span className="badge bg-danger ms-2">{pendingVehicleApprovals}</span>
            )}
          </Link>
          <Link className="btn btn-primary col-5 me-2 mt-1" to="/dashboard/property-management"><FontAwesomeIcon icon={faBuildingLock} size="xl" style={{ marginRight: '5px' }} />Property Management</Link>
          <Link className="btn btn-primary col-5 me-2 mt-1" to="/dashboard/visitor-management"><FontAwesomeIcon icon={faAddressBook} size="xl" style={{ marginRight: '5px' }} />Visitor Management</Link>
          <Link className="btn btn-primary col-5 me-2 mt-1" to="/dashboard/task-management"><FontAwesomeIcon icon={faListCheck} size="xl" style={{ marginRight: '5px' }} />Task Management</Link>
        </Col>
      </Row>
    </div>

  )
}

export default AdminOverview
