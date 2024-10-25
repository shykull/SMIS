import React, { useContext} from 'react';
import { Link } from 'react-router-dom';
import {AuthContext} from '../helpers/AuthContext'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Navbar() {

  const {auth,setAuth} = useContext(AuthContext);
  const navigate = useNavigate();

  

  const handleLogout = () => {
    
    axios.post('http://localhost:3001/api/user/logout', {}, { withCredentials: true })
      .then(() => {
        // Clear the JWT token cookie by setting its expiry date to the past
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        
        setAuth({ status: false, user: null, id:0, loading: false });
        // Redirect to login page
        navigate('/login');
      })
      .catch(error => {
        console.error('Logout failed:', error);
      });
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Navbar</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" aria-current="page" to="/">Home</Link>
            </li>
        
            {!auth.status ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
              </>
              
            ) : (
              <>
                <li className="nav-item dropdown">
                  <span className="nav-link dropdown-toggle" data-bs-toggle="dropdown" >Hello, {auth.user}</span>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/profile">Profile</Link>
                    </li>
                    <li><hr className="dropdown-divider"/></li>
                    
                    <li className="nav-item">
                      <Link className="dropdown-item" onClick={handleLogout}>Logout</Link>
                    </li>

                  </ul>
                </li>
              </>
            )}
          </ul>
          
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
