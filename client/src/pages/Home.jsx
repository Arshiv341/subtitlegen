import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import VideoPreview from '../components/VideoPreview';
import ProcessingState from '../components/ProcessingState';
import { uploadVideo, startTranscribe } from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeJobId, setActiveJobId] = useState(null);
  const [processingStage, setProcessingStage] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
  };

  const handleStart = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError(null);

      // Step 1: Upload video file
      const uploadRes = await uploadVideo(selectedFile, (percent) => {
        setUploadProgress(percent);
      });

      const jobId = uploadRes.data.id || uploadRes.data._id;
      setActiveJobId(jobId);
      setIsUploading(false);
      setProcessingStage('extracting_audio');

      // Step 2: Trigger transcription pipeline
      await startTranscribe(jobId);

      // Navigate to transcript detail page where polling and live state are maintained
      navigate(`/transcriptions/${jobId}`);
    } catch (err) {
      setIsUploading(false);
      setError(err.message || 'An error occurred during upload or processing.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Workflow Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Video-to-Text Transcription
        </h1>
        <p className="text-sm text-secondary mt-1">
          Upload any video file to extract audio and generate synchronized, timestamped transcripts.
        </p>
      </div>

      {/* Main Action Area */}
      {processingStage ? (
        <ProcessingState stage={processingStage} error={error} onRetry={handleStart} />
      ) : selectedFile ? (
        <VideoPreview
          file={selectedFile}
          onRemove={handleRemove}
          onStart={handleStart}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      ) : (
        <UploadZone onFileSelected={handleFileSelected} disabled={isUploading} />
      )}

      {error && !processingStage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
