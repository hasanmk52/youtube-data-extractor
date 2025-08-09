"use client";
import * as React from "react";

export default function Home() {
  const [result, setResult] = React.useState<ExtractResult | null>(null);
  // Only keep one set of state, type, and handler definitions

  function validateYouTubeUrl(input: string) {
    return /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)\w{11}/.test(
      input
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError("");
  };

  const handleExtract = async () => {
    setError("");
    setResult(null);
    if (!validateYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to extract data.");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Only keep one set of state, type, and handler definitions
  const [url, setUrl] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  type ExtractResult = {
    videoId?: string;
    title?: string;
    description?: string;
    channelTitle?: string;
    transcript?: unknown;
    transcriptError?: string | null;
    comments?: Array<{ author: string; text: string }>;
    commentsError?: string | null;
    [key: string]: unknown;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4 font-sans relative">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full bg-gradient-to-br from-blue-300/20 via-white/10 to-zinc-300/20 blur-xl"></div>
      </div>
      <div className="relative z-10 w-full max-w-lg bg-white/90 dark:bg-zinc-900/90 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-12 flex flex-col gap-10 transition-all duration-300 backdrop-blur-lg">
        <div className="flex flex-col items-center gap-3 mb-4">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-12 mb-2 drop-shadow-lg"
          />
          <h1 className="text-4xl font-black text-blue-700 dark:text-blue-400 text-center tracking-tight drop-shadow">
            YouTube Data Extractor
          </h1>
          <p className="text-base text-zinc-500 dark:text-zinc-400 text-center font-medium">
            Extract video details, transcript, and comments in one click.
          </p>
        </div>
        <hr className="border-zinc-200 dark:border-zinc-700 mb-2" />
        <input
          type="text"
          className="border border-zinc-300 dark:border-zinc-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all shadow-sm"
          placeholder="Paste YouTube video URL here"
          value={url}
          onChange={handleInputChange}
          disabled={loading}
          aria-disabled={loading}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          onClick={handleExtract}
          disabled={loading}
          aria-disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Extracting...
            </span>
          ) : (
            <>
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="10" cy="10" r="10" fill="#2563eb" />
                <path
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 10h6m-3-3 3 3-3 3"
                />
              </svg>
              Extract Data
            </>
          )}
        </button>
        {error && (
          <div
            className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl p-4 text-center font-semibold shadow transition-all animate-fade-in"
            role="alert"
          >
            {error}
          </div>
        )}
        {result && (
          <>
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-5 text-xs overflow-x-auto max-h-64 mb-2 border border-zinc-200 dark:border-zinc-700 shadow-inner transition-all animate-fade-in">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all w-full flex items-center justify-center gap-2"
              onClick={() => {
                const blob = new Blob([JSON.stringify(result, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `youtube-data-${result.videoId || "video"}.json`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }, 100);
              }}
              disabled={loading}
              aria-disabled={loading}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                fill="none"
              >
                <circle cx="16" cy="16" r="14" fill="#22c55e" />
                <path
                  d="M16 12v8"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M12 20l4 4 4-4"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download JSON
            </button>
          </>
        )}
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 flex flex-col items-center justify-center rounded-3xl z-20 transition-all backdrop-blur-md">
            <svg
              className="animate-spin h-10 w-10 text-blue-600 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <div className="text-lg font-semibold text-blue-700 dark:text-blue-400 animate-pulse text-center">
              Extracting data from YouTube... Please wait!
            </div>
          </div>
        )}
      </div>
      <footer className="mt-10 text-xs text-zinc-400 dark:text-zinc-600 text-center z-10">
        &copy; {new Date().getFullYear()} YouTube Data Extractor. Powered by
        Next.js & Vercel.
      </footer>
    </div>
  );
}
