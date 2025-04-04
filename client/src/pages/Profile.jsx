import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import ProfilePicture from '../components/ProfilePicture';
import axios from "axios";

function Profile() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Initialize state with default structure
    const [userProfile, setUserProfile] = useState({
        username: '',
        Buildings: [],
        Vehicles: [],
        Permission: {},
        firstname: '',
        lastname: '',
        contact: '',
        email: '',
        address: '',
        carPlateNumber: '',
        ownerComments: ''
    });
    
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('danger');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (auth.loading) return;

        if (!auth.status) {
            navigate('/login');
        } else {
            fetchProfile();
        }
    }, [auth.status, auth.loading, navigate]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/user/status', { 
                withCredentials: true 
            });
            setUserProfile({
                ...response.data.user,
                Buildings: response.data.user.Buildings || [],
                Vehicles: response.data.user.Vehicles || [],
                Permission: response.data.user.Permission || {}
            });
            console.log(response.data.user);
        } catch (error) {
            handleError(error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const formData = userProfile;
                      
            if (password) {
                formData.append('password', password);
            }


            const response = await axios.put(
                'http://localhost:3001/api/user/profile',
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setUserProfile(prev => ({
                ...prev,
                ...response.data.user,
                Buildings: response.data.user.Buildings || []
            }));
            
            setAlertMessage('Profile updated successfully!');
            setAlertType('success');
            setPassword('');
            
            fetchProfile(); // Refresh profile data
            
            // Refresh auth status if needed
            setTimeout(() => setAlertMessage(''), 3000);

        } catch (error) {
            handleError(error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'password') {
            setPassword(value);
        } else {
            setUserProfile(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleFileChange = async (file) => {
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);
            formData.append('id', userProfile.id);

            const response = await axios.put(
                'http://localhost:3001/api/user/profile',
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setUserProfile(prev => ({
                ...prev,
                ...response.data.user
            }));
            
            setAlertMessage('Profile picture updated!');
            setAlertType('success');

        } catch (error) {
            handleError(error);
        }
    };

    const handleError = (error) => {
        const errorMessage = error.response?.data?.error || error.message +' : '+ (error.response?.data?.message || error.message);
        setAlertMessage(errorMessage);
        setAlertType('danger');
    };

    const getPermissionLabel = () => {
        const { Permission } = userProfile;
        return (
            Permission.owner ? 'Owner' :
            Permission.prop_manager ? 'Property Manager' :
            Permission.site_manager ? 'Site Manager' :
            Permission.sys_admin ? 'System Admin' :
            Permission.account ? 'Account Clerk' :
            Permission.admin ? 'Admin Clerk' :
            Permission.security ? 'Security' :
            Permission.tech ? 'Maintenance Technician' :
            Permission.tenant ? 'Tenant' :
            Permission.visitor ? 'Visitor' : 'Hacker'
        );
    };

    return (
        <div className="container mt-3">
            <h2 className="text-center mb-2">
                {userProfile.username} ({getPermissionLabel()})
            </h2>

            <h3 className="text-center mb-2">
                {userProfile.Buildings.length > 0 ? (
                    userProfile.Buildings.map((building, index) => (
                        <div key={index}>
                            {building.block}-{building.level}-{building.unit}
                        </div>
                    ))
                ) : (
                    <div className="text-muted"></div>
                )}
            </h3>

            <div className="text-center mb-4">
                <ProfilePicture
                    userProfile={userProfile}
                    handleFileChange={handleFileChange}
                />
            </div>

            {alertMessage && (
                <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
                    {alertMessage}
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setAlertMessage('')}
                    ></button>
                </div>
            )}

            <form className="row g-3" onSubmit={handleSave}>
                <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input
                        type="text"
                        name="firstname"
                        value={userProfile.firstname || ''}
                        onChange={handleChange}
                        className="form-control"
                        
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input
                        type="text"
                        name="lastname"
                        value={userProfile.lastname || ''}
                        onChange={handleChange}
                        className="form-control"
                        
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Contact Number</label>
                    <input
                        type="tel"
                        name="contact"
                        value={userProfile.contact || ''}
                        onChange={handleChange}
                        className="form-control"
                        pattern="[0-9]{8,12}"
                        
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={userProfile.email || ''}
                        onChange={handleChange}
                        className="form-control"
                        
                    />
                </div>

                <div className="col-12">
                    <label className="form-label">Address</label>
                    <textarea
                        name="address"
                        value={userProfile.address || ''}
                        onChange={handleChange}
                        className="form-control"
                        rows="3"
                    />
                </div>

                <div className="col-12">
                    <label className="form-label">New Password</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Leave blank to keep current password"
                        minLength="8"
                    />
                </div>
                {(!auth.permit.visitor) && (
                  <div className="row mt-4">
                    <div className="col-6">
                        <h4>Your Registered Vehicles</h4>
                        {userProfile.Vehicles.length > 0 ? (
                          userProfile.Vehicles.map((car, index) => (
                            car.approvalStatus && (
                            <div key={index}>
                                {car.carPlateNumber}
                            </div>
                            )
                          ))
                        ) : (
                            <div className="text-muted"></div>
                        )}
                        <h4 className="mt-2">Pending Approval</h4>
                        {userProfile.Vehicles.length > 0 ? (
                          userProfile.Vehicles.map((car, index) => (
                            !car.approvalStatus && (
                            <div key={index}>
                                {car.carPlateNumber}
                            </div>
                            )
                          ))
                        ) : (
                            <div className="text-muted"></div>
                        )} 
                    </div>
                    <div className="col-6">
                      <h4>New Vehicles Registration</h4>
                      <label className="form-label">Car Plate Number</label>
                      <input
                            type="text"
                            name="carPlateNumber"
                            onChange={handleChange}
                            className="form-control"
                            
                      />
                      <label className="form-label">Remarks</label>
                      <input
                            type="text"
                            name="ownerComments"
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Which vehicle needs to be removed if you have met your quota?"
                      />

                    </div>
                  </div>
                )}
               

                <div className="d-grid gap-2 col-6 mx-auto mt-4">
                    <button type="submit" className="btn btn-primary btn-lg">
                        Save Changes
                    </button>
                </div>
            </form>
            <hr></hr>
        </div>
    );
}

export default Profile;