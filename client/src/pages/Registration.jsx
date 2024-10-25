import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Registration() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');

    // State to track password validation rules
    const [passwordValidation, setPasswordValidation] = useState({
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        hasMinLength: false,
    });

    const initialValues = {
        username: "",
        password: "",
        repassword: "",
    };

    // Validation schema for username and repassword
    const validationSchema = Yup.object().shape({
        username: Yup.string()
            .min(3, "Username must be at least 3 characters")
            .max(15, "Username must be 15 characters or less")
            .required("Username is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
        repassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Retype password is required'),
    });

    // Password validation handler
    const handlePasswordChange = (value) => {
        const rules = {
            hasUppercase: /[A-Z]/.test(value),
            hasLowercase: /[a-z]/.test(value),
            hasNumber: /\d/.test(value),
            hasSpecialChar: /[@$!%*?&]/.test(value),
            hasMinLength: value.length >= 6,
        };
        setPasswordValidation(rules);
    };

    const onSubmit = (data) => {
        axios.post("http://localhost:3001/api/user", data)
        .then((response) => {
            
            navigate("/login"); // Redirect on success
        })
        .catch((error) => {
            if (error.response && error.response.data) {
                setServerError(error.response.data.error); // Display the error from the server
            }
        });
    }

    return (
        <div>
            <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                {({ values, handleChange }) => (
                    <Form className='container mt-3'>
                        <h1 className="mb-3">Register</h1>

                        <ErrorMessage name="username" component="span" className="text-danger" />
                        {serverError && <div className="alert alert-danger">{serverError}</div>} {/* Show server error */}   
                        <div className="input-group mb-3">   
                            <span className="input-group-text">Username</span>
                            <Field className="form-control" id="inUsername" name="username" placeholder="Username" />
                        </div>

                        <ErrorMessage name="password" component="span" className="text-danger" />
                        <div className="input-group mb-3">
                            <span className="input-group-text">Password</span>
                            <Field
                                className="form-control"
                                type='password'
                                id="inUserPass"
                                name="password"
                                placeholder="Password"
                                value={values.password}
                                onChange={(e) => {
                                    handleChange(e);
                                    handlePasswordChange(e.target.value);
                                }}
                            />
                        </div>

                        {/* Password Requirements */}
                        <div className="mb-3">
                            <ul className="list-unstyled">
                                <li style={{ color: passwordValidation.hasUppercase ? 'green' : 'red' }}>
                                    At least one uppercase letter (A-Z)
                                </li>
                                <li style={{ color: passwordValidation.hasLowercase ? 'green' : 'red' }}>
                                    At least one lowercase letter (a-z)
                                </li>
                                <li style={{ color: passwordValidation.hasNumber ? 'green' : 'red' }}>
                                    At least one number (0-9)
                                </li>
                                <li style={{ color: passwordValidation.hasSpecialChar ? 'green' : 'red' }}>
                                    At least one special character (@, $, !, %, *, ?, &)
                                </li>
                                <li style={{ color: passwordValidation.hasMinLength ? 'green' : 'red' }}>
                                    At least 6 characters long
                                </li>
                            </ul>
                        </div>

                        <ErrorMessage name="repassword" component="span" className="text-danger" />
                        <div className="input-group mb-3">
                            <span className="input-group-text">Retype Password</span>
                            <Field className="form-control" type='password' id="inUserPass2" name="repassword" placeholder="Retype Password" />
                        </div>

                        <div className="d-grid gap-2 col-6 mx-auto">
                            <button type="submit" className="btn btn-primary">Register</button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default Registration;
