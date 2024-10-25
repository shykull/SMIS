import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';


function Home() {

  const { auth } = useContext(AuthContext); // Access auth context
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.loading) {
      // While checking auth status, do nothing or show a loader
      return;
    }

    if (!auth.status) {
      // If not authenticated, redirect to login
      navigate('/login');
    } else {
      
    }
  }, [auth.status, auth.loading, navigate]);


  return (
    <div className="container mt-3">

    </div>
  );
}

export default Home;
