"use client";

import { useState } from "react";

export default function CreateVideoPage() {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

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
      // Step 1: kick off the job on our secure server route
      const createRes = await fetch("/api/generate-video", {
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

      // Step 2: poll until the job is done
      let finished = false;
      let attempts = 0;
      while (!finished && attempts < 60) {
        await new Promise((r) => setTimeout(r, 5000));
        attempts++;

        const statusRes = await fetch(`/api/video-status?id=${videoId}`);
        const statusData = await statusRes.json();

        if (!statusRes.ok) {
          throw new Error(statusData?.error?.message || "Failed to check status.");
        }

        if (statusData.status === "completed") {
          finished = true;
          setVideoUrl(`/api/video-status?id=${videoId}&download=1`);
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
        // File path in your repo: app/api/generate-video/route.js
//
// This runs on the server only. Your OPENAI_API_KEY never reaches
// the browser or the public website — it stays hidden here.

export async function POST(request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Server is missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { error: "Missing 'prompt' in request body" },
        { status: 400 }
      );
    }

    const createResp = await fetch("https://api.openai.com/v1/videos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sora-2",
        prompt: prompt,
        seconds: "8",
        size: "720x1280",
      }),
    });

    const data = await createResp.json();

    if (!createResp.ok) {
      return Response.json({ error: data }, { status: createResp.status });
    }

    // Returns a job id + status. Frontend polls /api/video-status?id=... next.
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
        }
          // File path in your repo: app/api/video-status/route.js
//
// Checks job status. When ?download=1 is added and the video is ready,
// this streams the actual MP4 file back through our server (so the
// browser never needs direct access to OpenAI or your API key).

export async function GET(request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("id");
  const wantsDownload = searchParams.get("download") === "1";

  if (!apiKey) {
    return Response.json(
      { error: "Server is missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }
  if (!videoId) {
    return Response.json({ error: "Missing 'id' parameter" }, { status: 400 });
  }

  try {
    if (wantsDownload) {
      const contentResp = await fetch(
        `https://api.openai.com/v1/videos/${videoId}/content`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      if (!contentResp.ok) {
        const errData = await contentResp.json().catch(() => ({}));
        return Response.json({ error: errData }, { status: contentResp.status });
      }

      return new Response(contentResp.body, {
        status: 200,
        headers: {
          "Content-Type": "video/mp4",
          "Cache-Control": "no-store",
        },
      });
    }

    const statusResp = await fetch(
      `https://api.openai.com/v1/videos/${videoId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const data = await statusResp.json();

    if (!statusResp.ok) {
      return Response.json({ error: data }, { status: statusResp.status });
    }

    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
  
