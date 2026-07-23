type SealProps = {
  size?: number;
  spinning?: boolean;
  glyph?: "crown" | "reel" | "spark" | "blade";
};

const GLYPHS: Record<NonNullable<SealProps["glyph"]>, string> = {
  crown: "M4 17h16l-1.5-8-3.5 3-3-5-3 5-3.5-3L4 17z",
  reel: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 4v2M12 18v2M4 12h2M18 12h2",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z",
  blade: "M6 18L18 6M9 6h9v9M6 12v6h6",
};

export default function Seal({ size = 40, spinning = false, glyph = "crown" }: SealProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 35% 30%, #d9b23f, #c9a227 55%, #8a6c14 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.25), 0 2px 10px rgba(0,0,0,0.4)",
        animation: spinning ? "seal-spin 2.4s linear infinite" : undefined,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#17142b"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={GLYPHS[glyph]} />
      </svg>
      <style>{`
        @keyframes seal-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
  }
