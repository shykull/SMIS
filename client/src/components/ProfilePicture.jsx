import React, { useRef } from 'react';

const ProfilePicture = ({ userProfile, handleFileChange }) => {
  const fileInputRef = useRef(null); // Create a ref for the file input

  const handleImageClick = () => {
    // Trigger the file input when the image is clicked
    fileInputRef.current.click();
  };

  const handleFileChangeInternal = (event) => {
    // Call the external handleFileChange prop with the selected file
    const file = event.target.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  return (
    <div>
      <img
        src={userProfile.profilePicture || '/generaluser.png'}
        alt="Profile"
        className="rounded-circle"
        onClick={handleImageClick} // Trigger file input on image click
        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
      />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }} // Hide the file input
        accept="image/*" // Accept only image files
        onChange={handleFileChangeInternal} // Handle file selection
      />
    </div>
  );
};

export default ProfilePicture;
