"use client";

import { AgentEvent } from "../page";

type Props = {
  events: AgentEvent[];
  highlightedEvidence: string[];
  onEvidenceHover: (ids: string[]) => void;
};

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

  // Shorten text to first sentence or 80 chars for punchy manga feel
  const shortText = text.length > 100 ? text.slice(0, 100).replace(/\.\s.*$/, ".") + "" : text;

  return (
    <div className={`relative ${isBull ? "mr-8" : "ml-8"}`}>
      {/* Speech bubble */}
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
        {/* Tail */}
        <div
          className={`absolute -bottom-2 ${tailSide} w-4 h-4 ${bgColor} border-b-2 border-r-2 ${borderColor} transform rotate-45`}
        />
      </div>
    </div>
  );
}

function CharacterAvatar({ role, isActive }: { role: "bull" | "bear" | "judge"; isActive?: boolean }) {
  const config = {
    bull: { emoji: "\u{1F4AA}", label: "BULL", color: "from-green-600 to-green-800", border: "border-green-500", ring: "ring-green-500/50" },
    bear: { emoji: "\u{1F6E1}\uFE0F", label: "BEAR", color: "from-red-600 to-red-800", border: "border-red-500", ring: "ring-red-500/50" },
    judge: { emoji: "\u2696\uFE0F", label: "JUDGE", color: "from-orange-600 to-orange-800", border: "border-orange-500", ring: "ring-orange-500/50" },
  };
  const c = config[role];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-12 h-12 rounded-full bg-gradient-to-b ${c.color} border-2 ${c.border} flex items-center justify-center text-xl ${isActive ? `ring-2 ${c.ring} animate-pulse` : ""}`}>
        {c.emoji}
      </div>
      <span className={`text-[10px] font-black tracking-wider ${role === "bull" ? "text-green-400" : role === "bear" ? "text-red-400" : "text-orange-400"}`}>
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

  // Group events by round
  const rounds: Record<number, AgentEvent[]> = {};
  let judgeOpening: AgentEvent | null = null;
  let verdict: AgentEvent | null = null;

  for (const ev of events) {
    if (ev.argument?.ruling === "verdict") {
      verdict = ev;
      continue;
    }
    const round = ev.debate_round ?? ev.argument?.round ?? 0;
    if (round === 0) {
      judgeOpening = ev;
      continue;
    }
    if (!rounds[round]) rounds[round] = [];
    rounds[round].push(ev);
  }

  return (
    <div className="mt-4 rounded-xl border border-orange-500/30 bg-zinc-950/80 overflow-hidden animate-fade-in-up">
      {/* Manga-style header with dramatic styling */}
      <div className="relative bg-gradient-to-r from-green-950/60 via-zinc-900 to-red-950/60 px-5 py-3 border-b border-orange-500/20 overflow-hidden">
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
                transform: `rotate(${-2 + Math.random() * 4}deg)`,
              }}
            />
          ))}
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CharacterAvatar role="bull" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-orange-400 tracking-widest" style={{ fontStyle: "italic" }}>
                VS
              </span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Adversarial Debate</span>
            </div>
            <CharacterAvatar role="bear" />
          </div>
          <CharacterAvatar role="judge" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Judge opening */}
        {judgeOpening?.argument && (
          <div className="flex justify-center">
            <div className="bg-orange-950/20 border border-orange-500/20 rounded-xl px-4 py-2 max-w-md text-center relative">
              <p className="text-[11px] text-orange-300 font-medium">{judgeOpening.argument.text}</p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-950/20 border-b border-r border-orange-500/20 rotate-45" />
            </div>
          </div>
        )}

        {/* Debate Rounds — manga panel layout */}
        {Object.entries(rounds)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([roundNum, roundEvents]) => {
            const bull = roundEvents.find((e) => e.argument?.position === "bull");
            const bear = roundEvents.find((e) => e.argument?.position === "bear");
            const judge = roundEvents.find((e) => e.argument?.position === "judge");

            return (
              <div key={roundNum} className="animate-fade-in-up">
                {/* Round divider — manga style panel border */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                  <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] bg-zinc-900 px-3 py-1 rounded border border-zinc-800">
                    Round {roundNum}
                  </span>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                </div>

                {/* Bull vs Bear — alternating sides like manga dialogue */}
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

                  {/* Judge comment — centered, smaller */}
                  {judge?.argument && (
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 bg-orange-950/15 border border-orange-500/15 rounded-lg px-3 py-1.5 max-w-sm">
                        <span className="text-orange-400 text-sm">&#x2696;&#xFE0F;</span>
                        <p className="text-[10px] text-zinc-400">{judge.argument.text}</p>
                        {judge.argument.ruling === "continue" && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-300 shrink-0">CONTINUE</span>
                        )}
                        {judge.argument.ruling === "deliberating" && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-200 animate-pulse shrink-0">DELIBERATING</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* Verdict — dramatic manga-style reveal */}
        {verdict?.argument && (
          <div className="mt-4 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-orange-500/40" />
              <span className="text-xs font-black text-orange-400 uppercase tracking-[0.3em]">
                VERDICT
              </span>
              <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-orange-500/40" />
            </div>
            <div className="flex justify-center">
              <div className="relative bg-gradient-to-b from-orange-950/40 via-zinc-900 to-emerald-950/30 border-2 border-emerald-500/40 rounded-2xl px-6 py-5 max-w-md text-center">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 animate-pulse" />
                <div className="relative">
                  <div className="text-3xl font-black text-emerald-400 tracking-wider mb-2">
                    {verdict.judgment?.signal}
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-2.5 w-28 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000"
                        style={{ width: `${verdict.judgment?.confidence ?? 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-zinc-300">{verdict.judgment?.confidence}%</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Bull prevails with convergent multi-source evidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
