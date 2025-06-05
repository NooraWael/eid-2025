"use client";

import { useState } from "react";

interface CodeEditorProps {
  htmlCode: string;
  setHtmlCode: (code: string) => void;
  cssCode: string;
  setCssCode: (code: string) => void;
}

type TabType = "html" | "css";

const CodeEditor: React.FC<CodeEditorProps> = ({
  htmlCode,
  setHtmlCode,
  cssCode,
  setCssCode,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("html");

  const handleHtmlChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setHtmlCode(e.target.value);
  };

  const handleCssChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setCssCode(e.target.value);
  };

  return (
    <div className="w-1/2 bg-gray-900 flex flex-col border-r border-amber-700">
      {/* Tabs */}
      <div className="flex bg-gradient-to-r from-gray-800 to-amber-900">
        <button
          onClick={() => setActiveTab("html")}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "html"
              ? "bg-gray-900 text-amber-200 border-b-2 border-amber-400"
              : "text-amber-300 hover:text-amber-200"
          }`}
        >
          HTML
        </button>
        <button
          onClick={() => setActiveTab("css")}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "css"
              ? "bg-gray-900 text-amber-200 border-b-2 border-amber-400"
              : "text-amber-300 hover:text-amber-200"
          }`}
        >
          CSS (Additional)
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1">
        {activeTab === "html" ? (
          <textarea
            value={htmlCode}
            onChange={handleHtmlChange}
            className="w-full h-full bg-gray-900 text-amber-100 p-4 font-mono text-sm resize-none focus:outline-none selection:bg-amber-600 selection:text-white"
            placeholder="Write your HTML here..."
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
            spellCheck={false}
          />
        ) : (
          <textarea
            value={cssCode}
            onChange={handleCssChange}
            className="w-full h-full bg-gray-900 text-amber-100 p-4 font-mono text-sm resize-none focus:outline-none selection:bg-amber-600 selection:text-white"
            placeholder="Additional CSS (optional)..."
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
