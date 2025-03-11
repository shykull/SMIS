import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format, differenceInDays  } from 'date-fns';

function Annoucement() {
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/announce', { withCredentials: true });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/annoucement/${id}`, { target: '_blank' });
  };

    const renderDate = (date) => {
      const daysDifference = differenceInDays(new Date(), new Date(date));
      if (daysDifference > 7) {
        return format(new Date(date), 'MMMM d, yyyy');
      }
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

  return (
    <Container className="mt-4">
      <h1>All Announcements</h1>
      <Row>
        {announcements.map((announcement, index) => (
          <Col md={4} key={index} className="mb-4">
            <Card onClick={() => handleCardClick(announcement.id)} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <Card.Title>{announcement.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {renderDate(announcement.createdAt)}
                </Card.Subtitle>
                <Card.Text dangerouslySetInnerHTML={{ __html: announcement.content }}></Card.Text>
                {announcement.attachment && (
                  <Card.Link href={announcement.attachment} target="_blank" rel="noopener noreferrer">
                    View Attachment
                  </Card.Link>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Annoucement;