import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

export async function getFFmpeg(onProgress?: (ratio: number) => void) {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  if (onProgress) {
    ffmpeg.on("progress", ({ progress }) => onProgress(progress));
  }

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg;
}

/**
 * Combine a sequence of images and an audio track into a single video.
 * @param images - array of image Files/Blobs, shown in order
 * @param audio - a single audio File/Blob for the soundtrack
 * @param secondsPerImage - how long each image is shown on screen
 * @param onProgress - optional callback (0 to 1)
 */
export async function createVideoFromImages(
  images: File[] | Blob[],
  audio: File | Blob,
  secondsPerImage: number = 3,
  onProgress?: (ratio: number) => void
): Promise<Blob> {
  const ff = await getFFmpeg(onProgress);

  // Write each image into the virtual filesystem, named sequentially
  for (let i = 0; i < images.length; i++) {
    const ext = images[i].type.split("/")[1] || "jpg";
    const filename = `img${String(i).padStart(4, "0")}.${ext}`;
    await ff.writeFile(filename, await fetchFile(images[i]));
  }

  // Write the audio file
  const audioExt = audio.type.split("/")[1] || "mp3";
  await ff.writeFile(`audio.${audioExt}`, await fetchFile(audio));

  // Detect the extension used for the images (assumes uniform type)
  const firstExt = images[0].type.split("/")[1] || "jpg";

  // Build the video from images using a fixed framerate per image
  await ff.exec([
    "-framerate",
    `1/${secondsPerImage}`,
    "-i",
    `img%04d.${firstExt}`,
    "-i",
    `audio.${audioExt}`,
    "-c:v",
    "libx264",
    "-r",
    "30",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    "output.mp4",
  ]);

  const data = await ff.readFile("output.mp4");
  return new Blob([data], { type: "video/mp4" });
}
