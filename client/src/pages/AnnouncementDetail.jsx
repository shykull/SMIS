import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';

function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/announce/${id}`, { withCredentials: true });
      setAnnouncement(response.data);
    } catch (error) {
      console.error('Error fetching announcement:', error);
    }
  };

  if (!announcement) {
    return <div>Loading...</div>;
  }

  const handleBackClick = () => {
    navigate('/annoucement');
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
      <Button variant="secondary" onClick={handleBackClick} className="mb-4">
        ⬅️ Back to Announcements
      </Button>
      <div className="announcement-detail">
        <h2 className="announcement-title">{announcement.title}</h2>
        <h4>{renderDate(announcement.createdAt)}</h4>
        <div className="announcement-content" dangerouslySetInnerHTML={{ __html: announcement.content }}></div>
        {announcement.attachment && (
          <a href={announcement.attachment} target="_blank" rel="noopener noreferrer" className="announcement-attachment">
            View Attachment
          </a>
        )}
      </div>
    </Container>
  );
}

export default AnnouncementDetail;