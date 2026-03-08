import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

type Props = {
  signal: string;
  confidence: number;
  summary: string;
};

export const VerdictScene: React.FC<Props> = ({
  signal,
  confidence,
  summary,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isBuy = signal === "BUY";
  const color = isBuy ? "#10b981" : "#ef4444";

  // Flash effect at start
  const flashOpacity = interpolate(frame, [0, 5, 15], [0.6, 0.6, 0], {
    extrapolateRight: "clamp",
  });

  const signalScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 80 },
    delay: 5,
  });

  const barWidth = interpolate(frame, [20, 50], [0, confidence], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const summaryOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glow pulse
  const glowOpacity = interpolate(
    frame,
    [30, 45, 60, 75],
    [0.1, 0.3, 0.1, 0.3],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050510",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: color,
          opacity: flashOpacity,
        }}
      />

      {/* Label */}
      <div
        style={{
          fontSize: 14,
          letterSpacing: 10,
          color: "#71717a",
          textTransform: "uppercase",
          marginBottom: 24,
          fontFamily: "system-ui, sans-serif",
          opacity: interpolate(frame, [10, 25], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        VERDICT
      </div>

      {/* Signal */}
      <div
        style={{
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            inset: -40,
            borderRadius: 40,
            backgroundColor: color,
            opacity: glowOpacity,
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            transform: `scale(${signalScale})`,
            fontSize: 120,
            fontWeight: 900,
            color,
            letterSpacing: 12,
            fontFamily: "system-ui, sans-serif",
            textShadow: `0 0 40px ${color}60`,
            position: "relative",
          }}
        >
          {signal}
        </div>
      </div>

      {/* Confidence bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 40,
        }}
      >
        <div
          style={{
            width: 300,
            height: 12,
            borderRadius: 6,
            backgroundColor: "#27272a",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${barWidth}%`,
              height: "100%",
              borderRadius: 6,
              background: `linear-gradient(90deg, ${color}80, ${color})`,
            }}
          />
        </div>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#d4d4d8",
            fontFamily: "monospace",
          }}
        >
          {Math.round(barWidth)}%
        </span>
      </div>

      {/* Summary */}
      <div
        style={{
          opacity: summaryOpacity,
          maxWidth: 700,
          textAlign: "center",
          fontSize: 18,
          color: "#a1a1aa",
          lineHeight: 1.6,
          marginTop: 40,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {summary}
      </div>
    </AbsoluteFill>
  );
};
