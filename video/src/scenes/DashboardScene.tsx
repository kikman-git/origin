import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import type { AlphaDriver, BetaFactor } from "../data";

type Props = {
  signal: string;
  confidence: number;
  alpha: {
    expected_return: number;
    probability: number;
    drivers: AlphaDriver[];
  };
  beta: {
    risk_score: number;
    probability: number;
    factors: BetaFactor[];
  };
  priceHistory: { label: string; price: number }[];
  prediction: { label: string; price: number; upper: number; lower: number }[];
};

function PriceChart({
  priceHistory,
  prediction,
  frame,
}: {
  priceHistory: Props["priceHistory"];
  prediction: Props["prediction"];
  frame: number;
}) {
  const W = 800;
  const H = 280;
  const padL = 60;
  const padR = 40;
  const padT = 30;
  const padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const allMin =
    Math.min(
      ...priceHistory.map((p) => p.price),
      ...prediction.map((p) => p.lower)
    ) - 200;
  const allMax =
    Math.max(
      ...priceHistory.map((p) => p.price),
      ...prediction.map((p) => p.upper)
    ) + 300;

  const totalPts = priceHistory.length + prediction.length - 1;
  const xStep = innerW / (totalPts - 1);
  const toX = (i: number) => padL + i * xStep;
  const toY = (p: number) =>
    padT + innerH - ((p - allMin) / (allMax - allMin)) * innerH;

  // Animate line drawing
  const drawProgress = interpolate(frame, [10, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const histPath = priceHistory
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(p.price).toFixed(1)}`
    )
    .join(" ");

  const predOff = priceHistory.length - 1;
  const predPath = prediction
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${toX(predOff + i).toFixed(1)},${toY(p.price).toFixed(1)}`
    )
    .join(" ");

  const target = prediction[prediction.length - 1];
  const current = priceHistory[priceHistory.length - 1];
  const upside = Math.round(
    ((target.price - current.price) / current.price) * 100
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = padT + innerH * (1 - t);
        const price = Math.round(allMin + (allMax - allMin) * t);
        return (
          <g key={t}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="#27272a"
              strokeWidth={0.5}
            />
            <text
              x={padL - 10}
              y={y + 4}
              fontSize={10}
              fill="#52525b"
              textAnchor="end"
              fontFamily="monospace"
            >
              {price >= 1000 ? `${(price / 1000).toFixed(1)}K` : price}
            </text>
          </g>
        );
      })}
      {/* Historical line */}
      <path
        d={histPath}
        fill="none"
        stroke="#a1a1aa"
        strokeWidth={2.5}
        strokeDasharray={1200}
        strokeDashoffset={1200 * (1 - drawProgress)}
      />
      {/* Prediction line */}
      <path
        d={predPath}
        fill="none"
        stroke="#10b981"
        strokeWidth={2.5}
        strokeDasharray="8 4"
        opacity={interpolate(frame, [40, 60], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      />
      {/* Current point */}
      <circle
        cx={toX(predOff)}
        cy={toY(current.price)}
        r={5}
        fill="#a1a1aa"
        stroke="#050510"
        strokeWidth={3}
        opacity={drawProgress}
      />
      {/* Target point */}
      <circle
        cx={toX(totalPts - 1)}
        cy={toY(target.price)}
        r={6}
        fill="#10b981"
        stroke="#050510"
        strokeWidth={3}
        opacity={interpolate(frame, [50, 65], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      />
      {/* Target label */}
      <text
        x={toX(totalPts - 1)}
        y={toY(target.price) - 16}
        fontSize={14}
        fill="#10b981"
        textAnchor="middle"
        fontWeight="bold"
        fontFamily="monospace"
        opacity={interpolate(frame, [55, 70], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      >
        JPY {target.price.toLocaleString()} (+{upside}%)
      </text>
    </svg>
  );
}

export const DashboardScene: React.FC<Props> = ({
  signal,
  confidence,
  alpha,
  beta,
  priceHistory,
  prediction,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const maxImpact = Math.max(...alpha.drivers.map((d) => d.impact));
  const maxSeverity = Math.max(...beta.factors.map((f) => f.severity));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050510",
        padding: "60px 80px",
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#e4e4e7",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Investment Analysis Dashboard
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: signal === "BUY" ? "#10b981" : "#ef4444",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {signal}
          </span>
          <span
            style={{
              fontSize: 14,
              color: "#71717a",
              fontFamily: "monospace",
            }}
          >
            {confidence}% confidence
          </span>
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          borderRadius: 16,
          border: "1px solid #27272a50",
          backgroundColor: "#0a0a1280",
          padding: 20,
          marginBottom: 24,
        }}
      >
        <PriceChart
          priceHistory={priceHistory}
          prediction={prediction}
          frame={frame}
        />
      </div>

      {/* Alpha / Beta panels */}
      <div style={{ display: "flex", gap: 20 }}>
        {/* Alpha */}
        <div
          style={{
            flex: 1,
            borderRadius: 16,
            border: "1px solid #10b98130",
            backgroundColor: "#052e1610",
            padding: 24,
            opacity: interpolate(frame, [60, 80], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#10b981",
                fontFamily: "serif",
              }}
            >
              {"\u03B1"}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#10b981",
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Alpha (Return)
            </span>
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#10b981",
              fontFamily: "monospace",
              marginBottom: 16,
            }}
          >
            +{alpha.expected_return}%
          </div>
          {alpha.drivers.map((d, i) => {
            const barW = interpolate(
              frame,
              [80 + i * 8, 95 + i * 8],
              [0, (d.impact / maxImpact) * 100],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "#d4d4d8",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {d.factor}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#10b981",
                      fontFamily: "monospace",
                    }}
                  >
                    +{d.impact}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#27272a",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barW}%`,
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor: "#10b981",
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Beta */}
        <div
          style={{
            flex: 1,
            borderRadius: 16,
            border: "1px solid #ef444430",
            backgroundColor: "#2a0a0a10",
            padding: 24,
            opacity: interpolate(frame, [70, 90], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#ef4444",
                fontFamily: "serif",
              }}
            >
              {"\u03B2"}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#ef4444",
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Beta (Risk)
            </span>
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#ef4444",
              fontFamily: "monospace",
              marginBottom: 16,
            }}
          >
            {beta.risk_score.toFixed(2)}
          </div>
          {beta.factors.map((f, i) => {
            const barW = interpolate(
              frame,
              [90 + i * 8, 105 + i * 8],
              [0, (f.severity / maxSeverity) * 100],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "#d4d4d8",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {f.factor}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#ef4444",
                      fontFamily: "monospace",
                    }}
                  >
                    {Math.round(f.severity * 100)}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#27272a",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barW}%`,
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor: "#ef4444",
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
