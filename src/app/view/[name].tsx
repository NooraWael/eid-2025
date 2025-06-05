import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { supabase } from "../lib/supabase";
import { EidSubmission } from "../types";

const ViewSubmission: NextPage = () => {
  const router = useRouter();
  const { name } = router.query;
  const [submission, setSubmission] = useState<EidSubmission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (name && typeof name === "string") {
      fetchSubmission(name);
    }
  }, [name]);

  const fetchSubmission = async (submissionName: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("eid_submissions")
        .select("*")
        .eq("name", decodeURIComponent(submissionName))
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setSubmission(data);
      } else {
        setError("Creation not found");
      }
    } catch (err) {
      console.error("Error fetching submission:", err);
      setError("Failed to load creation");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... | Eid Mubarak Canvas</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-4xl mb-4">🌙</div>
            <div className="text-2xl font-semibold">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  if (error || !submission) {
    return (
      <>
        <Head>
          <title>Not Found | Eid Mubarak Canvas</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-6xl mb-4">🌙</div>
            <h1 className="text-3xl font-bold mb-4">Creation Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || "This Eid greeting doesn't exist yet."}
            </p>
            <a
              href="/"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-block"
            >
              Create Your Own 🎨
            </a>
          </div>
        </div>
      </>
    );
  }

  let finalHTML = submission.html_content;

  // Inject additional CSS if provided
  if (submission.css_content?.trim()) {
    const cssInjection = `<style>${submission.css_content}</style></head>`;
    finalHTML = finalHTML.replace("</head>", cssInjection);
  }

  return (
    <>
      <Head>
        <title>{submission.name}'s Eid Greeting | Eid Mubarak Canvas</title>
        <meta
          name="description"
          content={`Beautiful Eid greeting created by ${submission.name}`}
        />
        <meta
          property="og:title"
          content={`${submission.name}'s Eid Greeting`}
        />
        <meta
          property="og:description"
          content="Beautiful Eid Mubarak greeting"
        />
      </Head>

      <div className="min-h-screen relative">
        <div dangerouslySetInnerHTML={{ __html: finalHTML }} />

        {/* Floating creator info */}
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg backdrop-blur-sm">
          <div className="text-sm">
            Created by: <strong>{submission.name}</strong>
          </div>
          <div className="text-xs text-gray-300 mb-2">
            {new Date(submission.created_at).toLocaleDateString()}
          </div>
          <a
            href="/"
            className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
          >
            Create your own →
          </a>
        </div>
      </div>
    </>
  );
};

export default ViewSubmission;
