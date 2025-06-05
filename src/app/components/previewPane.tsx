"use client";

import { useEffect, useRef, useState } from "react";

interface PreviewPaneProps {
  htmlCode: string;
  cssCode: string;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ htmlCode, cssCode }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      updatePreview();
      setIsLoading(false);
      setLastUpdate(new Date());
    }, 300); // Debounce updates

    return () => clearTimeout(timer);
  }, [htmlCode, cssCode]);

  const updatePreview = (): void => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        let finalHTML = htmlCode;

        // Inject additional CSS if provided
        if (cssCode.trim()) {
          const cssInjection = `<style>${cssCode}</style></head>`;
          finalHTML = finalHTML.replace("</head>", cssInjection);
        }

        // Add meta viewport for responsive support
        if (!finalHTML.includes('viewport')) {
          finalHTML = finalHTML.replace(
            '<head>',
            '<head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
          );
        }

        iframeDoc.open();
        iframeDoc.write(finalHTML);
        iframeDoc.close();

        // Scroll to top after content loads
        setTimeout(() => {
          if (iframe.contentWindow) {
            iframe.contentWindow.scrollTo(0, 0);
          }
        }, 100);
      }
    }
  };

  const refreshPreview = (): void => {
    setIsLoading(true);
    setTimeout(() => {
      updatePreview();
      setIsLoading(false);
      setLastUpdate(new Date());
    }, 100);
  };

  const openInNewTab = (): void => {
    let finalHTML = htmlCode;
    if (cssCode.trim()) {
      const cssInjection = `<style>${cssCode}</style></head>`;
      finalHTML = finalHTML.replace("</head>", cssInjection);
    }

    const blob = new Blob([finalHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Clean up the URL object after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadHTML = (): void => {
    let finalHTML = htmlCode;
    if (cssCode.trim()) {
      const cssInjection = `<style>${cssCode}</style></head>`;
      finalHTML = finalHTML.replace("</head>", cssInjection);
    }

    const blob = new Blob([finalHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eid-greeting.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = (): void => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`bg-gray-900 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : 'w-1/2 max-h-[100vh]'}`}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10 flex-shrink-0">
        {/* Title Bar */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-4 text-sm text-gray-300 font-medium flex items-center gap-2">
              🖥️ Live Preview
              {isLoading && (
                <div className="animate-spin w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full"></div>
              )}
            </span>
          </div>
          
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 text-gray-400 hover:text-gray-200 transition-colors text-sm hover:bg-gray-700 rounded"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
          >
            {isFullscreen ? "↙" : "↗"}
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Desktop Preview</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={refreshPreview}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              title="Refresh Preview"
            >
              🔄 Refresh
            </button>
            <button
              onClick={openInNewTab}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
              title="Open in New Tab"
            >
              🔗 Open
            </button>
            <button
              onClick={downloadHTML}
              className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
              title="Download HTML File"
            >
              💾 Download
            </button>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 bg-gray-900 overflow-hidden min-h-0">
        <div className="w-full h-full relative">
          <iframe
            ref={iframeRef}
            className="w-full h-full border-none"
            title="Eid Greeting Preview"
            sandbox="allow-scripts allow-same-origin"
          />
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-300 text-sm">Updating preview...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-3 py-2 text-xs text-gray-400 flex justify-between items-center flex-shrink-0">
        <span>
          Last updated: {lastUpdate.toLocaleTimeString()} • Desktop View
        </span>
        <span className="flex items-center gap-4">
          <span>💡 Changes update automatically</span>
          {htmlCode.length > 0 && (
            <span className="text-green-400">✓ Ready</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default PreviewPane;