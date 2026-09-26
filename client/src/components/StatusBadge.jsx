import React from 'react';

export default function StatusBadge({ status, stage }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        Completed
      </span>
    );
  }

  if (status === 'processing') {
    let stageLabel = 'Processing';
    if (stage === 'extracting_audio') stageLabel = 'Extracting audio';
    if (stage === 'transcribing') stageLabel = 'Transcribing speech';

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mr-1.5"></span>
        {stageLabel}
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
      {status || 'Unknown'}
    </span>
  );
}
