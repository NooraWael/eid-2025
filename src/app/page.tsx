"use client";

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import CodeEditor from "./components/codeEditor";
import PreviewPane from "./components/previewPane";
import { EidSubmission } from "./types";

const defaultHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Eid Mubarak!</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: radial-gradient(circle at center, #1e1b29 0%, #0e0c18 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      overflow: hidden;
    }

    .container {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 0 40px rgba(185, 123, 255, 0.15), 0 0 100px rgba(255, 215, 0, 0.05);
      backdrop-filter: blur(20px);
      padding: 3rem;
      border-radius: 1.5rem;
      max-width: 480px;
      text-align: center;
      position: relative;
      isolation: isolate;
    }

    .glow-ring {
      position: absolute;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%);
      border-radius: 50%;
      z-index: -1;
      filter: blur(60px);
      animation: pulse 6s infinite ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.7; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.15); }
    }

    h1 {
      font-size: 2.5rem;
      background: linear-gradient(to right, #ffe88d, #dcbf62);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
    }

    .crescent {
      font-size: 3.5rem;
      filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.7));
      margin-bottom: 0.5rem;
      animation: spinIn 2.5s ease-out;
    }

    @keyframes spinIn {
      from { opacity: 0; transform: rotate(360deg) scale(0.2); }
      to { opacity: 1; transform: rotate(0deg) scale(1); }
    }

    .message {
      font-size: 1.1rem;
      color: #c0b0ff;
      line-height: 1.6;
      margin-bottom: 1.2rem;
    }

    .decoration {
      color: #d4af37;
      font-size: 1.5rem;
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <div class="glow-ring"></div>
  <div class="container">
    <div class="crescent">🌙</div>
    <h1>Eid Mubarak</h1>
    <p class="message">
      May this blessed celebration bring you peace, joy, and prosperity.<br>
      <em>كل عام وأنتم بخير</em>
    </p>
    <div class="decoration">✦ ✧ ✦</div>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof gsap !== 'undefined') {
        gsap.from(".container", {
          scale: 0.8,
          opacity: 0,
          duration: 1.2,
          ease: "power2.out"
        });
        gsap.from(".message", {
          y: 30,
          opacity: 0,
          duration: 1,
          delay: 0.8,
          ease: "power2.out"
        });
      }
    });
  </script>
</body>
</html>`;

const Home = () => {
  const [name, setName] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [htmlCode, setHtmlCode] = useState<string>(defaultHtmlTemplate);
  const [cssCode, setCssCode] = useState<string>("");
  const [submissions, setSubmissions] = useState<EidSubmission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("eid_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!name.trim()) {
      alert("Please enter your name!");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("eid_submissions")
        .insert([
          {
            name: name.trim(),
            html_content: htmlCode,
            css_content: cssCode.trim() || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      alert("Your Eid greeting has been saved! 🌙");
      await fetchSubmissions();
      // Redirect to their creation
      window.open(`/view/${encodeURIComponent(name.trim())}`, "_blank");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving your creation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startCreating = (): void => {
    if (!name.trim()) {
      alert("Please enter your name first!");
      return;
    }
    setIsCreating(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      startCreating();
    }
  };

  const goToGallery = (): void => {
    window.location.href = "/gallery";
  };

  if (!isCreating) {
    return (
      <div className="relative min-h-screen flex bg-[#0f0e17] text-white overflow-hidden">
        {/* Left Section - Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-start p-10 md:p-20 z-10 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-yellow-300 to-yellow-500 text-transparent bg-clip-text">
            Eid Developer Style
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-md">
            Design a glowing Eid greeting and share it with the world ✨
          </p>

          <input
            type="text"
            placeholder="Your name..."
            value={name}
            onChange={handleNameChange}
            onKeyPress={handleKeyPress}
            maxLength={50}
            className="w-full max-w-sm px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <button
              onClick={startCreating}
              disabled={!name.trim()}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🚀 Start Creating
            </button>

            <button
              onClick={goToGallery}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold py-3 rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              Gallery
              <span className="bg-indigo-800 px-2 py-1 rounded-full text-xs">
                {submissions.length}
              </span>
            </button>
            
          </div>

          {submissions.length > 0 && (
            <div className="pt-6 text-sm text-gray-400 space-y-1">
              <p className="text-white font-medium">Recent Creations:</p>
              {submissions.slice(0, 3).map((submission) => (
                <a
                  key={submission.id}
                  href={`/view/${encodeURIComponent(submission.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-purple-400 transition-colors"
                >
                  {submission.name}'s Creation →
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right Section - Glow Visual */}
        <div className="hidden md:flex w-1/2 relative items-center justify-center overflow-hidden">
          {/* Central Glow Orb */}
          <div className="absolute w-[500px] h-[500px] bg-purple-600 opacity-30 rounded-full blur-[150px]"></div>

          {/* Crescent or Illustration */}
          <div className="z-10 text-[8rem] animate-pulse drop-shadow-[0_0_40px_rgba(255,215,0,0.6)]">
            🌙
          </div>
        </div>

        {/* Gallery Button Floating (mobile only) */}
        <button
          onClick={goToGallery}
          className="md:hidden absolute top-6 right-6 z-20 bg-purple-600 text-white px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-md"
        >
          🖼️
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-amber-900 p-4 flex justify-between items-center border-b border-amber-700">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-amber-100 font-medium">
            {name}'s Eid Greeting
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Gallery Button in Editor */}
          <button
            onClick={goToGallery}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
          >
            <span>🌟</span>
            <span className="hidden sm:inline">Gallery</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? "Saving..." : "Save & Share 🌙"}
          </button>
        </div>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 flex">
        <CodeEditor
          htmlCode={htmlCode}
          setHtmlCode={setHtmlCode}
          cssCode={cssCode}
          setCssCode={setCssCode}
        />
        <PreviewPane htmlCode={htmlCode} cssCode={cssCode} />
      </div>
    </div>
  );
};

export default Home;
