import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ProcessingState({ stage, error, onRetry }) {
  const getStageMessage = () => {
    switch (stage) {
      case 'uploading':
        return 'Uploading video...';
      case 'extracting_audio':
        return 'Extracting audio with FFmpeg...';
      case 'transcribing':
        return 'Transcribing speech to text...';
      default:
        return 'Processing video...';
    }
  };

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-8 text-center max-w-lg mx-auto">
        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          !
        </div>
        <h3 className="text-base font-semibold text-primary mb-1">Transcription failed</h3>
        <p className="text-sm text-secondary mb-6">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="bg-primary text-white text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-lg p-8 sm:p-10 text-center max-w-lg mx-auto">
      <div className="flex justify-center mb-4">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
      <h3 className="text-base font-semibold text-primary mb-1">
        {getStageMessage()}
      </h3>
      <p className="text-xs text-secondary max-w-sm mx-auto mb-6">
        Please keep this window open while speech-to-text processing finishes.
      </p>

      {/* Real Stage Indicator */}
      <div className="w-full bg-surface border border-border rounded p-3 text-left space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-secondary">Audio Extraction (FFmpeg)</span>
          <span className={stage === 'extracting_audio' ? 'text-blue-600 font-medium' : stage === 'transcribing' ? 'text-emerald-600 font-medium' : 'text-gray-400'}>
            {stage === 'extracting_audio' ? 'Running' : stage === 'transcribing' ? 'Done' : 'Pending'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-secondary">Speech Recognition (Whisper)</span>
          <span className={stage === 'transcribing' ? 'text-blue-600 font-medium' : 'text-gray-400'}>
            {stage === 'transcribing' ? 'Running' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
}
