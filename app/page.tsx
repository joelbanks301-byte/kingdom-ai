import Link from "next/link";
import Seal from "@/components/Seal";

const TOOLS = [
  {
    href: "/create-video",
    glyph: "spark" as const,
    title: "Create Video",
    body: "Type a script. Kingdom AI Studio writes the voiceover, finds the footage, and cuts a full video.",
  },
  {
    href: "/make-movie",
    glyph: "reel" as const,
    title: "Make Movie",
    body: "Upload your own clips and images. Kingdom AI Studio joins them, scores them with music, and adds subtitles.",
  },
  {
    href: "/edit-video",
    glyph: "blade" as const,
    title: "Edit Video",
    body: "Trim, add text and a logo, or swap the background track — all in the browser, nothing to install.",
  },
];

export default function DashboardPage() {
  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "56px 24px 80px",
      }}
    >
      <header style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Seal size={44} glyph="crown" />
          <h1 style={{ fontSize: 34 }}>Kingdom AI Studio</h1>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 10, maxWidth: 520, lineHeight: 1.6 }}>
          One studio for turning a script, a folder of clips, or a rough cut into
          something worth publishing.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            style={{
              textDecoration: "none",
              display: "block",
              background: "var(--surface)",
              border: "1px solid var(--hairline)",
              borderRadius: 16,
              padding: 26,
              transition: "border-color 150ms ease, transform 150ms ease",
            }}
            className="tool-card"
          >
            <Seal size={40} glyph={tool.glyph} />
            <h2 style={{ fontSize: 22, marginTop: 16, color: "var(--parchment)" }}>
              {tool.title}
            </h2>
            <p style={{ color: "var(--muted)", marginTop: 8, lineHeight: 1.55, fontSize: 15 }}>
              {tool.body}
            </p>
          </Link>
        ))}
      </section>

      <style>{`
        .tool-card:hover, .tool-card:focus-visible {
          border-color: var(--gold);
          transform: translateY(-2px);
        }
      `}</style>
    </main>
  );
        }
