const API_BASE = '/api';

export async function uploadVideo(file, onProgress) {
  const formData = new FormData();
  formData.append('video', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/transcriptions`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve(json);
        } catch (err) {
          reject(new Error('Invalid server response'));
        }
      } else {
        try {
          const errJson = JSON.parse(xhr.responseText);
          reject(new Error(errJson.error || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

export async function startTranscribe(id) {
  const res = await fetch(`${API_BASE}/transcriptions/${id}/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to start transcription');
  return data;
}

export async function getTranscriptions() {
  const res = await fetch(`${API_BASE}/transcriptions`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch transcriptions');
  return data.data;
}

export async function getTranscription(id) {
  const res = await fetch(`${API_BASE}/transcriptions/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Transcription not found');
  return data.data;
}

export async function updateTranscription(id, updates) {
  const res = await fetch(`${API_BASE}/transcriptions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update transcription');
  return data.data;
}

export async function deleteTranscription(id) {
  const res = await fetch(`${API_BASE}/transcriptions/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete transcription');
  return data;
}

export function getExportUrl(id, format) {
  return `${API_BASE}/transcriptions/${id}/export?format=${format}`;
}

export async function getSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load settings');
  return data.data;
}

export async function updateSettings(settings) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save settings');
  return data.data;
}
