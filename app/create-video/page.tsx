"use client";

import { useState } from "react";
import { createVideoFromImages } from "@/lib/ffmpeg";

export default function CreateVideoPage() {
  const [images, setImages] = useState<File[]>([]);
  const [audio, setAudio] = useState<File | null>(null);
  const [secondsPerImage, setSecondsPerImage] = useState(3);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (images.length === 0 || !audio) {
      setError("Please select at least one image and an audio file.");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setVideoUrl(null);

    try {
      const blob = await createVideoFromImages(
        images,
        audio,
        secondsPerImage,
        (ratio) => setProgress(ratio)
      );
      setVideoUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError("Something went wrong while creating the video.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Video</h1>
      <p className="text-sm text-gray-500">
        Turn a set of images and an audio track into a video.
      </p>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files ?? []))}
        />
        {images.length > 0 && (
          <p className="text-xs text-gray-500">{images.length} image(s) selected</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Audio</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudio(e.target.files?.[0] ?? null)}
        />
        {audio && <p className="text-xs text-gray-500">{audio.name}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Seconds per image: {secondsPerImage}
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={secondsPerImage}
          onChange={(e) => setSecondsPerImage(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isProcessing}
        className="w-full bg-black text-white rounded-lg py-2 font-medium disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Generate Video"}
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
            download="kingdom-ai-video.mp4"
            className="block text-center bg-gray-100 rounded-lg py-2 font-medium"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
    }
