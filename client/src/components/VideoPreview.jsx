import React, { useEffect, useState } from 'react';
import { Trash2, Play, FileVideo } from 'lucide-react';
import { formatFileSize, formatDuration } from '../utils/formatters';

export default function VideoPreview({ file, onRemove, onStart, isUploading, uploadProgress }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration || 0);
  };

  return (
    <div className="bg-white border border-border rounded-lg p-5 sm:p-6 w-full">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Video Player */}
        <div className="w-full md:w-1/2 bg-black rounded overflow-hidden aspect-video relative flex items-center justify-center">
          {videoUrl && (
            <video
              src={videoUrl}
              controls
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Video Details & Actions */}
        <div className="w-full md:w-1/2 flex flex-col justify-between self-stretch">
          <div>
            <div className="flex items-center space-x-2 text-xs font-medium text-secondary uppercase tracking-wider mb-2">
              <FileVideo className="w-3.5 h-3.5" />
              <span>Selected Video</span>
            </div>

            <h3 className="text-base font-semibold text-primary break-all mb-4">
              {file.name}
            </h3>

            <div className="space-y-2 text-sm text-secondary bg-surface p-3.5 rounded border border-border mb-6">
              <div className="flex justify-between">
                <span>File size</span>
                <span className="font-medium text-primary">{formatFileSize(file.size)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated duration</span>
                <span className="font-medium text-primary">
                  {duration > 0 ? formatDuration(duration) : 'Probing...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Format</span>
                <span className="font-medium text-primary uppercase">
                  {file.name.split('.').pop()}
                </span>
              </div>
            </div>
          </div>

          {/* Progress or Actions */}
          {isUploading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-secondary">
                <span>Uploading video...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-surface border border-border h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={onStart}
                className="flex-1 bg-primary text-white text-sm font-medium py-2.5 px-4 rounded hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start transcription</span>
              </button>

              <button
                type="button"
                onClick={onRemove}
                className="bg-white border border-border text-secondary hover:text-red-600 hover:border-red-300 text-sm py-2.5 px-3 rounded transition-colors"
                title="Remove video"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
