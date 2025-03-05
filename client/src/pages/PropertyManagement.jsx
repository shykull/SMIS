import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'; // Import Bootstrap DataTables CSS
import "datatables.net";
import "datatables.net-bs5"; // Import Bootstrap integration for DataTables
import Papa from 'papaparse'; // Import PapaParse for CSV parsing

function PropertyManagement() {
  const [selectedFile, setSelectedFile] = useState(null); // State to store the selected file
  // State to handle alert visibility, message, and type
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(''); // New state for alert type

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      Papa.parse(selectedFile, {
        header: true,
        complete: async (results) => {
          const builds = results.data;
          try {
            const response = await axios.post('http://localhost:3001/api/build/upload', { builds }, { withCredentials: true });
            setAlertMessage('Units uploaded successfully');
            setAlertType('success'); // Set alert type to success
           //fetchBuilding();
          } catch (error) {
            setAlertMessage('Error: ' + (error.response?.data?.message || error.message));
            setAlertType('danger'); // Set alert type to danger
          }
        },
        error: (error) => {
          setAlertMessage('Error parsing CSV file: ' + error.message);
          setAlertType('danger'); // Set alert type to danger
        }
      });
    }
  };

  return (
    <div className="container mt-4">
      <h1>Property Management</h1>
      {/* Bootstrap dismissible alert */}
      {alertMessage && (
        <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
          {alertMessage}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setAlertMessage('')}></button>
        </div>
      )}

      <h4 className="mt-4">Bulk Upload Units CSV</h4>
      <div className="input-group mb-4">
        <input type="file" className="form-control" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleFileUpload} className="btn btn-success">Upload</button>
      </div>

    </div>
  )
}

export default PropertyManagement

