# VideoText — AI-Powered Video-to-Text Transcription Platform

VideoText is a full-stack web application designed for converting video files into synchronized, searchable, and editable transcripts. Built with a clean, professional, typography-focused white SaaS aesthetic, it extracts audio using FFmpeg, converts spoken speech into text using Whisper providers (Groq Cloud API, OpenAI Whisper API, or an offline development provider), and provides timestamp-seeking playback and multi-format exports.

---

## 1. Key Features

- **White Minimalist SaaS Design**: Pure `#FFFFFF` background, `#111111` typography, `#E5E5E5` subtle borders, no dark mode, no AI-generated gradients or card clutter.
- **FFmpeg Audio Extraction**: Automatically extracts 16kHz mono audio from uploaded videos using bundled FFmpeg binaries (`@ffmpeg-installer/ffmpeg` and `@ffprobe-installer/ffprobe`).
- **Pluggable Speech-to-Text Architecture**:
  - **Groq Whisper** (`whisper-large-v3`): Ultra-fast speech inference with word/segment timestamps.
  - **OpenAI Whisper** (`whisper-1`): Standard Whisper API integration.
  - **Offline/Mock Provider**: Generates realistic timestamped segments for zero-setup local development without requiring an API key.
- **Interactive Transcript Workspace**:
  - **Click-to-Seek**: Clicking any segment timestamp jumps the video player directly to that second.
  - **Active Segment Highlighting**: Synchronously highlights the currently playing segment as the video progresses.
  - **Search & Filter**: Real-time search with match counter (`X of Y results`), query highlighting, and Next/Previous navigation buttons.
  - **Inline Segment Editing**: Edit segment text and save changes immediately with persistent `PATCH` updates.
  - **Multi-Format Export**: One-click downloads for **TXT**, **SRT** (SubRip captions), **PDF** (printable report via PDFKit), and **DOCX** (Microsoft Word document).
- **History & Management**: `/transcriptions` dashboard displaying video metadata, duration, status badges, direct links, and delete actions.
- **Resilient Fallback Storage**: Automatically connects to MongoDB if `MONGODB_URI` is reachable; seamlessly switches to an embedded JSON file repository if MongoDB is offline.

---

## 2. Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React 18 + Vite | Modular functional components, hooks, React Router |
| **Styling** | Tailwind CSS | Strict white SaaS theme (`#FFFFFF`, `#111111`, `#E5E5E5`) |
| **Icons** | Lucide React | Clean, functional iconography |
| **Backend** | Node.js + Express | REST API, streaming uploads, static media server |
| **Audio Processing** | FFmpeg / Fluent-FFmpeg | Audio extraction, sample rate conversion (16kHz mono) |
| **Speech-to-Text** | Whisper (Groq / OpenAI) | Modular provider abstraction in `transcriptionService.js` |
| **Database** | MongoDB / Local JSON Store | Mongoose with automatic fallback to JSON repository |
| **Document Exports** | PDFKit & Docx | PDF report and Word document generators |

---

## 3. Project Structure

```text
videototext/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── UploadZone.jsx
│   │   │   ├── VideoPreview.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── ProcessingState.jsx
│   │   │   ├── TranscriptViewer.jsx
│   │   │   ├── TranscriptSegment.jsx
│   │   │   ├── TranscriptSearch.jsx
│   │   │   ├── ExportMenu.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Transcriptions.jsx
│   │   │   ├── TranscriptDetail.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── utils/
│   │       └── formatters.js
├── server/
│   ├── server.js
│   ├── .env
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   ├── controllers/
│   │   ├── transcriptionController.js
│   │   └── settingsController.js
│   ├── middleware/
│   │   ├── uploadMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   └── Transcription.js
│   ├── providers/
│   │   ├── baseProvider.js
│   │   ├── groqWhisperProvider.js
│   │   ├── openAiWhisperProvider.js
│   │   └── mockProvider.js
│   ├── routes/
│   │   ├── transcriptionRoutes.js
│   │   └── settingsRoutes.js
│   ├── services/
│   │   ├── audioService.js
│   │   ├── transcriptionService.js
│   │   ├── exportService.js
│   │   └── storageService.js
│   └── utils/
│       ├── ffmpeg.js
│       └── timeFormat.js
└── uploads/
    ├── videos/
    ├── audio/
    └── exports/
```

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- *(Optional)* MongoDB (if not running, the app automatically uses local file storage in `server/data/transcriptions.json`)

### Installation

From the project root directory:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running the Application

You can start both backend and frontend concurrently:

```bash
# From root directory
npm run dev
```

Or run them in separate terminals:

```bash
# Terminal 1 - Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2 - Frontend Client (Port 5173)
cd client
npm run dev
```

Visit the application in your browser:
**`http://localhost:5173`**

---

## 5. Backend Transcription Credentials (SaaS Configuration)

As a SaaS platform, all transcription API credentials are maintained exclusively on the backend by the application owner. End users are never prompted for credentials and the client browser never receives secret keys.

Configure the server's environment in `server/.env`:

```env
# Speech-to-Text Engine
TRANSCRIPTION_PROVIDER=gemini

# Server-side secret. Never expose this to the React frontend.
GEMINI_API_KEY=your_gemini_api_key_here
```

### Supported Engines:
- **Google Gemini** (`gemini`): Uses dedicated `gemini-3.5-transcribe` with Google Files API and Interactions API.
- **Groq Whisper** (`whisper-groq`): High-speed Whisper inference via Groq Cloud (`whisper-large-v3`).
- **OpenAI Whisper** (`whisper-openai`): Standard OpenAI transcription (`whisper-1`).
- **Offline / Mock** (`mock`): Local dev/testing fallback.

### Option C: Offline / Mock Provider (Default for Testing)
- Works without any external network access or API keys.
- Generates speech segments sized proportionally to the video duration for immediate UI testing.

---

## 6. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/transcriptions` | Upload video file (`multipart/form-data`) |
| `POST` | `/api/transcriptions/:id/transcribe` | Trigger audio extraction and STT transcription |
| `GET` | `/api/transcriptions` | List all previous transcription jobs |
| `GET` | `/api/transcriptions/:id` | Get single transcription detail with segments |
| `PATCH` | `/api/transcriptions/:id` | Update title or transcript segments |
| `DELETE` | `/api/transcriptions/:id` | Delete transcription and remove media files from disk |
| `GET` | `/api/transcriptions/:id/export?format=txt` | Download plain text transcript |
| `GET` | `/api/transcriptions/:id/export?format=srt` | Download SubRip `.srt` subtitle file |
| `GET` | `/api/transcriptions/:id/export?format=pdf` | Download formatted `.pdf` document |
| `GET` | `/api/transcriptions/:id/export?format=docx` | Download editable Microsoft Word `.docx` file |
| `GET` | `/api/settings` | Get current provider configuration and environment status |
| `POST` | `/api/settings` | Update active provider or API keys at runtime |
#   s u b t i t l e g e n  
 