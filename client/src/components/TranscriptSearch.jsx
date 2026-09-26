import React from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

export default function TranscriptSearch({
  query,
  onQueryChange,
  matchCount,
  currentMatchIndex,
  onNext,
  onPrev,
}) {
  return (
    <div className="flex items-center space-x-2 bg-white border border-border rounded-md px-3 py-1.5 focus-within:border-primary transition-colors text-sm">
      <Search className="w-4 h-4 text-secondary flex-shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search transcript..."
        className="w-full bg-transparent border-none outline-none text-primary placeholder-secondary text-xs sm:text-sm"
      />

      {query && (
        <div className="flex items-center space-x-1.5 flex-shrink-0 text-xs text-secondary pl-2 border-l border-border">
          <span>
            {matchCount > 0 ? `${currentMatchIndex + 1} of ${matchCount}` : '0 results'}
          </span>

          <button
            type="button"
            onClick={onPrev}
            disabled={matchCount === 0}
            className="p-0.5 hover:text-primary disabled:opacity-30"
            title="Previous match"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={matchCount === 0}
            className="p-0.5 hover:text-primary disabled:opacity-30"
            title="Next match"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="p-0.5 hover:text-primary"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
