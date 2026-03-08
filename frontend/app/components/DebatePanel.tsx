"use client";

import { useMemo } from "react";
import { AgentEvent } from "../page";

type Props = {
  events: AgentEvent[];
  highlightedEvidence: string[];
  onEvidenceHover: (ids: string[]) => void;
};

type RoundData = {
  round: number;
  bullStrength: number;
  bearStrength: number;
};

function BattleChart({ rounds }: { rounds: RoundData[] }) {
  if (rounds.length === 0) return null;

  const W = 700;
  const H = 180;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const midY = padT + innerH / 2;

  const maxRound = Math.max(10, ...rounds.map((r) => r.round));
  const toX = (round: number) => padL + ((round - 1) / (maxRound - 1)) * innerW;

  // Momentum = bull - bear, clamped to [-1, 1]
  const momenta = rounds.map((r) => ({
    round: r.round,
    momentum: r.bullStrength - r.bearStrength,
    bull: r.bullStrength,
    bear: r.bearStrength,
  }));

  const maxMom = Math.max(0.4, ...momenta.map((m) => Math.abs(m.momentum)));
  const toY = (mom: number) => midY - (mom / maxMom) * (innerH / 2);

  // Build paths for area fills
  const bullAreaPts: string[] = [];
  const bearAreaPts: string[] = [];
  const linePts: string[] = [];

  for (const m of momenta) {
    const x = toX(m.round);
    const y = toY(m.momentum);
    linePts.push(`${x.toFixed(1)},${y.toFixed(1)}`);

    if (m.momentum >= 0) {
      bullAreaPts.push(`${x.toFixed(1)},${midY} ${x.toFixed(1)},${y.toFixed(1)}`);
      bearAreaPts.push(`${x.toFixed(1)},${midY} ${x.toFixed(1)},${midY}`);
    } else {
      bullAreaPts.push(`${x.toFixed(1)},${midY} ${x.toFixed(1)},${midY}`);
      bearAreaPts.push(`${x.toFixed(1)},${midY} ${x.toFixed(1)},${y.toFixed(1)}`);
    }
  }

  // Build area paths for each segment between consecutive rounds
  const areaSegments: { path: string; isBull: boolean }[] = [];
  for (let i = 0; i < momenta.length - 1; i++) {
    const x1 = toX(momenta[i].round);
    const y1 = toY(momenta[i].momentum);
    const x2 = toX(momenta[i + 1].round);
    const y2 = toY(momenta[i + 1].momentum);
    const isBull = (momenta[i].momentum + momenta[i + 1].momentum) / 2 >= 0;
    areaSegments.push({
      path: `M${x1.toFixed(1)},${midY} L${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} L${x2.toFixed(1)},${midY} Z`,
      isBull,
    });
  }

  const linePath = `M${linePts.join(" L")}`;

  // Find the round where bear wins (momentum < 0)
  const bearWins = momenta.filter((m) => m.momentum < 0);
  const bullBest = momenta.reduce((best, m) => (m.momentum > best.momentum ? m : best), momenta[0]);

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Battle Momentum</div>
        <div className="flex items-center gap-4 text-[9px]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-2 rounded-sm bg-green-500/40" /> Bull advantage
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-2 rounded-sm bg-red-500/40" /> Bear advantage
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Grid lines */}
        <line x1={padL} y1={midY} x2={W - padR} y2={midY} stroke="#3f3f46" strokeWidth={1} strokeDasharray="4 4" />
        <text x={padL - 6} y={padT + 8} fontSize={8} fill="#22c55e" textAnchor="end" fontFamily="monospace">BULL</text>
        <text x={padL - 6} y={H - padB - 2} fontSize={8} fill="#ef4444" textAnchor="end" fontFamily="monospace">BEAR</text>

        {/* Area segments */}
        {areaSegments.map((seg, i) => (
          <path key={i} d={seg.path} fill={seg.isBull ? "#22c55e" : "#ef4444"} opacity={0.15} />
        ))}

        {/* Momentum line */}
        <path d={linePath} fill="none" stroke="#a1a1aa" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {momenta.map((m) => {
          const x = toX(m.round);
          const y = toY(m.momentum);
          const isBull = m.momentum >= 0;
          return (
            <g key={m.round}>
              <circle cx={x} cy={y} r={5} fill={isBull ? "#22c55e" : "#ef4444"} stroke="#18181b" strokeWidth={2} />
              {/* Strength labels */}
              <text x={x} y={padT - 4} fontSize={8} fill="#22c55e" textAnchor="middle" fontFamily="monospace" opacity={0.7}>
                {Math.round(m.bull * 100)}
              </text>
              <text x={x} y={H - padB + 12} fontSize={8} fill="#ef4444" textAnchor="middle" fontFamily="monospace" opacity={0.7}>
                {Math.round(m.bear * 100)}
              </text>
            </g>
          );
        })}

        {/* Round labels */}
        {momenta.map((m) => (
          <text key={`label-${m.round}`} x={toX(m.round)} y={H - 4} fontSize={8} fill="#52525b" textAnchor="middle" fontFamily="monospace">
            R{m.round}
          </text>
        ))}

        {/* Annotations for dramatic moments */}
        {bearWins.length > 0 && bearWins[0] && (
          <text x={toX(bearWins[0].round)} y={toY(bearWins[0].momentum) + 16} fontSize={7} fill="#ef4444" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
            BEAR LEADS
          </text>
        )}
        {momenta.length > 2 && (
          <text x={toX(bullBest.round)} y={toY(bullBest.momentum) - 10} fontSize={7} fill="#22c55e" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
            BULL DOMINATES
          </text>
        )}
      </svg>
    </div>
  );
}

