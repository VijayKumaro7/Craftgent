import React, { useState } from 'react';
import { Save, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface ReportTemplate {
  name: string;
  includeSections: {
    findings: boolean;
    sources: boolean;
    conclusion: boolean;
    metadata: boolean;
    timestamp: boolean;
  };
  styling: {
    theme: 'modern' | 'professional' | 'minimal';
    fontSize: 'small' | 'medium' | 'large';
    color: 'blue' | 'green' | 'purple' | 'red';
  };
}

const DEFAULT_TEMPLATES: Record<string, ReportTemplate> = {
  modern: {
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
  },
  professional: {
    name: 'Professional',
    includeSections: {
      findings: true,
      sources: true,
      conclusion: true,
      metadata: true,
      timestamp: true,
    },
    styling: {
      theme: 'professional',
      fontSize: 'medium',
      color: 'blue',
    },
  },
  minimal: {
    name: 'Minimal',
    includeSections: {
      findings: true,
      sources: true,
      conclusion: true,
      metadata: false,
      timestamp: false,
    },
    styling: {
      theme: 'minimal',
      fontSize: 'medium',
      color: 'blue',
    },
  },
};

interface ReportCustomizerProps {
  onApply: (template: ReportTemplate) => void;
  onClose: () => void;
}

export const ReportCustomizer: React.FC<ReportCustomizerProps> = ({ onApply, onClose }) => {
  const [customTemplate, setCustomTemplate] = useState<ReportTemplate>(DEFAULT_TEMPLATES.modern);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['sections', 'styling'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateSections = (key: keyof ReportTemplate['includeSections'], value: boolean) => {
    setCustomTemplate({
      ...customTemplate,
      includeSections: {
        ...customTemplate.includeSections,
        [key]: value,
      },
    });
  };

  const updateStyling = (key: keyof ReportTemplate['styling'], value: any) => {
    setCustomTemplate({
      ...customTemplate,
      styling: {
        ...customTemplate.styling,
        [key]: value,
      },
    });
  };

  const applyPreset = (preset: string) => {
    setCustomTemplate(DEFAULT_TEMPLATES[preset]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Customize Report</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Presets */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Presets</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(DEFAULT_TEMPLATES).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    customTemplate.styling.theme === preset.styling.theme
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sections Toggle */}
          <div>
            <button
              onClick={() => toggleSection('sections')}
              className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <h3 className="text-lg font-semibold text-gray-900">Report Sections</h3>
              {expandedSections.has('sections') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {expandedSections.has('sections') && (
              <div className="mt-3 space-y-3 pl-4 border-l-4 border-blue-400">
                {[
                  { key: 'findings', label: 'Key Findings' },
                  { key: 'sources', label: 'Sources & References' },
                  { key: 'conclusion', label: 'Conclusion' },
                  { key: 'metadata', label: 'Metadata' },
                  { key: 'timestamp', label: 'Timestamp' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={customTemplate.includeSections[key as keyof ReportTemplate['includeSections']]}
                      onChange={(e) => updateSections(key as keyof ReportTemplate['includeSections'], e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Styling Options */}
          <div>
            <button
              onClick={() => toggleSection('styling')}
              className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <h3 className="text-lg font-semibold text-gray-900">Styling</h3>
              {expandedSections.has('styling') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {expandedSections.has('styling') && (
              <div className="mt-3 space-y-4 pl-4 border-l-4 border-blue-400">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={customTemplate.styling.theme}
                    onChange={(e) => updateStyling('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="modern">Modern</option>
                    <option value="professional">Professional</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                  <select
                    value={customTemplate.styling.fontSize}
                    onChange={(e) => updateStyling('fontSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {['blue', 'green', 'purple', 'red', 'orange'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateStyling('color', color)}
                        className={`w-full h-10 rounded-lg transition ${
                          customTemplate.styling.color === color
                            ? `ring-2 ring-offset-2 ring-${color}-500`
                            : ''
                        }`}
                        style={{
                          backgroundColor: {
                            blue: '#3b82f6',
                            green: '#10b981',
                            purple: '#a855f7',
                            red: '#ef4444',
                            orange: '#f97316',
                          }[color],
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(customTemplate)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Apply Template
          </button>
        </div>
      </div>
    </div>
  );
};
