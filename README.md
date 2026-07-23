# Kingdom AI

A Next.js dashboard with three tools — Create Video, Make Movie, Edit Video —
matching the plan from your Meta AI chat.

## Stack

| Piece | Tool | Where |
|---|---|---|
| Website | Next.js 14 (App Router) + Vercel | `app/` |
| Video processing | FFmpeg.wasm (in-browser) | `lib/ffmpeg.ts` |
| Templated video assembly | Remotion | `remotion/` |
| AI voice | ElevenLabs | `app/api/voice/route.ts` |
| Free stock footage | Pexels | `app/api/stock-video/route.ts` |
| Storage | Supabase | `lib/supabaseClient.ts` |

## Setup

Copy `.env.example` to `.env.local` and fill in your real API keys, then
deploy to Vercel — see the setup guide in your chat with Claude for the
full step-by-step.

## Getting the API keys

- **ElevenLabs**: elevenlabs.io — Profile → API Keys
- **Pexels**: pexels.com/api
- **Supabase**: supabase.com — Project Settings → API, plus a public
  "videos" bucket under Storage

## Deploying

Push this repo to Vercel at vercel.com/new, and add the same environment
variables from `.env.example` in the Vercel project settings before your
first deploy.