function SpeechBubble({
  position,
  text,
  strength,
  evidenceIds,
  highlightedEvidence,
  onEvidenceClick,
}: {
  position: "bull" | "bear";
  text: string;
  strength?: number;
  evidenceIds?: string[];
  highlightedEvidence: string[];
  onEvidenceClick: (ids: string[]) => void;
}) {
  const isBull = position === "bull";
  const borderColor = isBull ? "border-green-500/50" : "border-red-500/50";
  const bgColor = isBull ? "bg-green-950/30" : "bg-red-950/30";
  const tailSide = isBull ? "left-4" : "right-4";

  const shortText = text.length > 100 ? text.slice(0, 100).replace(/\.\s.*$/, ".") + "" : text;

  return (
    <div className={`relative ${isBull ? "mr-8" : "ml-8"}`}>
      <div className={`relative rounded-2xl border-2 ${borderColor} ${bgColor} px-4 py-3`}>
        <p className="text-xs text-zinc-200 leading-relaxed font-medium">{shortText}</p>
        {strength != null && (
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden max-w-[100px]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${strength * 100}%`,
                  backgroundColor: isBull ? "#22c55e" : "#ef4444",
                }}
              />
            </div>
            <span className="text-[10px] text-zinc-500">{Math.round(strength * 100)}%</span>
          </div>
        )}
        {evidenceIds && evidenceIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {evidenceIds.map((eid) => (
              <span
                key={eid}
                onClick={(e) => { e.stopPropagation(); onEvidenceClick(evidenceIds); }}
                className={`text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                  highlightedEvidence.includes(eid)
                    ? isBull ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/40" : "bg-red-500/20 text-red-400 ring-1 ring-red-500/40"
                    : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                }`}
              >
                {eid}
              </span>
            ))}
          </div>
        )}
        <div
          className={`absolute -bottom-2 ${tailSide} w-4 h-4 ${bgColor} border-b-2 border-r-2 ${borderColor} transform rotate-45`}
        />
      </div>
    </div>
  );
}

function CharacterAvatar({ role, isActive }: { role: "bull" | "bear"; isActive?: boolean }) {
  const config = {
    bull: { emoji: "\u{1F4AA}", label: "BULL", color: "from-green-600 to-green-800", border: "border-green-500", ring: "ring-green-500/50" },
    bear: { emoji: "\u{1F6E1}\uFE0F", label: "BEAR", color: "from-red-600 to-red-800", border: "border-red-500", ring: "ring-red-500/50" },
  };
  const c = config[role];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-12 h-12 rounded-full bg-gradient-to-b ${c.color} border-2 ${c.border} flex items-center justify-center text-xl ${isActive ? `ring-2 ${c.ring}` : ""}`}>
        {c.emoji}
      </div>
      <span className={`text-[10px] font-black tracking-wider ${role === "bull" ? "text-green-400" : "text-red-400"}`}>
        {c.label}
      </span>
    </div>
  );
}

