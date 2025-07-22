"use client";
import * as React from "react";

export default function Home() {
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
  const [result, setResult] = React.useState<ExtractResult | null>(null);

  function validateYouTubeUrl(input: string) {
    return /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)[\w-]{11}/.test(
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 flex flex-col gap-6 relative">
        <h1 className="text-2xl font-bold text-center mb-2">
          YouTube Data Extractor
        </h1>
        <input
          type="text"
          className="border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter YouTube video URL"
          value={url}
          onChange={handleInputChange}
          disabled={loading}
          aria-disabled={loading}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          onClick={handleExtract}
          disabled={loading}
          aria-disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
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
            "Extract Data"
          )}
        </button>
        {error && (
          <div className="text-red-600 text-sm text-center" role="alert">
            {error}
          </div>
        )}
        {result && (
          <>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded p-4 text-xs overflow-x-auto max-h-64 mb-2">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 w-full"
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
              Download JSON
            </button>
          </>
        )}
        {loading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center rounded-lg z-10">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
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
          </div>
        )}
      </div>
    </div>
  );
}
