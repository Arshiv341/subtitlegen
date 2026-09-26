import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { formatDuration } from '../utils/formatters';

export default function TranscriptSegment({
  segment,
  index,
  isActive,
  isHighlighted,
  onSeek,
  onSaveEdit,
  searchQuery,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(segment.text);

  const handleSave = () => {
    if (draftText.trim()) {
      onSaveEdit(index, draftText.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftText(segment.text);
    setIsEditing(false);
  };

  // Text highlighting for search matches
  const renderHighlightedText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-black px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      id={`segment-${index}`}
      className={`group relative p-3 rounded-md transition-all duration-150 border ${
        isActive
          ? 'bg-blue-50/60 border-blue-200 shadow-xs'
          : isHighlighted
          ? 'bg-yellow-50/60 border-yellow-200'
          : 'bg-white border-transparent hover:bg-surface hover:border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        {/* Clickable timestamp */}
        <button
          type="button"
          onClick={() => onSeek(segment.start)}
          className={`font-mono text-xs px-1.5 py-0.5 rounded border transition-colors ${
            isActive
              ? 'bg-blue-600 text-white border-blue-600 font-semibold'
              : 'bg-surface text-secondary hover:text-primary hover:border-gray-400 border-border'
          }`}
          title="Click to seek video"
        >
          {formatDuration(segment.start)}
        </button>

        {/* Edit Action Button */}
        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setDraftText(segment.text);
              setIsEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-secondary hover:text-primary p-1 rounded hover:bg-white"
            title="Edit segment"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={2}
            className="w-full text-sm text-primary p-2 bg-white border border-border rounded focus:border-primary outline-none resize-y"
            autoFocus
          />
          <div className="flex items-center space-x-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center space-x-1 text-xs text-secondary hover:text-primary px-2 py-1 rounded border border-border hover:bg-surface"
            >
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center space-x-1 text-xs text-white bg-primary hover:bg-neutral-800 px-2.5 py-1 rounded"
            >
              <Check className="w-3 h-3" />
              <span>Save</span>
            </button>
          </div>
        </div>
      ) : (
        <p
          onClick={() => onSeek(segment.start)}
          className="text-sm text-primary leading-relaxed cursor-pointer"
        >
          {renderHighlightedText(segment.text, searchQuery)}
        </p>
      )}
    </div>
  );
}
