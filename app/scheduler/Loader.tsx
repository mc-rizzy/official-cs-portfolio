'use client';

import React, { useRef } from 'react';
import "./block.css"

interface ImportExportButtonsProps<T> {
  data: T; // The state/blocks data you want to export
  onImport: (importedData: T) => void; // Callback when a valid file is loaded
  className?: string;
}

export function ImportExportButtons<T>({
  data,
  onImport,
  className = '',
}: ImportExportButtonsProps<T>) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Export Handler: Converts state to a downloadable JSON file
  const handleExport = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `SCHEDULE backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Import Handler: Reads uploaded file and parses JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImport(parsed);
      } catch (err) {
        alert('Failed to parse JSON file. Please make sure it is a valid format.');
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);

    // Reset input value so re-uploading the same file still triggers onChange
    e.target.value = '';
  };

  return (
    <div className={`loaderGroup fixed top-4 right-4 z-50 flex items-center gap-2 ${className}`}>
      {/* Hidden file input triggered by Import button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Import Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="loaderButton flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 rounded-md shadow-sm backdrop-blur-sm transition-all duration-150 active:scale-95 cursor-pointer"
        title="Import JSON data"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import
      </button>

      {/* Export Button */}
      <button
        type="button"
        onClick={handleExport}
        className="loaderButton flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 rounded-md shadow-sm backdrop-blur-sm transition-all duration-150 active:scale-95 cursor-pointer"
        title="Export JSON data"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>
    </div>
  );
}