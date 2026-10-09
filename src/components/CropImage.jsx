import { useState } from 'react';
import './CropImage.css';

const CropImage = ({ crop, className = '' }) => {
  const [failedImage, setFailedImage] = useState('');
  const image = crop?.image;
  const showImage = Boolean(image) && failedImage !== image;

  if (!showImage) {
    return (
      <div
        className={`crop-image crop-image--placeholder ${className}`.trim()}
        role="img"
        aria-label={`${crop?.name ?? 'Crop'} image unavailable`}
      >
        <span aria-hidden="true">{crop?.name?.slice(0, 1) ?? '?'}</span>
      </div>
    );
  }

  return (
    <img
      className={`crop-image ${className}`.trim()}
      src={image}
      alt={crop.name}
      loading="lazy"
      onError={() => setFailedImage(image)}
    />
  );
};

export default CropImage;
