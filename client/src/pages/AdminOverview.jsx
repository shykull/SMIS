import React from 'react'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons';

function AdminOverview() {
  return (
    <div>
      <h1>Admin Overview</h1>

      <Link className="btn btn-secondary mt-3" to="/dashboard/annoucement-management"><FontAwesomeIcon icon={faVolumeHigh} size="xl" style={{ marginRight: '5px' }} />Announcement Management</Link>

    </div>
  )
}

export default AdminOverview
