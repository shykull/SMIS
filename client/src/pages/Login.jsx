import React , {useContext, useState} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {AuthContext} from '../helpers/AuthContext'

function Login() {
    const navigate = useNavigate();
    const {setAuth} = useContext(AuthContext);

    // State to handle alert visibility and message
    const [alertMessage, setAlertMessage] = useState('');

    const initialValues = {
        username: "",
        password: "",
    };

    const validationSchema = Yup.object().shape({
        username: Yup.string().required("Username is required"),
        password: Yup.string().required("Password is required"),
    });
    
    const onSubmit = (data) => {
        axios.post("http://localhost:3001/api/user/login", data, { withCredentials: true })  // Enable sending cookies
            .then((response) => {
                setAuth({ status: true, user: response.data.user.username, id: response.data.user.id, permit: response.data.user.Permission, loading: false});
                navigate("/"); // Redirect on success
            })
            .catch((error) => {
                setAuth({ status: false, user: null, id:0, permit: [], loading: false });
                
                // Improved error handling: Checking for both response data and fallback to a message
                const errorMessage = error.response && error.response.data && error.response.data.error
                    ? error.response.data.error
                    : error.message;
                
                    setAlertMessage( errorMessage); // Display error
            });
    };
    

    return (
        <div>
            <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                <Form className='container mt-3'>
                    <h1 className="mb-3">Login</h1>

                    {/* Bootstrap dismissible alert */}
                    {alertMessage && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            {alertMessage}
                            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setAlertMessage('')}></button>
                        </div>
                    )}

                    <ErrorMessage name="username" component="span" className="text-danger" />   
                    <div className="input-group mb-3">   
                        <span className="input-group-text">Username</span>
                        <Field className="form-control" id="username" name="username" placeholder="Username" />
                    </div>

                    <ErrorMessage name="password" component="span" className="text-danger" />
                    <div className="input-group mb-3">
                        <span className="input-group-text">Password</span>
                        <Field className="form-control" type='password' id="inUserPass" name="password" placeholder="Password" />
                    </div>

                    <div className="d-grid gap-2 col-6 mx-auto">
                        <button type="submit" className="btn btn-primary">Login</button>
                        <a href='/registration' className="btn btn-secondary">Register Here</a>
                    </div>
                </Form>
            </Formik>
        </div>
    );
}

export default Login;
