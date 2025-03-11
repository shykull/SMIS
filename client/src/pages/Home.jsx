import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import { Carousel, Card, Row, Col } from 'react-bootstrap';
import ProfilePicture from '../components/ProfilePicture';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";

function Home() {
  const { auth } = useContext(AuthContext); // Access auth context
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [alertMessage, setAlertMessage] = useState('');

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
                  fetchAnnouncements();
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

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/announce', { withCredentials: true });
      setAnnouncements(response.data.slice(0, 3)); // Get the latest 3 announcements
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  return (
    <div className="container mt-3">
      <div className="row justify-content-md-center mb-4">
        <ProfilePicture
            userProfile={userProfile}  // Passing the entire userProfile object
        />
      <div>
        <h1>  Hi, {userProfile.firstname} {userProfile.lastname}</h1>
      </div>
    </div>

    <div className='row'>
    <h3>Announcements</h3>

    <Link to="/annoucement"><Carousel className="mb-4">
        {announcements.map((announcement, index) => (
          <Carousel.Item key={index}>
            <Card>
            <Card.Body>
              <Card.Title>{announcement.title}</Card.Title>
              <Card.Text dangerouslySetInnerHTML={{ __html: announcement.content }}></Card.Text>
            </Card.Body>
            </Card>
          </Carousel.Item>
        ))}
      </Carousel></Link>
    </div>

      <Row className="g-4">
        <Col md={4}>
          <Link to="/visitor" className="text-decoration-none">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>👥 Visitor</Card.Title>
                <Card.Text>Manage your visitors.</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4}>
          <Link to="/facilities-booking" className="text-decoration-none">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>🗓️ Facilities Booking</Card.Title>
                <Card.Text>Book facilities easily.</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4}>
          <Link to="/bills" className="text-decoration-none">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>🧾 Bills</Card.Title>
                <Card.Text>View and pay your bills.</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4}>
          <Link to="/service-request" className="text-decoration-none">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>🛎️ Service Request</Card.Title>
                <Card.Text>Request for services.</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4}>
          <Link to="/feedback" className="text-decoration-none">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>🗳️ Feedback</Card.Title>
                <Card.Text>Give us your feedback.</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4}>
          <Link to="/house-rules" className="text-decoration-none">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>📖 House Rules</Card.Title>
                <Card.Text>Read the house rules.</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
}

export default Home;
