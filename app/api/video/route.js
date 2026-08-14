// File path in your repo: app/api/video/route.js
//
// ONE combined backend file. Handles both:
//   POST -> start a new video job
//   GET  -> check status, and stream the finished video when ?download=1
//
// Your OPENAI_API_KEY stays here only. The browser never sees it.

export async function POST(request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server is missing OPENAI_API_KEY" }, { status: 500 });
  }

  try {
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Missing 'prompt' in request body" }, { status: 400 });
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

    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("id");
  const wantsDownload = searchParams.get("download") === "1";

  if (!apiKey) {
    return Response.json({ error: "Server is missing OPENAI_API_KEY" }, { status: 500 });
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
        headers: { "Content-Type": "video/mp4", "Cache-Control": "no-store" },
      });
    }

    const statusResp = await fetch(`https://api.openai.com/v1/videos/${videoId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await statusResp.json();
    if (!statusResp.ok) {
      return Response.json({ error: data }, { status: statusResp.status });
    }
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
      }
      
