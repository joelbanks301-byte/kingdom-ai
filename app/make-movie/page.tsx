"use client";

import { useState } from "react";
import { makeMovieFromClips } from "@/lib/ffmpeg";

export default function MakeMoviePage() {
  const [clips, setClips] = useState<File[]>([]);
  const [music, setMusic] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function moveClip(index: number, direction: -1 | 1) {
    const newClips = [...clips];
    const target = index + direction;
    if (target < 0 || target >= newClips.length) return;
    [newClips[index], newClips[target]] = [newClips[target], newClips[index]];
    setClips(newClips);
  }

  function removeClip(index: number) {
    setClips(clips.filter((_, i) => i !== index));
  }

  async function handleGenerate() {
    if (clips.length === 0) {
      setError("Please select at least one video clip.");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setVideoUrl(null);

    try {
      const blob = await makeMovieFromClips(clips, music ?? undefined, (ratio) =>
        setProgress(ratio)
      );
      setVideoUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError("Something went wrong while making the movie.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Make Movie</h1>
      <p className="text-sm text-gray-500">
        Combine multiple video clips into one movie, with optional background music.
      </p>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Video clips</label>
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => setClips(Array.from(e.target.files ?? []))}
        />
        {clips.length > 0 && (
          <ul className="space-y-1">
            {clips.map((clip, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-xs bg-gray-100 rounded px-2 py-1"
              >
                <span className="truncate">{i + 1}. {clip.name}</span>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => moveClip(i, -1)} className="px-1">↑</button>
                  <button onClick={() => moveClip(i, 1)} className="px-1">↓</button>
                  <button onClick={() => removeClip(i)} className="px-1 text-red-500">✕</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Background music (optional)</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setMusic(e.target.files?.[0] ?? null)}
        />
        {music && <p className="text-xs text-gray-500">{music.name}</p>}
      </div>

      <button
        onClick={handleGenerate}
        disabled={isProcessing}
        className="w-full bg-black text-white rounded-lg py-2 font-medium disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Make Movie"}
      </button>

      {isProcessing && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-black h-2 rounded-full transition-all"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {videoUrl && (
        <div className="space-y-2">
          <video src={videoUrl} controls className="w-full rounded-lg" />
          <a
            href={videoUrl}
            download="kingdom-ai-movie.mp4"
            className="block text-center bg-gray-100 rounded-lg py-2 font-medium"
          >
            Download Movie
          </a>
        </div>
      )}
    </div>
  );
}
