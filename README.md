from pathlib import Path

readme = r'''# SubtitleGen

> **Turn videos into accurate, timestamped subtitles with AI.**

SubtitleGen is a full-stack AI-powered video transcription and subtitle generation platform that converts spoken audio from uploaded videos into searchable, editable, and timestamp-synchronized text.

The platform uses **FFmpeg** for audio extraction and a modular speech-to-text architecture with support for **Google Gemini Transcription, Groq Whisper, OpenAI Whisper, and an offline development provider**.

Users can upload a video, generate a transcript, interact with synchronized subtitles, edit the generated text, search the transcript, and export subtitles or transcripts in multiple formats.

---

## ✨ Features

### 🎥 Video-to-Text Transcription

Upload a video and automatically convert its spoken content into text.

Supported video formats:

- MP4
- MOV
- AVI
- WEBM

Processing pipeline:

```text
Video Upload
     ↓
FFmpeg Audio Extraction
     ↓
Speech-to-Text
     ↓
Timestamped Transcript
     ↓
SubtitleGen Workspace
     ↓
Export
```

### 🤖 AI Speech Recognition

Supported transcription providers:

- **Google Gemini Transcription**
- **Groq Whisper**
- **OpenAI Whisper**
- **Offline / Mock Provider** for local development

The transcription provider is configured on the backend.

### ⏱️ Timestamped Transcripts

Every transcript is organized into timestamped segments.

```text
00:00:02
Hello everyone.

00:00:05
Today we are going to learn JavaScript.

00:00:11
JavaScript is one of the most popular programming languages.
```

### ▶️ Synchronized Video & Transcript

Clicking a transcript segment seeks the video to its corresponding timestamp.

The currently playing transcript segment is highlighted automatically.

### 🔎 Transcript Search

Search the transcript in real time with:

- Keyword search
- Match count
- Highlighted results
- Next result
- Previous result

### ✏️ Inline Transcript Editing

Edit generated transcript segments directly from the workspace.

Changes are persisted through the backend API.

### 📤 Multi-Format Export

Export transcripts as:

| Format | Description |
|---|---|
| TXT | Plain text transcript |
| SRT | Standard subtitle/caption format |
| PDF | Formatted transcript document |
| DOCX | Editable Microsoft Word document |

Example SRT:

```text
1
00:00:02,000 --> 00:00:05,000
Hello everyone.

2
00:00:05,000 --> 00:00:09,000
Today we are going to learn JavaScript.
```

### 📚 Transcription History

The `/transcriptions` page provides:

- Video name
- Duration
- Processing status
- Creation date
- Open transcript
- Export
- Delete

### ⚡ FFmpeg Processing

SubtitleGen uses FFmpeg to extract optimized audio from uploaded videos.

Audio is converted to:

- 16 kHz
- Mono
- Optimized speech audio

FFmpeg binaries are bundled through:

- `@ffmpeg-installer/ffmpeg`
- `@ffprobe-installer/ffprobe`

### 🗄️ Flexible Storage

MongoDB is supported through Mongoose.

For local development, the application can fall back to a local JSON repository when MongoDB is unavailable.

---

## 🎨 UI / UX

SubtitleGen uses a clean, professional SaaS interface.

Design principles:

- Pure white background
- Minimal visual noise
- Typography-focused interface
- Subtle borders
- Restrained accent colors
- Functional icons
- Responsive layouts
- Clear visual hierarchy

Design system:

| Element | Value |
|---|---|
| Background | `#FFFFFF` |
| Primary Text | `#111111` |
| Secondary Text | `#666666` |
| Border | `#E5E5E5` |
| Surface | `#F7F7F7` |

The interface intentionally avoids:

- Dark mode
- Glassmorphism
- Neon gradients
- Glowing AI cards
- Excessive animations
- Unnecessary dashboards
- Meaningless analytics cards
- Excessive rounded containers
- Decorative AI elements

The goal is a professional productivity SaaS experience rather than an AI-generated UI template.

---

# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Routing | React Router |
| Backend | Node.js |
| API | Express.js |
| Video Processing | FFmpeg |
| Speech-to-Text | Gemini / Whisper |
| Database | MongoDB / Local JSON |
| ODM | Mongoose |
| PDF Export | PDFKit |
| DOCX Export | docx |
| File Upload | Multer |
| Language | JavaScript |

---

# 📁 Project Structure

```text
subtitlegen/
│
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   │
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       │
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── UploadZone.jsx
│       │   ├── VideoPreview.jsx
│       │   ├── VideoPlayer.jsx
│       │   ├── ProcessingState.jsx
│       │   ├── TranscriptViewer.jsx
│       │   ├── TranscriptSegment.jsx
│       │   ├── TranscriptSearch.jsx
│       │   ├── ExportMenu.jsx
│       │   ├── StatusBadge.jsx
│       │   └── EmptyState.jsx
│       │
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Transcriptions.jsx
│       │   ├── TranscriptDetail.jsx
│       │   └── Settings.jsx
│       │
│       ├── services/
│       │   └── api.js
│       │
│       └── utils/
│           └── formatters.js
│
├── server/
│   ├── server.js
│   │
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── transcriptionController.js
│   │   └── settingsController.js
│   │
│   ├── middleware/
│   │   ├── uploadMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   └── Transcription.js
│   │
│   ├── providers/
│   │   ├── baseProvider.js
│   │   ├── geminiProvider.js
│   │   ├── groqWhisperProvider.js
│   │   ├── openAiWhisperProvider.js
│   │   └── mockProvider.js
│   │
│   ├── routes/
│   │   ├── transcriptionRoutes.js
│   │   └── settingsRoutes.js
│   │
│   ├── services/
│   │   ├── audioService.js
│   │   ├── transcriptionService.js
│   │   ├── exportService.js
│   │   └── storageService.js
│   │
│   └── utils/
│       ├── ffmpeg.js
│       └── timeFormat.js
│
├── uploads/
│   ├── videos/
│   ├── audio/
│   └── exports/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- npm 9+
- Git

MongoDB is optional for local development if the JSON fallback repository is enabled.

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/subtitlegen.git
cd subtitlegen
```

## 2. Install Dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

## 3. Environment Configuration

Create:

```text
server/.env
```

Example:

```env
PORT=5000

MONGODB_URI=

TRANSCRIPTION_PROVIDER=gemini

GEMINI_API_KEY=your_gemini_api_key_here
```

---

# 🔐 API Key Security

SubtitleGen uses a **server-side API credential architecture**.

End users are **never asked to provide their own Gemini, Groq, or OpenAI API key**.

The API key is stored only on the backend:

```text
server/.env
```

The browser never receives the secret.

Architecture:

```text
React Frontend
      ↓
Express Backend
      ↓
Private Server API Key
      ↓
Gemini / Whisper API
```

Never commit `server/.env` to GitHub.

---

# 🤖 Transcription Providers

## Google Gemini

```env
TRANSCRIPTION_PROVIDER=gemini
GEMINI_API_KEY=your_api_key
```

The Gemini provider runs entirely on the backend.

## Groq Whisper

```env
TRANSCRIPTION_PROVIDER=whisper-groq
GROQ_API_KEY=your_api_key
```

## OpenAI Whisper

```env
TRANSCRIPTION_PROVIDER=whisper-openai
OPENAI_API_KEY=your_api_key
```

## Offline / Mock Provider

```env
TRANSCRIPTION_PROVIDER=mock
```

The mock provider is intended only for development/testing. It does not perform real speech recognition.

---

# ▶️ Running the Application

## Development Mode

From the project root:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

## Run Frontend Separately

```bash
cd client
npm run dev
```

## Run Backend Separately

```bash
cd server
npm run dev
```

---

# 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/transcriptions` | Upload video |
| `POST` | `/api/transcriptions/:id/transcribe` | Start transcription |
| `GET` | `/api/transcriptions` | List transcriptions |
| `GET` | `/api/transcriptions/:id` | Get transcript |
| `PATCH` | `/api/transcriptions/:id` | Update transcript |
| `DELETE` | `/api/transcriptions/:id` | Delete transcription |
| `GET` | `/api/transcriptions/:id/export?format=txt` | Export TXT |
| `GET` | `/api/transcriptions/:id/export?format=srt` | Export SRT |
| `GET` | `/api/transcriptions/:id/export?format=pdf` | Export PDF |
| `GET` | `/api/transcriptions/:id/export?format=docx` | Export DOCX |
| `GET` | `/api/settings` | Get safe application status |

API keys must never be returned through the Settings API.

---

# 🧠 Transcription Architecture

SubtitleGen uses a provider abstraction so the speech-to-text engine can be changed without rewriting the frontend.

```text
                    Audio
                      │
                      ↓
             transcriptionService
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
       Gemini       Groq        OpenAI
     Transcribe    Whisper      Whisper
          │           │           │
          └───────────┼───────────┘
                      ↓
               Transcript JSON
                      ↓
                  Database
                      ↓
                  React UI
```

---

# 📊 Transcript Data Structure

```json
{
  "title": "JavaScript Lecture",
  "originalFileName": "lecture.mp4",
  "duration": 542,
  "status": "completed",
  "language": "en",
  "transcript": [
    {
      "start": 2.0,
      "end": 5.4,
      "text": "Hello everyone."
    },
    {
      "start": 5.4,
      "end": 10.2,
      "text": "Today we are going to learn JavaScript."
    }
  ]
}
```

---

# 🔄 Processing Pipeline

```text
┌─────────────────┐
│   Upload Video  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Validate File   │
└────────┬────────┘
         ↓
┌─────────────────┐
│     FFmpeg      │
│ Extract Audio   │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Speech-to-Text  │
│ Gemini /Whisper │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Timestamped     │
│ Transcript      │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Store Result    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Transcript UI   │
└────────┬────────┘
         ↓
┌─────────────────┐
│ TXT / SRT /     │
│ PDF / DOCX      │
└─────────────────┘
```

---

# 🧪 Testing Checklist

- [ ] Video upload
- [ ] File validation
- [ ] Video preview
- [ ] FFmpeg audio extraction
- [ ] Real speech-to-text transcription
- [ ] Timestamp generation
- [ ] Transcript rendering
- [ ] Video/transcript synchronization
- [ ] Transcript search
- [ ] Transcript editing
- [ ] Persistent updates
- [ ] TXT export
- [ ] SRT export
- [ ] PDF export
- [ ] DOCX export
- [ ] Transcription history
- [ ] Delete functionality
- [ ] Error handling
- [ ] Mobile responsiveness
- [ ] API key security

---

# 🛡️ Security

SubtitleGen implements basic security practices:

- API keys remain server-side
- `.env` is excluded from Git
- Uploaded filenames are sanitized
- File types are validated
- File sizes are validated
- Generated filenames are unique
- API errors are sanitized
- Secrets are never returned through the Settings API

For a public SaaS deployment, authentication, rate limiting, usage quotas, and cloud storage controls should also be implemented.

---

# 📌 Roadmap

- [ ] User authentication
- [ ] Speaker identification
- [ ] Multi-language transcription
- [ ] Automatic subtitle translation
- [ ] Subtitle styling/customization
- [ ] Burn subtitles directly into video
- [ ] YouTube URL transcription
- [ ] Large-video background processing
- [ ] Cloud object storage
- [ ] Redis/BullMQ job processing
- [ ] Usage limits and subscription plans
- [ ] Team/workspace support
- [ ] AI-generated summaries
- [ ] Chapter generation
- [ ] Keyword extraction
- [ ] Transcript-based Q&A
- [ ] Real-time transcription

---

# 🤝 Contributing

Contributions are welcome.

```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

Then open a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

See `LICENSE` for more information.

---

# ⭐ Support

If SubtitleGen is useful to you, consider giving the repository a ⭐ on GitHub.

---

## SubtitleGen

**Upload a video. Generate subtitles. Search, edit, sync and export.**

Built with:

**React · Node.js · Express · FFmpeg · Gemini · Whisper · MongoDB**
'''

path = Path("/mnt/data/README.md")
path.write_text(readme, encoding="utf-8")
print(f"Created: {path}")