export default function DebatePanel({ events, highlightedEvidence, onEvidenceHover }: Props) {
  const toggleEvidence = (ids: string[]) => {
    const isSame = JSON.stringify(highlightedEvidence) === JSON.stringify(ids);
    onEvidenceHover(isSame ? [] : ids);
  };

  // Group events by round — filter out judge events
  const rounds: Record<number, AgentEvent[]> = {};

  for (const ev of events) {
    if (ev.argument?.position === "judge") continue;
    if (ev.argument?.ruling === "verdict") continue;
    const round = ev.debate_round ?? ev.argument?.round ?? 0;
    if (round === 0) continue;
    if (!rounds[round]) rounds[round] = [];
    rounds[round].push(ev);
  }

  // Compute battle chart data
  const battleData = useMemo(() => {
    const data: RoundData[] = [];
    for (const [roundNum, roundEvents] of Object.entries(rounds)) {
      const bull = roundEvents.find((e) => e.argument?.position === "bull");
      const bear = roundEvents.find((e) => e.argument?.position === "bear");
      if (bull?.argument?.strength != null && bear?.argument?.strength != null) {
        data.push({
          round: Number(roundNum),
          bullStrength: bull.argument.strength,
          bearStrength: bear.argument.strength,
        });
      }
    }
    return data.sort((a, b) => a.round - b.round);
  }, [Object.keys(rounds).join(","), events.length]);

  if (Object.keys(rounds).length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-950/80 overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-green-950/60 via-zinc-900 to-red-950/60 px-5 py-3 border-b border-zinc-700/30 overflow-hidden">
        {/* Speed lines background effect */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-white"
              style={{
                top: `${10 + i * 8}%`,
                left: 0,
                right: 0,
                transform: `rotate(${-2 + (i % 5) * 0.8}deg)`,
              }}
            />
          ))}
        </div>
        <div className="relative flex items-center justify-center gap-8">
          <CharacterAvatar role="bull" />
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-zinc-400 tracking-widest" style={{ fontStyle: "italic" }}>
              VS
            </span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Adversarial Debate</span>
          </div>
          <CharacterAvatar role="bear" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Battle Chart */}
        {battleData.length >= 2 && <BattleChart rounds={battleData} />}

        {/* Debate Rounds */}
        {Object.entries(rounds)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([roundNum, roundEvents]) => {
            const bull = roundEvents.find((e) => e.argument?.position === "bull");
            const bear = roundEvents.find((e) => e.argument?.position === "bear");

            return (
              <div key={roundNum}>
                {/* Round divider */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                  <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] bg-zinc-900 px-3 py-1 rounded border border-zinc-800">
                    Round {roundNum}
                  </span>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                </div>

                {/* Bull vs Bear */}
                <div className="space-y-3">
                  {bull?.argument && (
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-1">
                        <CharacterAvatar role="bull" isActive />
                      </div>
                      <div className="flex-1">
                        <SpeechBubble
                          position="bull"
                          text={bull.argument.text}
                          strength={bull.argument.strength}
                          evidenceIds={bull.argument.evidence_ids}
                          highlightedEvidence={highlightedEvidence}
                          onEvidenceClick={toggleEvidence}
                        />
                      </div>
                    </div>
                  )}

                  {bear?.argument && (
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="shrink-0 mt-1">
                        <CharacterAvatar role="bear" isActive />
                      </div>
                      <div className="flex-1">
                        <SpeechBubble
                          position="bear"
                          text={bear.argument.text}
                          strength={bear.argument.strength}
                          evidenceIds={bear.argument.evidence_ids}
                          highlightedEvidence={highlightedEvidence}
                          onEvidenceClick={toggleEvidence}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
