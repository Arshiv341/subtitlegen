import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileVideo, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ExportMenu from '../components/ExportMenu';
import { getTranscriptions, deleteTranscription } from '../services/api';
import { formatDate, formatDuration } from '../utils/formatters';

export default function Transcriptions() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTranscriptions();
      setList(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load transcription history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteTranscription(id);
      setList((prev) => prev.filter((item) => (item.id || item._id) !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete transcription');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Transcriptions
          </h1>
          <p className="text-sm text-secondary mt-1">
            Previous transcription jobs and exports
          </p>
        </div>

        <button
          type="button"
          onClick={fetchJobs}
          className="inline-flex items-center space-x-1.5 text-xs text-secondary hover:text-primary px-3 py-1.5 rounded border border-border bg-white hover:bg-surface transition-colors"
          title="Refresh list"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && list.length === 0 ? (
        <div className="py-20 text-center text-sm text-secondary">
          Loading transcriptions...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-600 text-center">
          {error}
        </div>
      ) : list.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface border-b border-border text-xs font-semibold text-secondary uppercase tracking-wider">
                  <th className="py-3 px-4">Video</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((job) => {
                  const id = job.id || job._id;
                  return (
                    <tr key={id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-primary">
                        <Link
                          to={`/transcriptions/${id}`}
                          className="flex items-center space-x-2.5 hover:underline"
                        >
                          <FileVideo className="w-4 h-4 text-secondary flex-shrink-0" />
                          <span className="truncate max-w-xs">{job.title || job.originalFileName}</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={job.status} stage={job.processingStage} />
                      </td>
                      <td className="py-3.5 px-4 text-secondary font-mono text-xs">
                        {formatDuration(job.duration)}
                      </td>
                      <td className="py-3.5 px-4 text-secondary text-xs">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/transcriptions/${id}`}
                            className="inline-flex items-center space-x-1 text-xs text-primary font-medium px-2.5 py-1 rounded border border-border bg-white hover:bg-surface transition-colors"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3 text-secondary" />
                          </Link>

                          {job.status === 'completed' && (
                            <ExportMenu transcriptionId={id} title={job.title} />
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(id, job.title)}
                            className="p-1 text-secondary hover:text-red-600 rounded hover:bg-surface transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
