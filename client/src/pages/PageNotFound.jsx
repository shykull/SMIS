import React from 'react'
import { Link } from "react-router-dom";


function PageNotFound() {

  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <div className="error-container text-center p-5 shadow rounded">
        <h1 className="display-1 fw-bold text-danger">404</h1>
        <h2 className="mb-3">Oops! Page Not Found</h2>
        <p className="text-muted">
          The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <Link to="/" className="btn btn-primary">
          Go Back Home
        </Link>
      </div>
    </div>
  )
}

export default PageNotFound
