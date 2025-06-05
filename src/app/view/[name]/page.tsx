// app/view/[name]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { EidSubmission } from "../../types";

interface ViewPageProps {
  params: Promise<{
    name: string;
  }>;
}

const ViewPage = ({ params }: ViewPageProps) => {
  const [submission, setSubmission] = useState<EidSubmission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [decodedName, setDecodedName] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      const name = decodeURIComponent(resolvedParams.name);
      setDecodedName(name);
    };
    
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (decodedName) {
      fetchSubmission();
    }
  }, [decodedName]);

  useEffect(() => {
    if (submission && iframeRef.current) {
      renderInIframe();
    }
  }, [submission]);

  const fetchSubmission = async (): Promise<void> => {
    if (!decodedName) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("eid_submissions")
        .select("*")
        .eq("name", decodedName)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError(`No greeting found for "${decodedName}"`);
        } else {
          throw error;
        }
        return;
      }

      if (data) {
        setSubmission(data);
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      setError("Failed to load the greeting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderInIframe = (): void => {
    if (!iframeRef.current || !submission) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (iframeDoc) {
      let fullHtmlContent = submission.html_content;

      // If there's additional CSS, inject it
      if (submission.css_content?.trim()) {
        if (fullHtmlContent.includes('<head>')) {
          fullHtmlContent = fullHtmlContent.replace(
            '</head>',
            `<style>${submission.css_content}</style></head>`
          );
        } else if (fullHtmlContent.includes('<html>')) {
          fullHtmlContent = fullHtmlContent.replace(
            '<html>',
            `<html><head><style>${submission.css_content}</style></head>`
          );
        } else {
          fullHtmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>${submission.css_content}</style>
            </head>
            <body>
              ${fullHtmlContent}
            </body>
            </html>
          `;
        }
      }

      iframeDoc.open();
      iframeDoc.write(fullHtmlContent);
      iframeDoc.close();
    }
  };

  const shareGreeting = async (): Promise<void> => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${decodedName}'s Eid Greeting`,
          text: "Check out this beautiful Eid Mubarak greeting!",
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌙</div>
          <div className="text-xl text-amber-200 mb-2">Loading greeting...</div>
          <div className="text-amber-300">Please wait</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-amber-200 mb-4">Greeting Not Found</h1>
          <p className="text-amber-300 mb-6">{error}</p>
          <div className="space-y-3">
            <a
              href="/"
              className="block bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium"
            >
              Create Your Own Greeting
            </a>
            <a
              href="/gallery"
              className="block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium"
            >
              Browse Gallery
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-amber-900 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a
              href="/gallery"
              className="text-amber-300 hover:text-amber-200 transition-colors p-2 hover:bg-amber-900 hover:bg-opacity-30 rounded-lg"
              title="Back to home"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <div>
              <h1 className="text-xl font-bold text-amber-100">
                {decodedName}'s Eid Greeting
              </h1>
              <p className="text-amber-200 text-sm">
                Created on {new Date(submission?.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={shareGreeting}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center gap-2"
            >
              <span>📤</span>
              <span className="hidden sm:inline">Share</span>
            </button>
            
            <a
              href="/gallery"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
            >
              <span>🌟</span>
              <span className="hidden sm:inline">Gallery</span>
            </a>
            
            <a
              href="/"
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg flex items-center gap-2"
            >
              <span>🎨</span>
              <span className="hidden sm:inline">Create New</span>
            </a>
          </div>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="h-screen" style={{ height: 'calc(100vh - 80px)' }}>
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          title={`${decodedName}'s Eid Greeting`}
          style={{
            backgroundColor: 'white',
          }}
        />
      </div>
    </div>
  );
};

export default ViewPage;