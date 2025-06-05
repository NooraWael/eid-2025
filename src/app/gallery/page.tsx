"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { EidSubmission } from "../types";

const Gallery = () => {
  const [submissions, setSubmissions] = useState<EidSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  const fetchAllSubmissions = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("eid_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((submission) =>
    submission.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-black flex items-center justify-center relative overflow-hidden">
        {/* Background stars */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 text-4xl text-amber-400 opacity-30 animate-pulse">
            ✨
          </div>
          <div className="absolute top-32 right-20 text-3xl text-amber-400 opacity-20 animate-pulse">
            ⭐
          </div>
          <div className="absolute bottom-20 left-32 text-5xl text-amber-400 opacity-25 animate-pulse">
            🌙
          </div>
          <div className="absolute top-1/2 right-10 text-2xl text-amber-400 opacity-30 animate-pulse">
            ✨
          </div>
        </div>

        <div className="text-center relative z-10">
          <div className="text-7xl mb-6 animate-bounce">🌙</div>
          <div className="text-3xl font-semibold text-amber-200 mb-2">
            Loading Gallery...
          </div>
          <div className="text-amber-300">Discovering beautiful creations</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-black relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl text-amber-400 opacity-10">
          ✨
        </div>
        <div className="absolute top-20 right-20 text-4xl text-amber-400 opacity-15">
          🌙
        </div>
        <div className="absolute bottom-20 left-20 text-5xl text-amber-400 opacity-10">
          ⭐
        </div>
        <div className="absolute top-1/2 right-32 text-3xl text-amber-400 opacity-15">
          🏮
        </div>
        <div className="absolute bottom-32 right-10 text-4xl text-amber-400 opacity-10">
          ✨
        </div>

        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, rgba(255, 215, 0, 0.03) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-amber-900 border-b border-amber-700 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-amber-400 hover:text-amber-300 transition-colors p-2 hover:bg-amber-900 hover:bg-opacity-30 rounded-lg"
                title="Back to home"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </a>
              <div>
                <h1 className="text-3xl font-bold text-amber-100 flex items-center gap-3">
                  <span className="text-4xl">🌟</span>
                  Eid Creations Gallery
                </h1>
                <p className="text-amber-200 text-sm mt-1">
                  {submissions.length} beautiful greeting
                  {submissions.length !== 1 ? "s" : ""} from our community
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-amber-100 border border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-amber-300 w-full md:w-64"
                />
                <svg
                  className="w-5 h-5 text-amber-300 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <a
                href="/"
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-lg transform hover:scale-105 flex items-center gap-2"
              >
                <span>Create New</span>
                <span>🎨</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🌙</div>
            <h2 className="text-3xl font-semibold text-amber-200 mb-4">
              {searchTerm ? "No results found" : "No creations yet"}
            </h2>
            <p className="text-amber-300 mb-8 text-lg">
              {searchTerm
                ? `No creators found matching "${searchTerm}"`
                : "Be the first to create a beautiful Eid greeting!"}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium mr-4"
              >
                Clear Search
              </button>
            ) : null}
            <a
              href="/"
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium inline-block"
            >
              Create First Greeting 🎨
            </a>
          </div>
        ) : (
          <>
            {/* Results header */}
            {searchTerm && (
              <div className="mb-6 text-center">
                <p className="text-amber-200">
                  Found {filteredSubmissions.length} result
                  {filteredSubmissions.length !== 1 ? "s" : ""} for "
                  {searchTerm}"
                </p>
              </div>
            )}

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="group relative bg-gradient-to-br from-amber-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-amber-200 transform hover:-translate-y-2"
                >
                  {/* Card Content */}
                  <div className="p-6">
                    {/* Creator name */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-amber-800 truncate">
                        {submission.name}
                      </h3>
                      <div className="text-2xl">🌙</div>
                    </div>

                    {/* Preview area */}
                    <div className="bg-gray-100 rounded-lg h-32 mb-4 flex items-center justify-center border border-amber-200">
                      <div className="text-center text-gray-500">
                        <div className="text-3xl mb-2">🎨</div>
                        <span className="text-sm">Eid Greeting</span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-amber-600 mb-4">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(submission.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                        HTML/CSS
                      </span>
                    </div>

                    {/* View button */}
                    <a
                      href={`/view/${encodeURIComponent(submission.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 px-4 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium text-center block group-hover:shadow-lg"
                    >
                      View Creation
                    </a>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>

            {/* Load more hint */}
            {submissions.length > 12 && (
              <div className="text-center mt-12 py-8 border-t border-amber-700">
                <p className="text-amber-200 mb-4">
                  Showing all {submissions.length} creations
                </p>
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Gallery;
