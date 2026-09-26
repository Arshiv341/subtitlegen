import React, { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

const ALLOWED_EXTS = ['.mp4', '.mov', '.avi', '.webm'];

export default function UploadZone({ onFileSelected, disabled }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  const validateAndPass = (file) => {
    setValidationError('');
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      setValidationError('Unsupported video format. Please upload MP4, MOV, AVI or WEBM.');
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`w-full bg-white border border-dashed rounded-lg p-10 sm:p-14 text-center cursor-pointer transition-all duration-150 ${
          isDragOver
            ? 'border-primary bg-surface/70'
            : 'border-border hover:border-gray-400 bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              validateAndPass(e.target.files[0]);
            }
          }}
        />

        <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4 text-primary">
          <Upload className="w-5 h-5" />
        </div>

        <h3 className="text-base font-semibold text-primary mb-1">
          Upload a video
        </h3>
        <p className="text-sm text-secondary mb-4">
          Drag & drop your video here, or click to browse
        </p>

        <div className="inline-block bg-white border border-border text-primary text-xs font-medium px-3 py-1.5 rounded-md hover:bg-surface transition-colors shadow-sm">
          Choose video
        </div>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-center space-x-4 text-xs text-secondary">
          <span>Supported: MP4, MOV, AVI, WEBM</span>
          <span>•</span>
          <span>Max size: 500 MB</span>
        </div>
      </div>

      {validationError && (
        <div className="mt-3 flex items-center space-x-2 text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
