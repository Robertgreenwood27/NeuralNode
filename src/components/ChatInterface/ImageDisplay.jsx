import React from 'react';

const ImageDisplay = ({ imageUrl }) => {
  return (
    <div className="image-display">
      <img src={imageUrl} alt="Generated visual" style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};

export default ImageDisplay;