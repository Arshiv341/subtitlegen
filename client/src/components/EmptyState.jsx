import React from 'react';
import { Link } from 'react-router-dom';
import { FileVideo, ArrowRight } from 'lucide-react';

export default function EmptyState({
  title = 'No transcriptions yet',
  description = 'Upload a video to generate your first transcript.',
  actionText = 'Upload video',
  actionLink = '/',
}) {
  return (
    <div className="bg-white border border-border rounded-lg p-12 text-center max-w-lg mx-auto my-12">
      <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4 text-secondary">
        <FileVideo className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-primary mb-1">{title}</h3>
      <p className="text-sm text-secondary mb-6">{description}</p>
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center space-x-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
