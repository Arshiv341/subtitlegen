import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, FileCode, FileSpreadsheet } from 'lucide-react';
import { getExportUrl } from '../services/api';

export default function ExportMenu({ transcriptionId, title }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const formats = [
    { key: 'txt', label: 'Plain Text (.txt)', icon: FileText, desc: 'Clean timestamped text' },
    { key: 'srt', label: 'SubRip Subtitles (.srt)', icon: FileCode, desc: 'Synchronized video captions' },
    { key: 'pdf', label: 'PDF Document (.pdf)', icon: FileSpreadsheet, desc: 'Formatted printable report' },
    { key: 'docx', label: 'Word Document (.docx)', icon: FileText, desc: 'Editable Microsoft Word format' },
  ];

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center space-x-2 bg-white border border-border text-primary text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md hover:bg-surface transition-colors shadow-sm"
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Export</span>
        <ChevronDown className="w-3.5 h-3.5 text-secondary" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white border border-border ring-1 ring-black ring-opacity-5 z-20 p-1">
          <div className="px-3 py-2 border-b border-border text-xs text-secondary font-medium uppercase tracking-wider">
            Export Transcript
          </div>
          <div className="py-1">
            {formats.map((fmt) => {
              const Icon = fmt.icon;
              return (
                <a
                  key={fmt.key}
                  href={getExportUrl(transcriptionId, fmt.key)}
                  download
                  onClick={() => setIsOpen(false)}
                  className="flex items-start space-x-3 px-3 py-2 text-xs rounded hover:bg-surface transition-colors text-primary"
                >
                  <Icon className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-primary">{fmt.label}</div>
                    <div className="text-secondary text-[11px]">{fmt.desc}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
