import React, { useState } from 'react';
import { Download, Loader, Mail, X } from 'lucide-react';

interface ExportButtonProps {
  sessionId: string;
  onExport?: (format: 'pdf' | 'docx') => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ sessionId, onExport }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: '', format: 'pdf' as 'pdf' | 'docx' });
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

  const sendEmailReport = async (email: string, format: 'pdf' | 'docx') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/reports/send-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            recipient_email: email,
            format: format,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || `Email send failed: ${response.statusText}`);
      }

      setShowEmailModal(false);
      setEmailForm({ email: '', format: 'pdf' });
      alert(`Report sent to ${email}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email send failed';
      setError(errorMessage);
      console.error('Email error:', err);
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
          <button
            onClick={() => setShowEmailModal(true)}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-t border-gray-200"
          >
            📧 Send via Email
          </button>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Send Report via Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={emailForm.format}
                  onChange={(e) => setEmailForm({ ...emailForm, format: e.target.value as 'pdf' | 'docx' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">Word (DOCX)</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendEmailReport(emailForm.email, emailForm.format)}
                  disabled={isLoading || !emailForm.email}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && !showEmailModal && (
        <div className="absolute right-0 mt-2 px-4 py-2 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm w-48">
          {error}
        </div>
      )}
    </div>
  );
};
