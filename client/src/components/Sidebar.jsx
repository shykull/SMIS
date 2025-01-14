import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
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
              <Link className="nav-link" to="/dashboard/user-management">User Management</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/property-management">Property Management</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/visitor-management">Visitor Management</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/task-management">Task Management</Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
