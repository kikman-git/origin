import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import type { DebateArgument } from "../data";

type Props = {
  debate: DebateArgument[];
};

const Avatar: React.FC<{ role: "bull" | "bear"; size?: number }> = ({
  role,
  size = 64,
}) => {
  const config = {
    bull: {
      emoji: "\u{1F4AA}",
      label: "BULL",
      gradient: "linear-gradient(to bottom, #16a34a, #14532d)",
      border: "#22c55e",
    },
    bear: {
      emoji: "\u{1F6E1}\uFE0F",
      label: "BEAR",
      gradient: "linear-gradient(to bottom, #dc2626, #7f1d1d)",
      border: "#ef4444",
    },
  };
  const c = config[role];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: c.gradient,
          border: `3px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.45,
        }}
      >
        {c.emoji}
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 2,
          color: c.border,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {c.label}
      </span>
    </div>
  );
};

export const DebateScene: React.FC<Props> = ({ debate }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050510",
        padding: 80,
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          marginBottom: 50,
        }}
      >
        <Avatar role="bull" />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#fb923c",
              fontStyle: "italic",
              letterSpacing: 8,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            VS
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#71717a",
              letterSpacing: 6,
              textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Adversarial Debate
          </div>
        </div>
        <Avatar role="bear" />
      </div>

      {/* Debate bubbles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {debate.map((arg, i) => {
          const delay = 20 + i * 30;
          const bubbleScale = spring({
            frame,
            fps,
            config: { damping: 14 },
            delay,
          });
          const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isBull = arg.position === "bull";

          // Strength bar animation
          const barWidth = interpolate(
            frame,
            [delay + 10, delay + 25],
            [0, arg.strength * 100],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `scale(${bubbleScale})`,
                display: "flex",
                justifyContent: isBull ? "flex-start" : "flex-end",
              }}
            >
              <div
                style={{
                  maxWidth: "65%",
                  padding: "20px 28px",
                  borderRadius: 20,
                  border: `2px solid ${isBull ? "#22c55e50" : "#ef444450"}`,
                  backgroundColor: isBull ? "#052e1620" : "#2a0a0a20",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: isBull ? "#22c55e" : "#ef4444",
                      letterSpacing: 2,
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    ROUND {arg.round}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 18,
                    color: "#d4d4d8",
                    lineHeight: 1.5,
                    fontFamily: "system-ui, sans-serif",
                    margin: 0,
                  }}
                >
                  {arg.text}
                </p>
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 120,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#27272a",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: "100%",
                        borderRadius: 3,
                        backgroundColor: isBull ? "#22c55e" : "#ef4444",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#71717a",
                      fontFamily: "monospace",
                    }}
                  >
                    {Math.round(arg.strength * 100)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
