'use client';

import { Download } from 'lucide-react';

export default function ExportButtons() {
  const handleExport = (type: 'csv' | 'json' | 'pdf') => {
    window.open(`/api/export/${type}`, '_blank');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('csv')}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition"
      >
        <Download size={16} /> CSV
      </button>
      <button
        onClick={() => handleExport('json')}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition"
      >
        <Download size={16} /> JSON
      </button>
       {/* PDF is trickier server-side with jsPDF in some envs, but we'll try sending it as a blob if possible or just link */}
       <button
        onClick={() => handleExport('pdf')}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition"
      >
        <Download size={16} /> PDF
      </button>
    </div>
  );
}
