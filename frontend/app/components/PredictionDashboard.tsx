"use client";

type Props = {
  signal: string;
  confidence: number;
};

// Mock price data for Akatsuki 3932.T
const HISTORICAL_PRICES = [
  { month: "Oct", price: 1850 },
  { month: "Nov", price: 1920 },
  { month: "Dec", price: 2050 },
  { month: "Jan", price: 2180 },
  { month: "Feb", price: 2350 },
  { month: "Mar", price: 2420 },
];

const PREDICTION = [
  { month: "Mar", price: 2420, upper: 2420, lower: 2420 },
  { month: "Jun", price: 2680, upper: 2900, lower: 2450 },
  { month: "Sep", price: 2950, upper: 3300, lower: 2550 },
  { month: "Dec", price: 3200, upper: 3700, lower: 2600 },
  { month: "Mar'28", price: 3500, upper: 4200, lower: 2700 },
  { month: "Jun'28", price: 3750, upper: 4600, lower: 2800 },
  { month: "Sep'28", price: 4000, upper: 5100, lower: 2850 },
  { month: "Mar'29", price: 4400, upper: 5800, lower: 2900 },
];

const METRICS = [
  { label: "Revenue", value: "JPY 7.6B", change: "+18.4%", positive: true },
  { label: "Op. Profit", value: "JPY 3.4B", change: "+32.1%", positive: true },
  { label: "Net Income", value: "JPY 3.0B", change: "+28.7%", positive: true },
  { label: "DOE", value: "4.0%", change: "+0.5%", positive: true },
];

const SEGMENT_DATA = [
  { label: "Game/Comic", value: 5.2, color: "#22c55e" },
  { label: "Ent/Lifestyle", value: 1.8, color: "#06b6d4" },
  { label: "AI-DX", value: 0.6, color: "#a855f7" },
];

const EVIDENCE_SCORES = [
  { label: "IR Filings", score: 0.88, color: "#06b6d4" },
  { label: "Earnings Call", score: 0.81, color: "#f59e0b" },
  { label: "News/Policy", score: 0.75, color: "#22c55e" },
  { label: "Satellite", score: 0.92, color: "#ec4899" },
];

