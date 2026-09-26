import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Transcriptions from './pages/Transcriptions';
import TranscriptDetail from './pages/TranscriptDetail';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="min-h-screen bg-page flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/transcriptions" element={<Transcriptions />} />
          <Route path="/transcriptions/:id" element={<TranscriptDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
