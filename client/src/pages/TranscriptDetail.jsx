import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, FileVideo, Globe, RefreshCw } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import TranscriptSearch from '../components/TranscriptSearch';
import TranscriptSegment from '../components/TranscriptSegment';
import ExportMenu from '../components/ExportMenu';
import StatusBadge from '../components/StatusBadge';
import ProcessingState from '../components/ProcessingState';
import { getTranscription, updateTranscription, startTranscribe } from '../services/api';
import { formatDuration, formatFileSize } from '../utils/formatters';

export default function TranscriptDetail() {
  const { id } = useParams();
  const videoRef = useRef(null);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [currentMatchPointer, setCurrentMatchPointer] = useState(0);

  const fetchDetail = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getTranscription(id);
      setJob(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load transcription');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail(true);
  }, [id]);

  // Polling while in processing state
  useEffect(() => {
    if (job && job.status === 'processing') {
      const interval = setInterval(() => {
        fetchDetail(false);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [job?.status]);

  // Search filtering
  useEffect(() => {
    if (!job || !job.transcript || !searchQuery.trim()) {
      setMatchedIndices([]);
      setCurrentMatchPointer(0);
      return;
    }

    const q = searchQuery.toLowerCase();
    const indices = [];
    job.transcript.forEach((seg, idx) => {
      if (seg.text.toLowerCase().includes(q)) {
        indices.push(idx);
      }
    });

    setMatchedIndices(indices);
    setCurrentMatchPointer(0);

    if (indices.length > 0) {
      scrollToSegment(indices[0]);
    }
  }, [searchQuery, job?.transcript]);

  const scrollToSegment = (idx) => {
    const el = document.getElementById(`segment-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleNextMatch = () => {
    if (matchedIndices.length === 0) return;
    const nextPtr = (currentMatchPointer + 1) % matchedIndices.length;
    setCurrentMatchPointer(nextPtr);
    scrollToSegment(matchedIndices[nextPtr]);
  };

  const handlePrevMatch = () => {
    if (matchedIndices.length === 0) return;
    const prevPtr = (currentMatchPointer - 1 + matchedIndices.length) % matchedIndices.length;
    setCurrentMatchPointer(prevPtr);
    scrollToSegment(matchedIndices[prevPtr]);
  };

  // Video time update listener: detect active segment
  const handleTimeUpdate = (e) => {
    const currentTime = e.target.currentTime;
    if (!job?.transcript) return;

    for (let i = 0; i < job.transcript.length; i++) {
      const seg = job.transcript[i];
      if (currentTime >= seg.start && currentTime <= (seg.end || seg.start + 5)) {
        if (activeSegmentIndex !== i) {
          setActiveSegmentIndex(i);
        }
        break;
      }
    }
  };

  // Click-to-seek video
  const handleSeek = (timestampSeconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestampSeconds;
      videoRef.current.play().catch(() => {});
    }
  };

  // Inline edit segment text
  const handleSaveEdit = async (segmentIndex, newText) => {
    if (!job) return;
    const updatedTranscript = [...job.transcript];
    updatedTranscript[segmentIndex] = {
      ...updatedTranscript[segmentIndex],
      text: newText,
    };

    try {
      const updated = await updateTranscription(id, { transcript: updatedTranscript });
      setJob(updated);
    } catch (err) {
      alert(err.message || 'Failed to save segment edit');
    }
  };

  if (loading && !job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-secondary">
        Loading transcription...
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-600 mb-4">
          {error}
        </div>
        <Link to="/transcriptions" className="text-sm font-medium text-primary hover:underline">
          Back to all transcriptions
        </Link>
      </div>
    );
  }

  const segments = job.transcript || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-border gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/transcriptions"
            className="p-1.5 text-secondary hover:text-primary rounded hover:bg-surface transition-colors"
            title="Back to list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-primary truncate max-w-md">
              {job.title || job.originalFileName}
            </h1>
            <div className="flex items-center space-x-3 text-xs text-secondary mt-0.5">
              <span>{job.originalFileName}</span>
              <span>•</span>
              <span>{formatFileSize(job.fileSize)}</span>
              <span>•</span>
              <span className="font-mono">{formatDuration(job.duration)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <StatusBadge status={job.status} stage={job.processingStage} />
          {job.status === 'completed' && (
            <ExportMenu transcriptionId={id} title={job.title} />
          )}
        </div>
      </div>

      {/* When still processing */}
      {job.status === 'processing' && (
        <div className="my-10">
          <ProcessingState stage={job.processingStage} />
        </div>
      )}

      {/* When failed */}
      {job.status === 'failed' && (
        <div className="my-10">
          <ProcessingState
            error={job.errorMessage || 'Transcription failed.'}
            onRetry={() => startTranscribe(id).then(() => fetchDetail(false))}
          />
        </div>
      )}

      {/* Split Workspace Layout */}
      {job.status === 'completed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Video Player & Details */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
            <VideoPlayer
              ref={videoRef}
              videoUrl={job.videoUrl}
              onTimeUpdate={handleTimeUpdate}
            />

            <div className="bg-white border border-border rounded-lg p-4 space-y-2 text-xs text-secondary">
              <div className="flex justify-between">
                <span>Language</span>
                <span className="font-medium text-primary uppercase">{job.language || 'en'}</span>
              </div>
              <div className="flex justify-between">
                <span>Segments</span>
                <span className="font-medium text-primary">{segments.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Provider</span>
                <span className="font-medium text-primary">{job.provider || 'default'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Transcript Workspace */}
          <div className="lg:col-span-7 bg-white border border-border rounded-lg p-4 sm:p-6 shadow-xs">
            {/* Header: Title & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-border">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">
                Transcript
              </h2>

              <div className="w-full sm:w-72">
                <TranscriptSearch
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                  matchCount={matchedIndices.length}
                  currentMatchIndex={currentMatchPointer}
                  onNext={handleNextMatch}
                  onPrev={handlePrevMatch}
                />
              </div>
            </div>

            {/* Transcript Segments List */}
            {segments.length === 0 ? (
              <div className="py-12 text-center text-sm text-secondary">
                No speech detected in this video.
              </div>
            ) : (
              <div className="space-y-1 max-h-[68vh] overflow-y-auto pr-1">
                {segments.map((seg, idx) => {
                  const isActive = activeSegmentIndex === idx;
                  const isHighlighted = matchedIndices.includes(idx);
                  return (
                    <TranscriptSegment
                      key={idx}
                      index={idx}
                      segment={seg}
                      isActive={isActive}
                      isHighlighted={isHighlighted}
                      onSeek={handleSeek}
                      onSaveEdit={handleSaveEdit}
                      searchQuery={searchQuery}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
