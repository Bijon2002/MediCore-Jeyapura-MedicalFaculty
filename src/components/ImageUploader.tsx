import React, { useState, useRef } from 'react';
import './ImageUploader.css';

export interface ImageUploaderProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  helpText?: string;
  variant?: 'banner' | 'avatar';
  maxSizeMb?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = '',
  onChange,
  label = 'Featured Image',
  helpText = 'Supports PNG, JPG, WEBP, GIF (Max 8MB). Drag and drop or browse from your device.',
  variant = 'banner',
  maxSizeMb = 8,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = (file: File) => {
    setErrorMessage(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    // Validate size
    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMessage(`Image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is ${maxSizeMb}MB.`);
      return;
    }

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file. Please try another image.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrorMessage(null);
  };

  const isAvatar = variant === 'avatar';

  return (
    <div className={`medcore-image-uploader ${isAvatar ? 'uploader-avatar' : 'uploader-banner'}`}>
      {label && <label className="uploader-label">{label}</label>}

      {errorMessage && <div className="uploader-error-alert">{errorMessage}</div>}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {value ? (
        /* PREVIEW MODE */
        <div className="uploader-preview-box">
          <div className="preview-image-container">
            <img src={value} alt="Uploaded Preview" className="preview-rendered-img" />
            {isProcessing && <div className="preview-processing-overlay">Processing image...</div>}
          </div>

          <div className="preview-controls-row">
            <button
              type="button"
              className="btn-replace-img"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Replace Image
            </button>
            <button
              type="button"
              className="btn-remove-img"
              onClick={handleRemoveImage}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* DROP ZONE / UPLOAD PROMPT */
        <div
          className={`uploader-dropzone ${isDragging ? 'dropzone-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
        >
          <div className="dropzone-icon-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div className="dropzone-text">
            <strong>Click to upload an image</strong> or drag and drop
          </div>
          <p className="dropzone-hint">{helpText}</p>
        </div>
      )}

      {/* URL Fallback link */}
      <div className="uploader-footer-action">
        <button
          type="button"
          className="btn-toggle-url"
          onClick={() => setShowUrlFallback(!showUrlFallback)}
        >
          {showUrlFallback ? 'Hide URL input' : 'Or paste an image web link'}
        </button>

        {showUrlFallback && (
          <div className="url-input-container">
            <input
              type="url"
              className="url-direct-input"
              placeholder="https://example.com/medical-diagram.jpg"
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

