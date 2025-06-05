"use client";

import { useState, useRef } from "react";

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
  const [fontSize, setFontSize] = useState<number>(14);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);
  const cssTextareaRef = useRef<HTMLTextAreaElement>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 2000);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setHtmlCode(e.target.value);
  };

  const handleCssChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setCssCode(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const textarea = e.currentTarget;
    
    // Allow Ctrl+Z and Ctrl+Y for undo/redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y')) {
      return; // Let browser handle undo/redo
    }
    
    // Tab handling for indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      if (e.shiftKey) {
        // Remove indentation (Shift+Tab)
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        if (value.substring(lineStart, lineStart + 2) === '  ') {
          const newValue = value.substring(0, lineStart) + value.substring(lineStart + 2);
          if (activeTab === "html") {
            setHtmlCode(newValue);
          } else {
            setCssCode(newValue);
          }
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 2;
          });
        }
      } else {
        // Add indentation (Tab)
        const newValue = value.substring(0, start) + "  " + value.substring(end);
        if (activeTab === "html") {
          setHtmlCode(newValue);
        } else {
          setCssCode(newValue);
        }
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      }
    }
    
    // Auto-closing brackets, quotes, and HTML tags
    if (e.key === "{" || e.key === "[" || e.key === "(" || e.key === '"' || e.key === "'" || e.key === ">") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      if (e.key === ">") {
        // Handle HTML tag auto-closing
        const beforeCursor = value.substring(0, start);
        const openTagMatch = beforeCursor.match(/<(\w+)(?:\s[^>]*)?$/);
        
        if (openTagMatch) {
          const tagName = openTagMatch[1];
          // Don't auto-close self-closing tags
          const selfClosingTags = ['br', 'img', 'input', 'meta', 'link', 'hr', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
          
          if (!selfClosingTags.includes(tagName.toLowerCase())) {
            const newValue = value.substring(0, start) + ">" + value.substring(end) + "</" + tagName + ">";
            if (activeTab === "html") {
              setHtmlCode(newValue);
            } else {
              setCssCode(newValue);
            }
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + 1;
            });
            return;
          }
        }
        
        // If not an HTML tag, just insert >
        const newValue = value.substring(0, start) + ">" + value.substring(end);
        if (activeTab === "html") {
          setHtmlCode(newValue);
        } else {
          setCssCode(newValue);
        }
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        });
        return;
      }
      
      // Handle other auto-closing characters
      let closing = "";
      switch (e.key) {
        case "{": closing = "}"; break;
        case "[": closing = "]"; break;
        case "(": closing = ")"; break;
        case '"': closing = '"'; break;
        case "'": closing = "'"; break;
      }
      
      const newValue = value.substring(0, start) + e.key + closing + value.substring(end);
      if (activeTab === "html") {
        setHtmlCode(newValue);
      } else {
        setCssCode(newValue);
      }
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      });
    }

    // Enter key auto-indentation
    if (e.key === "Enter") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const value = textarea.value;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = value.substring(lineStart, start);
      const indent = currentLine.match(/^(\s*)/)?.[1] || '';
      
      // Add extra indent if the line ends with opening brackets
      const extraIndent = /[{(\[]$/.test(currentLine.trim()) ? '  ' : '';
      
      const newValue = value.substring(0, start) + '\n' + indent + extraIndent + value.substring(start);
      if (activeTab === "html") {
        setHtmlCode(newValue);
      } else {
        setCssCode(newValue);
      }
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length + extraIndent.length;
      });
    }
  };

  const copyToClipboard = async (): Promise<void> => {
    try {
      const textToCopy = activeTab === "html" ? htmlCode : cssCode;
      await navigator.clipboard.writeText(textToCopy);
      showNotification("Copied to clipboard! 📋");
    } catch (err) {
      showNotification("Copy failed - please select and copy manually");
    }
  };

  const resetCode = (): void => {
    if (confirm("Are you sure you want to reset this code? This action cannot be undone.")) {
      if (activeTab === "html") {
        setHtmlCode("");
      } else {
        setCssCode("");
      }
      showNotification("Code reset");
    }
  };

  const toggleFullscreen = (): void => {
    setIsFullscreen(!isFullscreen);
    showNotification(isFullscreen ? "Exited fullscreen" : "Entered fullscreen");
  };

  const insertTemplate = (template: string): void => {
    const textarea = activeTab === "html" ? htmlTextareaRef.current : cssTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentCode = activeTab === "html" ? htmlCode : cssCode;
      const newCode = currentCode.substring(0, start) + template + currentCode.substring(end);
      
      if (activeTab === "html") {
        setHtmlCode(newCode);
      } else {
        setCssCode(newCode);
      }
      
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + template.length;
      });
      showNotification("Template inserted!");
    }
  };

  const duplicateLine = (): void => {
    const textarea = activeTab === "html" ? htmlTextareaRef.current : cssTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const value = textarea.value;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = value.indexOf('\n', start);
      const currentLine = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
      
      const newValue = value.substring(0, lineEnd === -1 ? value.length : lineEnd) + 
                      '\n' + currentLine + 
                      value.substring(lineEnd === -1 ? value.length : lineEnd);
      
      if (activeTab === "html") {
        setHtmlCode(newValue);
      } else {
        setCssCode(newValue);
      }
      showNotification("Line duplicated!");
    }
  };

  const getLineCount = (text: string): number => {
    return text.split('\n').length;
  };

  const htmlTemplates = [
    { name: "Div", code: '<div class="">\n  \n</div>' },
    { name: "Button", code: '<button class="">\n  \n</button>' },
    { name: "Image", code: '<img src="" alt="" class="">' },
    { name: "Link", code: '<a href="" class="">\n  \n</a>' },
    { name: "Form", code: '<form>\n  <input type="text" placeholder="">\n  <button type="submit">Submit</button>\n</form>' },
  ];

  const cssTemplates = [
    { name: "Flex", code: 'display: flex;\njustify-content: center;\nalign-items: center;' },
    { name: "Grid", code: 'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 1rem;' },
    { name: "Animation", code: '@keyframes slideIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n.element {\n  animation: slideIn 0.5s ease-out;\n}' },
    { name: "Hover", code: '.element {\n  transition: all 0.3s ease;\n}\n\n.element:hover {\n  transform: scale(1.05);\n}' },
    { name: "Center", code: '.center {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}' },
  ];

  return (
    <div className={`bg-gray-900 flex flex-col border-r border-amber-700 ${isFullscreen ? 'fixed inset-0 z-50' : 'w-1/2'}`}>
      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
          {notification}
        </div>
      )}

      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-gray-800 to-amber-900 border-b border-amber-700 flex-shrink-0">
        {/* Tab Row */}
        <div className="flex items-center justify-between">
          <div className="flex">
            <button
              onClick={() => setActiveTab("html")}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "html"
                  ? "bg-gray-900 text-amber-200 border-b-2 border-amber-400"
                  : "text-amber-300 hover:text-amber-200 hover:bg-gray-800/50"
              }`}
            >
              📄 HTML
            </button>
            <button
              onClick={() => setActiveTab("css")}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "css"
                  ? "bg-gray-900 text-amber-200 border-b-2 border-amber-400"
                  : "text-amber-300 hover:text-amber-200 hover:bg-gray-800/50"
              }`}
            >
              🎨 CSS (Additional)
            </button>
          </div>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="px-3 py-2 text-amber-300 hover:text-amber-200 transition-colors hover:bg-gray-800/50 rounded"
            title={isFullscreen ? "Exit Fullscreen (ESC)" : "Fullscreen Editor"}
          >
            {isFullscreen ? "↙" : "↗"}
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50">
          <div className="flex items-center gap-3 text-xs">
            {/* Font Size Controls */}
            <div className="flex items-center gap-1">
              <span className="text-amber-300">Size:</span>
              <button
                onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                className="px-2 py-1 bg-gray-700 text-amber-200 rounded hover:bg-gray-600 transition-colors"
                title="Decrease font size"
              >
                −
              </button>
              <span className="text-amber-200 min-w-[2.5rem] text-center font-mono">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                className="px-2 py-1 bg-gray-700 text-amber-200 rounded hover:bg-gray-600 transition-colors"
                title="Increase font size"
              >
                +
              </button>
            </div>

            {/* Duplicate Line Button */}
            <button
              onClick={duplicateLine}
              className="px-2 py-1 bg-gray-700 text-amber-200 rounded hover:bg-gray-600 transition-colors"
              title="Duplicate current line"
            >
              ⧉
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Templates */}
            <div className="flex items-center gap-1 mr-2">
              <span className="text-amber-300 text-xs mr-1">Templates:</span>
              {(activeTab === "html" ? htmlTemplates : cssTemplates).slice(0, 3).map((template) => (
                <button
                  key={template.name}
                  onClick={() => insertTemplate(template.code)}
                  className="px-2 py-1 text-xs bg-gray-700 text-amber-200 rounded hover:bg-gray-600 transition-colors"
                  title={`Insert ${template.name} template`}
                >
                  {template.name}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              title="Copy to clipboard"
            >
              📋 Copy
            </button>
            <button
              onClick={resetCode}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
              title="Reset current tab"
            >
              🗑️ Reset
            </button>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Editor */}
        <div className="flex-1 relative overflow-hidden">
          {activeTab === "html" ? (
            <textarea
              ref={htmlTextareaRef}
              value={htmlCode}
              onChange={handleHtmlChange}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-gray-900 text-amber-100 p-4 font-mono resize-none focus:outline-none selection:bg-amber-600 selection:text-white border-none overflow-auto"
              placeholder="Write your HTML here...
              
💡 Pro Tips:
• Tab/Shift+Tab for indentation
• Auto-closing: { [ ( \ ' and HTML tags!
• Type <div> and get <div></div> automatically
• Enter for smart auto-indent
• Ctrl+Z/Y for undo/redo
• Use templates above for quick start"
              style={{ 
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                fontSize: `${fontSize}px`,
                lineHeight: '1.4'
              }}
              spellCheck={false}
            />
          ) : (
            <textarea
              ref={cssTextareaRef}
              value={cssCode}
              onChange={handleCssChange}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-gray-900 text-amber-100 p-4 font-mono resize-none focus:outline-none selection:bg-amber-600 selection:text-white border-none overflow-auto"
              placeholder="Additional CSS (optional)...

💡 Pro Tips:
• This CSS will be injected into your HTML
• Use it to override or add new styles
• Try the template buttons for common patterns
• Ctrl+Z/Y for undo/redo support"
              style={{ 
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                fontSize: `${fontSize}px`,
                lineHeight: '1.4'
              }}
              spellCheck={false}
            />
          )}
        </div>
      </div>

      {/* Enhanced Status Bar */}
      <div className="bg-gray-800 border-t border-amber-700 px-4 py-2 text-xs text-amber-300 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>
            {activeTab === "html" ? "HTML" : "CSS"} • Lines: {getLineCount(activeTab === "html" ? htmlCode : cssCode)} • 
            Characters: {(activeTab === "html" ? htmlCode : cssCode).length}
          </span>
          <span className="text-amber-400">
            Font: {fontSize}px
          </span>
        </div>
        <span className="text-amber-500">
          💡 Tab=indent • Ctrl+Z=undo • Auto-closing HTML tags & brackets
        </span>
      </div>

      <style jsx>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-10px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;