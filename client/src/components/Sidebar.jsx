import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressBook, faBars, faBuildingLock, faListCheck, faUsersGear, faVolumeHigh, faCar  } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function Sidebar() {
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
    <>
      {/* Button to toggle off-canvas */}
      
      <div className='mt-3 col-2'>
        <button 
          className="btn" 
          type="button" 
          data-bs-toggle="offcanvas" 
          data-bs-target="#offcanvasSidebar" 
          aria-controls="offcanvasSidebar"
        ><FontAwesomeIcon icon={faBars} size="2xl" style={{ marginRight: '5px' }} /> <b>Show Panel</b> 
        </button>   
      </div>

      {/* Off-canvas sidebar */}
      <div 
        className="offcanvas offcanvas-start" 
        tabIndex="-1" 
        id="offcanvasSidebar" 
        aria-labelledby="offcanvasSidebarLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasSidebarLabel">Admin Panel</h5>
          <button 
            type="button" 
            className="btn-close" 
            data-bs-dismiss="offcanvas" 
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/user-management"><FontAwesomeIcon icon={faUsersGear} size="xl" style={{ marginRight: '5px' }} />User Management</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/vehicle-management"><FontAwesomeIcon icon={faCar} size="xl" style={{ marginRight: '5px' }} />Vehicle Management
              {pendingVehicleApprovals > 0 && (
                  <span className="badge bg-danger ms-2">{pendingVehicleApprovals}</span>
                )}
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/annoucement-management"><FontAwesomeIcon icon={faVolumeHigh} size="xl" style={{ marginRight: '5px' }} />Annoucement Management</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/property-management"><FontAwesomeIcon icon={faBuildingLock} size="xl" style={{ marginRight: '5px' }} />Property Management</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/visitor-management"><FontAwesomeIcon icon={faAddressBook} size="xl" style={{ marginRight: '5px' }} />Visitor Management</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/task-management"><FontAwesomeIcon icon={faListCheck} size="xl" style={{ marginRight: '5px' }} />Task Management</Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
