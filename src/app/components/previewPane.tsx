"use client";

import { useEffect, useRef } from "react";

interface PreviewPaneProps {
  htmlCode: string;
  cssCode: string;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ htmlCode, cssCode }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        let finalHTML = htmlCode;

        // Inject additional CSS if provided
        if (cssCode.trim()) {
          const cssInjection = `<style>${cssCode}</style></head>`;
          finalHTML = finalHTML.replace("</head>", cssInjection);
        }

        iframeDoc.open();
        iframeDoc.write(finalHTML);
        iframeDoc.close();
      }
    }
  }, [htmlCode, cssCode]);

  return (
    <div className="w-1/2 bg-white">
      <div className="h-full">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-none"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default PreviewPane;
