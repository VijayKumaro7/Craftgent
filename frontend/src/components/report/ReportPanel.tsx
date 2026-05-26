import React, { useEffect, useState } from 'react';
import { FileText, AlertCircle, Settings } from 'lucide-react';
import { ExportButton } from './ExportButton';
import { ReportCustomizer, type ReportTemplate } from './ReportCustomizer';

interface ReportPanelProps {
  sessionId: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
}

const DEFAULT_TEMPLATE: ReportTemplate = {
  name: 'Modern',
  includeSections: {
    findings: true,
    sources: true,
    conclusion: true,
    metadata: true,
    timestamp: true,
  },
  styling: {
    theme: 'modern',
    fontSize: 'medium',
    color: 'blue',
  },
};

export const ReportPanel: React.FC<ReportPanelProps> = ({ sessionId, messages }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [template, setTemplate] = useState<ReportTemplate>(DEFAULT_TEMPLATE);
  const [showCustomizer, setShowCustomizer] = useState(false);

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

  const themeColors = {
    blue: { primary: '#2563eb', light: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
    green: { primary: '#059669', light: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    purple: { primary: '#7c3aed', light: '#a78bfa', bg: '#f5f3ff', border: '#ddd6fe' },
    red: { primary: '#dc2626', light: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  };

  const color = themeColors[template.styling.color as keyof typeof themeColors] || themeColors.blue;

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
    <>
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg print:shadow-none">
        {/* Header */}
        <div className="mb-8 pb-8 border-b-2 border-gray-200 print:border-gray-400">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" style={{ color: color.primary }} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Research Report</h1>
                <p className="text-gray-500 text-sm mt-1">
                  {template.name} Theme • Generated on {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="print:hidden flex gap-2">
              <button
                onClick={() => setShowCustomizer(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Customize
              </button>
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
        {template.includeSections.findings && extractedFindings.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: color.primary }}>
              Key Findings
            </h2>
            <div className="space-y-3">
              {extractedFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded border-l-4"
                  style={{ backgroundColor: color.bg, borderColor: color.primary }}
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
        {template.includeSections.sources && extractedSources.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: color.primary }}>
              Sources
            </h2>
            <ul className="space-y-2">
              {extractedSources.map((source, idx) => (
                <li key={idx}>
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm break-all hover:underline"
                    style={{ color: color.light }}
                  >
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Conclusion */}
        {template.includeSections.conclusion && conclusion && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: color.primary }}>
              Conclusion
            </h2>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: color.bg, borderColor: color.border }}>
              <p className="text-gray-700 leading-relaxed">{conclusion}</p>
            </div>
          </section>
        )}

        {/* Metadata */}
        {template.includeSections.metadata && previewData && (
          <section className="mb-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Metadata</h3>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>Session: {previewData.session_id?.substring(0, 8)}...</div>
              <div>Messages: {previewData.message_count}</div>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-xs">
            {template.includeSections.timestamp && (
              <>Generated by Craftgent AI Agent • {new Date().toLocaleTimeString()}</>
            )}
          </p>
        </div>
      </div>

      {/* Customizer Modal */}
      {showCustomizer && (
        <ReportCustomizer
          onApply={(newTemplate) => {
            setTemplate(newTemplate);
            setShowCustomizer(false);
          }}
          onClose={() => setShowCustomizer(false)}
        />
      )}
    </>
  );
};
