import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

const AGENT_COLORS: Record<string, string> = {
  "IR Agent": "#06b6d4",
  "Company Agent": "#f59e0b",
  "News Agent": "#22c55e",
  "Satellite Agent": "#ec4899",
};

type Props = {
  agents: string[];
};

export const AgentsScene: React.FC<Props> = ({ agents }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Orchestrator node
  const orchScale = spring({ frame, fps, config: { damping: 12 }, delay: 10 });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050510",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          opacity: titleOpacity,
          fontSize: 16,
          color: "#71717a",
          letterSpacing: 8,
          textTransform: "uppercase",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Agent Dispatch
      </div>

      {/* Orchestrator */}
      <div
        style={{
          transform: `scale(${orchScale})`,
          padding: "16px 48px",
          borderRadius: 16,
          border: "2px solid #f59e0b",
          backgroundColor: "#1a150820",
          marginBottom: 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#f59e0b",
            boxShadow: "0 0 12px #f59e0b80",
          }}
        />
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#f59e0b",
            fontFamily: "monospace",
          }}
        >
          Orchestrator
        </span>
      </div>

      {/* Agent nodes */}
      <div style={{ display: "flex", gap: 40 }}>
        {agents.map((agent, i) => {
          const delay = 30 + i * 15;
          const agentScale = spring({
            frame,
            fps,
            config: { damping: 12 },
            delay,
          });
          const color = AGENT_COLORS[agent] || "#3b82f6";

          // Connection line animation
          const lineOpacity = interpolate(
            frame,
            [delay - 10, delay],
            [0, 0.4],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Pulse effect when active
          const pulseOpacity = interpolate(
            frame,
            [delay + 20, delay + 40, delay + 60, delay + 80],
            [0, 0.3, 0, 0.3],
            { extrapolateRight: "clamp" }
          );

          return (
            <div
              key={agent}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              {/* Connection line */}
              <div
                style={{
                  width: 2,
                  height: 40,
                  background: `linear-gradient(to bottom, #f59e0b40, ${color}60)`,
                  opacity: lineOpacity,
                  marginBottom: -8,
                }}
              />

              {/* Agent card */}
              <div
                style={{
                  transform: `scale(${agentScale})`,
                  position: "relative",
                }}
              >
                {/* Pulse ring */}
                <div
                  style={{
                    position: "absolute",
                    inset: -6,
                    borderRadius: 18,
                    border: `2px solid ${color}`,
                    opacity: pulseOpacity,
                  }}
                />
                <div
                  style={{
                    padding: "14px 32px",
                    borderRadius: 14,
                    border: `1.5px solid ${color}`,
                    backgroundColor: `${color}10`,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: color,
                      boxShadow: `0 0 10px ${color}80`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color,
                      fontFamily: "monospace",
                    }}
                  >
                    {agent}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status text */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          fontSize: 14,
          color: "#52525b",
          fontFamily: "monospace",
          opacity: interpolate(frame, [60, 80], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        Collecting data from multiple sources...
      </div>
    </AbsoluteFill>
  );
};
