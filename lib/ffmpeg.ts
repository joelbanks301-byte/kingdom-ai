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

export async function makeMovieFromClips(
  clips: File[] | Blob[],
  music?: File | Blob,
  onProgress?: (ratio: number) => void
): Promise<Blob> {
  const ff = await getFFmpeg(onProgress);

  const clipNames: string[] = [];
  for (let i = 0; i < clips.length; i++) {
    const ext = clips[i].type.split("/")[1] || "mp4";
    const filename = `clip${String(i).padStart(4, "0")}.${ext}`;
    await ff.writeFile(filename, await fetchFile(clips[i]));
    clipNames.push(filename);
  }

  const concatList = clipNames.map((name) => `file '${name}'`).join("\n");
  await ff.writeFile("concat_list.txt", concatList);

  await ff.exec([
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    "concat_list.txt",
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "-pix_fmt",
    "yuv420p",
    "concatenated.mp4",
  ]);

  if (!music) {
    const data = await ff.readFile("concatenated.mp4");
    return new Blob([data], { type: "video/mp4" });
  }

  const musicExt = music.type.split("/")[1] || "mp3";
  await ff.writeFile(`music.${musicExt}`, await fetchFile(music));

  await ff.exec([
    "-i",
    "concatenated.mp4",
    "-i",
    `music.${musicExt}`,
    "-filter_complex",
    "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=2[aout]",
    "-map",
    "0:v",
    "-map",
    "[aout]",
    "-c:v",
    "copy",
    "output.mp4",
  ]);

  const data = await ff.readFile("output.mp4");
  return new Blob([data], { type: "video/mp4" });
                             }
