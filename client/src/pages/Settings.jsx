import React, { useEffect, useState } from 'react';
import { Server, Mic, HardDrive, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { getSettings } from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      setError(err.message || 'Failed to load application settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-sm text-secondary">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Settings</h1>
          <p className="text-sm text-secondary mt-1">
            Application configuration and engine status
          </p>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          className="inline-flex items-center space-x-1.5 text-xs text-secondary hover:text-primary px-3 py-1.5 rounded border border-border bg-white hover:bg-surface transition-colors"
          title="Refresh status"
        >
          <RefreshCw className={'w-3.5 h-3.5 ' + (loading ? 'animate-spin' : '')} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Transcription Engine Status */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center space-x-2.5 mb-4">
            <Mic className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-primary">Transcription</h2>
          </div>

          <div className="divide-y divide-border text-sm">
            <div className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium text-primary">Provider</div>
                <div className="text-xs text-secondary mt-0.5">Primary speech recognition engine</div>
              </div>
              <span className="font-medium text-primary">
                {settings?.providerName || 'Google Gemini'}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium text-primary">Status</div>
                <div className="text-xs text-secondary mt-0.5">Backend credentials and engine readiness</div>
              </div>
              <div>
                {settings?.configured ? (
                  <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Configured</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Not configured</span>
                  </span>
                )}
              </div>
            </div>

            <div className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium text-primary">Language</div>
                <div className="text-xs text-secondary mt-0.5">Spoken language detection mode</div>
              </div>
              <span className="text-xs font-medium text-primary bg-surface px-2 py-1 rounded border border-border">
                {settings?.language || 'Auto Detect'}
              </span>
            </div>
          </div>
        </div>

        {/* Media & System Processing */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center space-x-2.5 mb-4">
            <Server className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-primary">Media Processing</h2>
          </div>

          <div className="divide-y divide-border text-sm">
            <div className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium text-primary">Audio Extractor (FFmpeg)</div>
                <div className="text-xs text-secondary mt-0.5">Extracts 16kHz mono audio from video containers</div>
              </div>
              <div>
                {settings?.ffmpeg ? (
                  <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ready</span>
                  </span>
                ) : (
                  <span className="text-xs font-medium text-red-600">Not found</span>
                )}
              </div>
            </div>

            <div className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium text-primary">Supported Video Formats</div>
                <div className="text-xs text-secondary mt-0.5">Accepted container formats</div>
              </div>
              <span className="text-xs text-primary font-mono bg-surface px-2 py-1 rounded border border-border">
                MP4 · MOV · AVI · WEBM
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium text-primary">Maximum File Size</div>
                <div className="text-xs text-secondary mt-0.5">Upload limit per video</div>
              </div>
              <span className="text-xs font-medium text-primary">
                {settings?.maxFileSizeMb || 500} MB
              </span>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center space-x-2.5 mb-4">
            <HardDrive className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-primary">Storage</h2>
          </div>

          <div className="divide-y divide-border text-sm">
            <div className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium text-primary">Storage Backend</div>
                <div className="text-xs text-secondary mt-0.5">Media and transcript persistence</div>
              </div>
              <span className="text-xs font-medium text-primary">
                {settings?.storageType || 'Local Storage'}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium text-primary">Storage Status</div>
                <div className="text-xs text-secondary mt-0.5">File system health</div>
              </div>
              <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
