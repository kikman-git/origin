import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

type Props = {
  company: string;
  ticker: string;
};

export const IntroScene: React.FC<Props> = ({ company, ticker }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [15, 35], [30, 0], {
    extrapolateRight: "clamp",
  });
  const tickerOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [40, 70], [0, 400], {
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#050510",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          width: 100,
          height: 100,
          borderRadius: 24,
          background: "linear-gradient(135deg, #10b981, #06b6d4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          fontWeight: 900,
          color: "#000",
          marginBottom: 40,
          boxShadow: "0 0 60px rgba(16,185,129,0.3)",
        }}
      >
        JA
      </div>

      {/* Company name */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 64,
          fontWeight: 800,
          color: "#e4e4e7",
          letterSpacing: -2,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {company}
      </div>

      {/* Ticker */}
      <div
        style={{
          opacity: tickerOpacity,
          fontSize: 24,
          color: "#10b981",
          fontWeight: 600,
          fontFamily: "monospace",
          marginTop: 8,
        }}
      >
        {ticker}
      </div>

      {/* Divider line */}
      <div
        style={{
          width: lineWidth,
          height: 2,
          background: "linear-gradient(90deg, transparent, #10b981, transparent)",
          marginTop: 30,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          fontSize: 18,
          color: "#71717a",
          marginTop: 20,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: 6,
          textTransform: "uppercase",
        }}
      >
        AI Hedge Fund Analysis
      </div>
    </AbsoluteFill>
  );
};
