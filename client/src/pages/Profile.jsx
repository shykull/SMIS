import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import ProfilePicture from '../components/ProfilePicture';
import axios from "axios";

function Profile() {
    const { auth } = useContext(AuthContext); // Access auth context
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState({});
    const [alertMessage, setAlertMessage] = useState('');
    const [password, setPassword] = useState(''); // New state for password
  
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
                })
                .catch((error) => {
                    // Improved error handling: Checking for both response data and fallback to a message
                const errorMessage = error.response && error.response.data && error.response.data.error
                ? error.response.data.error
                : error.message;
            
                setAlertMessage( errorMessage); // Display error
                });
      }
    }, [auth.status, auth.loading, navigate]);
  
    const handleSave = async () => {
        try {
          // Send updated profile data to backend API
          const updatedProfile = { ...userProfile };
          if (password) {
            updatedProfile.password = password; // Include password if provided
          }
          const response = await axios.put('http://localhost:3001/api/user/profile', updatedProfile, { withCredentials: true });
          
          // Optionally update local userProfile with the response
          setUserProfile(response.data);
          navigate('/');
          
        } catch (error) {
          // Improved error handling: Checking for both response data and fallback to a message
          const errorMessage = error.response && error.response.data && error.response.data.error
          ? error.response.data.error
          : error.message;
      
          setAlertMessage( errorMessage); // Display error
        }
      };

      
    const handleChange = (e) => {
            const { name, value } = e.target;
            if (name === 'password') {
              setPassword(value); // Handle password change
            } else {
              setUserProfile((prevProfile) => ({
                ...prevProfile,
                [name]: value
              }));
            }
        };
  
    const handleFileChange = async (file) => {
    // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('profilePicture', file);
        formData.append('id', userProfile.id);

        try {
            const response = await axios.put('http://localhost:3001/api/user/profile', formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            });
            setUserProfile(response.data.user);
            // Update the userProfile state with the new profile picture path if needed
        } catch (error) {
            console.error('Error updating profile picture:', error);
        }
    };

    return (
      <div className="container mt-3">

        <h2 className="text-center mb-4">{userProfile.username}</h2>
      
      <div className="text-center mb-4">
        <ProfilePicture
            userProfile={userProfile}  // Passing the entire userProfile object
            handleFileChange={handleFileChange}  // Passing the function reference
        />
      </div>
      
      {/* Bootstrap dismissible alert */}
      {alertMessage && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {alertMessage}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setAlertMessage('')}></button>
        </div>
      )}

      <form className="row g-3">
        <div className="col-md-6">
          <label className="form-label">First Name</label>
          <input
            type="text"
            name="firstname"
            value={userProfile.firstname}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            name="lastname"
            value={userProfile.lastname}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Contact</label>
          <input
            type="text"
            name="contact"
            value={userProfile.contact}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">E-mail</label>
          <input
            type="text"
            name="email"
            value={userProfile.email}
            onChange={handleChange}       
            className="form-control"
          />
        </div>

        <div className="col-md-12">
        <label className="form-label">Address</label>
            <textarea
                name="address"
                value={userProfile.address}
                onChange={handleChange}
                className="form-control"
                rows="3"  // Specifies 3 lines for the text area
            />
        </div>

        <div className="col-md-12">
          <label className="form-label">Change Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="d-grid gap-2 col-6 mx-auto">
        
          <button type="button" onClick={handleSave} className="btn btn-primary mt-3">Save</button>
        
        </div>
      </form>
        
        
  
      </div>
    );
}

export default Profile;
