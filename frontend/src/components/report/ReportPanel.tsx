import React, { useEffect, useState } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { ExportButton } from './ExportButton';

interface ReportPanelProps {
  sessionId: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
}

export const ReportPanel: React.FC<ReportPanelProps> = ({ sessionId, messages }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await fetch(
          `/api/reports/preview?session_id=${sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch report preview');
        }

        const data = await response.json();
        setPreviewData(data.preview);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load preview';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-red-900 font-semibold">Error Loading Report</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const extractedFindings = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)
    .filter(content => content.length > 0)
    .slice(0, 5);

  const extractedSources = messages
    .flatMap(m => m.content.match(/https?:\/\/[^\s]+/g) || [])
    .slice(0, 5);

  const conclusion = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)
    .pop()
    ?.substring(0, 500) || '';

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg print:shadow-none">
      {/* Header */}
      <div className="mb-8 pb-8 border-b-2 border-gray-200 print:border-gray-400">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Research Report</h1>
              <p className="text-gray-500 text-sm mt-1">
                Generated on {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="print:hidden">
            <ExportButton sessionId={sessionId} />
          </div>
        </div>

        {previewData && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Messages:</span>
              <p className="font-semibold">{previewData.message_count}</p>
            </div>
            <div>
              <span className="text-gray-600">Session ID:</span>
              <p className="font-mono text-xs">{sessionId.substring(0, 8)}...</p>
            </div>
          </div>
        )}
      </div>

      {/* Key Findings */}
      {extractedFindings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Findings</h2>
          <div className="space-y-3">
            {extractedFindings.map((finding, idx) => (
              <div
                key={idx}
                className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded"
              >
                <p className="text-gray-700 text-sm line-clamp-3">
                  {finding.substring(0, 300)}
                  {finding.length > 300 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sources */}
      {extractedSources.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sources</h2>
          <ul className="space-y-2">
            {extractedSources.map((source, idx) => (
              <li key={idx}>
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm break-all"
                >
                  {source}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Conclusion */}
      {conclusion && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Conclusion</h2>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-700 leading-relaxed">{conclusion}</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-gray-500 text-xs">
          Generated by Craftgent AI Agent • {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
