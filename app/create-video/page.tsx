"use client";

import { useState } from "react";

export default function CreateVideoPage() {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("Please describe the video you want.");
      return;
    }

    setError(null);
    setVideoUrl(null);
    setIsProcessing(true);
    setStatusMessage("Starting your video...");

    try {
      const createRes = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData?.error?.message || "Failed to start video.");
      }

      const videoId = createData.id;
      setStatusMessage("Generating your video, this can take a minute or two...");

      let finished = false;
      let attempts = 0;
      while (!finished && attempts < 60) {
        await new Promise((r) => setTimeout(r, 5000));
        attempts++;

        const statusRes = await fetch(`/api/video?id=${videoId}`);
        const statusData = await statusRes.json();

        if (!statusRes.ok) {
          throw new Error(statusData?.error?.message || "Failed to check status.");
        }

        if (statusData.status === "completed") {
          finished = true;
          setVideoUrl(`/api/video?id=${videoId}&download=1`);
          setStatusMessage("Done!");
        } else if (statusData.status === "failed") {
          throw new Error("Video generation failed. Try a different prompt.");
        } else {
          setStatusMessage(`Status: ${statusData.status}...`);
        }
      }

      if (!finished) {
        throw new Error("This is taking longer than expected. Please check back shortly.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">AI Video Creator</h1>
      <p className="text-sm text-gray-600">
        Describe the video you want. Each generation uses your OpenAI credit balance.
      </p>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Video prompt</label>
        <textarea
          className="w-full border rounded p-2 min-h-[100px]"
          placeholder="A golden retriever running on a beach at sunset..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isProcessing}
        className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
      >
        {isProcessing ? "Generating..." : "Generate video"}
      </button>

      {statusMessage && !error && (
        <p className="text-sm text-gray-600">{statusMessage}</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {videoUrl && (
        <div className="space-y-2">
          <video src={videoUrl} controls className="w-full rounded" />
          <a
            href={videoUrl}
            download="kingdom-ai-video.mp4"
            className="block text-center text-sm underline"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
        }
               
