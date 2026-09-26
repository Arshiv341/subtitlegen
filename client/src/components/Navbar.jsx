import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Sliders, Video } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Transcribe', icon: Video },
    { path: '/transcriptions', label: 'Transcriptions', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-85 transition-opacity">
            <span className="font-semibold text-lg tracking-tight">VideoText</span>
          </Link>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-surface text-primary font-semibold'
                      : 'text-secondary hover:text-primary hover:bg-surface/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Minimal Right Workspace Info */}
        <div className="flex items-center space-x-3 text-xs text-secondary">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="hidden sm:inline">Engine Ready</span>
        </div>
      </div>
    </header>
  );
}
