import React, { useState } from 'react';
import { Download, Loader } from 'lucide-react';

interface ExportButtonProps {
  sessionId: string;
  onExport?: (format: 'pdf' | 'docx') => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ sessionId, onExport }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportReport = async (format: 'pdf' | 'docx') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/reports/generate?session_id=${sessionId}&format=${format}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${sessionId.substring(0, 8)}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onExport?.(format);
      setShowMenu(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      console.error('Export error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
      >
        {isLoading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>Export Report</span>
      </button>

      {showMenu && !isLoading && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <button
            onClick={() => exportReport('pdf')}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
          >
            📄 Export as PDF
          </button>
          <button
            onClick={() => exportReport('docx')}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-t border-gray-200"
          >
            📝 Export as Word (DOCX)
          </button>
        </div>
      )}

      {error && (
        <div className="absolute right-0 mt-2 px-4 py-2 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm w-48">
          {error}
        </div>
      )}
    </div>
  );
};
