import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Section {
  title: string;
  content: string;
}

interface ReportPreviewProps {
  title: string;
  sections: Section[];
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ title, sections }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.title))
  );

  const toggleSection = (sectionTitle: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionTitle)) {
      newExpanded.delete(sectionTitle);
    } else {
      newExpanded.add(sectionTitle);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-blue-100 text-sm mt-2">
          Preview • {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Sections */}
      <div className="divide-y divide-gray-200">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.title);
          return (
            <div key={section.title} className="border-l-4 border-blue-400">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h2>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-6 pb-4 bg-gray-50">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-gray-500 text-xs text-center">
          This is a preview of how your report will appear in PDF/DOCX format
        </p>
      </div>
    </div>
  );
};
