import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

interface SocialMediaIconsProps {
  iconColor?: string;
  iconSize?: string;
}

const SocialMediaIcons: React.FC<SocialMediaIconsProps> = ({ iconColor = 'black', iconSize = '25px' }) => {
  // Define the common style for all icons
  const iconStyle: React.CSSProperties = {
    color: iconColor,
    width: iconSize,
    height: iconSize,
    margin: '0 5px', // Add margin for spacing
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  }
  return (
    <div style={containerStyle}>
      {/* Facebook Icon */}
      <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
        <FaFacebook style={iconStyle} />
      </a>

      {/* Twitter Icon */}
      <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
        <FaTwitter style={iconStyle} />
      </a>

      {/* Instagram Icon */}
      <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">        
        <FaInstagram style={iconStyle} />
      </a>

      {/* LinkedIn Icon */}
      <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
        <FaLinkedin style={iconStyle} />
      </a>
    </div>
  );
};

export default SocialMediaIcons;