export default function PredictionDashboard({ signal, confidence }: Props) {
  const chartW = 600;
  const chartH = 200;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const allPrices = [...HISTORICAL_PRICES.map((p) => p.price), ...PREDICTION.map((p) => p.upper)];
  const minP = Math.min(...PREDICTION.map((p) => p.lower), ...HISTORICAL_PRICES.map((p) => p.price)) - 200;
  const maxP = Math.max(...allPrices) + 200;

  const totalPoints = HISTORICAL_PRICES.length + PREDICTION.length - 1; // -1 because Mar overlaps
  const xStep = innerW / (totalPoints - 1);

  const toX = (i: number) => padL + i * xStep;
  const toY = (price: number) => padT + innerH - ((price - minP) / (maxP - minP)) * innerH;

  // Historical line
  const histPath = HISTORICAL_PRICES.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p.price)}`).join(" ");

  // Prediction line (starts from last historical point)
  const predOffset = HISTORICAL_PRICES.length - 1;
  const predPath = PREDICTION.map((p, i) => `${i === 0 ? "M" : "L"}${toX(predOffset + i)},${toY(p.price)}`).join(" ");

  // Bollinger band area
  const upperPath = PREDICTION.map((p, i) => `${i === 0 ? "M" : "L"}${toX(predOffset + i)},${toY(p.upper)}`).join(" ");
  const lowerPath = PREDICTION.slice().reverse().map((p, i) => `L${toX(predOffset + PREDICTION.length - 1 - i)},${toY(p.lower)}`).join(" ");
  const bandPath = `${upperPath} ${lowerPath} Z`;

  // Target price
  const targetPrice = PREDICTION[PREDICTION.length - 1].price;
  const currentPrice = HISTORICAL_PRICES[HISTORICAL_PRICES.length - 1].price;
  const upside = Math.round(((targetPrice - currentPrice) / currentPrice) * 100);

  // All x-axis labels
  const allLabels = [
    ...HISTORICAL_PRICES.map((p) => p.month),
    ...PREDICTION.slice(1).map((p) => p.month),
  ];

  const maxSegment = Math.max(...SEGMENT_DATA.map((s) => s.value));

  return (
    <div className="mt-4 rounded-xl border border-zinc-700/50 bg-zinc-950/80 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-zinc-200">Akatsuki Inc.</span>
          <span className="text-xs text-zinc-500">3932.T</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-black ${signal === "BUY" ? "text-emerald-400" : "text-red-400"}`}>
            {signal}
          </span>
          <span className="text-xs text-zinc-500">{confidence}% conf.</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Price Prediction Chart with Bollinger Bands */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Price Prediction (3Y)</span>
            <div className="flex items-center gap-3 text-[9px]">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-zinc-400" /> Historical
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-emerald-400" style={{ borderBottom: "1px dashed" }} /> Predicted
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm" /> Confidence Band
              </span>
            </div>
          </div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = padT + innerH * (1 - t);
              const price = Math.round(minP + (maxP - minP) * t);
              return (
                <g key={t}>
                  <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#27272a" strokeWidth={0.5} />
                  <text x={padL - 5} y={y + 3} fontSize={8} fill="#52525b" textAnchor="end" fontFamily="monospace">
                    {price.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {allLabels.map((label, i) => (
              i % 2 === 0 && (
                <text key={i} x={toX(i)} y={chartH - 5} fontSize={8} fill="#52525b" textAnchor="middle" fontFamily="monospace">
                  {label}
                </text>
              )
            ))}

            {/* Bollinger band */}
            <path d={bandPath} fill="#10b981" opacity={0.08} />
            <path d={upperPath} fill="none" stroke="#10b981" strokeWidth={0.5} opacity={0.3} strokeDasharray="3 3" />
            <path d={PREDICTION.slice().reverse().map((p, i) => `${i === 0 ? "M" : "L"}${toX(predOffset + PREDICTION.length - 1 - i)},${toY(p.lower)}`).join(" ")} fill="none" stroke="#10b981" strokeWidth={0.5} opacity={0.3} strokeDasharray="3 3" />

            {/* Historical line */}
            <path d={histPath} fill="none" stroke="#a1a1aa" strokeWidth={2} />

            {/* Prediction line */}
            <path d={predPath} fill="none" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3" />

            {/* Current price dot */}
            <circle cx={toX(predOffset)} cy={toY(currentPrice)} r={4} fill="#a1a1aa" />

            {/* Target price dot + label */}
            <circle cx={toX(totalPoints - 1)} cy={toY(targetPrice)} r={5} fill="#10b981" />
            <text x={toX(totalPoints - 1)} y={toY(targetPrice) - 10} fontSize={10} fill="#10b981" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
              {targetPrice.toLocaleString()}
            </text>
            <text x={toX(totalPoints - 1)} y={toY(targetPrice) - 22} fontSize={8} fill="#4ade80" textAnchor="middle" fontFamily="monospace">
              +{upside}%
            </text>

            {/* Current price label */}
            <text x={toX(predOffset)} y={toY(currentPrice) - 10} fontSize={9} fill="#a1a1aa" textAnchor="middle" fontFamily="monospace">
              {currentPrice.toLocaleString()}
            </text>
          </svg>
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-4 gap-3">
          {METRICS.map((m) => (
            <div key={m.label} className="rounded-lg bg-zinc-900/50 border border-zinc-800/50 px-3 py-2.5">
              <div className="text-[9px] text-zinc-500 uppercase">{m.label}</div>
              <div className="text-sm font-bold text-zinc-200 mt-0.5">{m.value}</div>
              <div className={`text-[10px] mt-0.5 ${m.positive ? "text-emerald-400" : "text-red-400"}`}>
                {m.change}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Segment Revenue Bar Chart */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Segment Revenue (JPY B)</span>
            <div className="mt-2 space-y-2">
              {SEGMENT_DATA.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 w-24 shrink-0">{seg.label}</span>
                  <div className="flex-1 h-5 bg-zinc-900 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-1000"
                      style={{
                        width: `${(seg.value / maxSegment) * 100}%`,
                        backgroundColor: seg.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 w-8 text-right">{seg.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Confidence Scores */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Evidence Scores</span>
            <div className="mt-2 space-y-2">
              {EVIDENCE_SCORES.map((ev) => (
                <div key={ev.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 w-24 shrink-0">{ev.label}</span>
                  <div className="flex-1 h-5 bg-zinc-900 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-1000"
                      style={{
                        width: `${ev.score * 100}%`,
                        backgroundColor: ev.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 w-8 text-right">{Math.round(ev.score * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
