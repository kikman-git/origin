"use client";

import { AgentState, AgentEvent, ToolTrace } from "../page";

type Props = {
  agents: Record<string, AgentState>;
  highlightedEvidence: string[];
  debateEvents: AgentEvent[];
};

const CENTER_X = 500;
const CHILD_POSITIONS = [
  { id: "ir", x: 125, color: "#06b6d4", label: "IR Agent" },
  { id: "company", x: 375, color: "#f59e0b", label: "Company Agent" },
  { id: "news", x: 625, color: "#22c55e", label: "News Agent" },
  { id: "satellite", x: 875, color: "#ec4899", label: "Satellite Agent" },
];

function flattenObj(obj: Record<string, unknown>): string[] {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const val = Array.isArray(v) ? v.join(", ") : typeof v === "object" && v !== null ? JSON.stringify(v) : String(v);
    lines.push(`${k}: ${val}`);
  }
  return lines;
}

function OrchestratorNode({ y, message, status }: { y: number; message: string; status: string }) {
  const w = 340;
  const h = 52;
  const isActive = status === "running";
  const isDone = status === "completed";
  const color = isDone ? "#3b82f6" : isActive ? "#f59e0b" : "#3f3f46";

  return (
    <g>
      {isActive && (
        <rect x={CENTER_X - w / 2 - 3} y={y - 3} width={w + 6} height={h + 6} rx={14}
          fill="none" stroke="#f59e0b" strokeWidth={1} opacity={0.3} className="animate-pulse-glow" />
      )}
      <rect x={CENTER_X - w / 2} y={y} width={w} height={h} rx={12}
        fill={isDone ? "#0c1425" : isActive ? "#1a1508" : "#18181b"}
        stroke={color} strokeWidth={1.5} />
      <circle cx={CENTER_X - w / 2 + 16} cy={y + h / 2} r={5}
        fill={color} className={isActive ? "animate-pulse-glow" : ""} />
      <text x={CENTER_X - w / 2 + 28} y={y + h / 2 - 5}
        fontSize={13} fontWeight={700} fill={color}
        fontFamily="var(--font-geist-mono), monospace">
        Orchestrator
      </text>
      <text x={CENTER_X - w / 2 + 28} y={y + h / 2 + 12}
        fontSize={10} fill="#71717a"
        fontFamily="var(--font-geist-mono), monospace">
        {message}
      </text>
    </g>
  );
}

function AgentNode({ x, y, label, color, status }: {
  x: number; y: number; label: string; color: string; status: string;
}) {
  const w = 180;
  const h = 40;
  const isActive = status === "running";
  const isDone = status === "completed";
  const nodeColor = isDone ? "#3b82f6" : isActive ? color : "#3f3f46";

  return (
    <g>
      {isActive && (
        <rect x={x - w / 2 - 2} y={y - 2} width={w + 4} height={h + 4} rx={12}
          fill="none" stroke={color} strokeWidth={1} opacity={0.3} className="animate-pulse-glow" />
      )}
      <rect x={x - w / 2} y={y} width={w} height={h} rx={10}
        fill={isDone ? "#0c1425" : isActive ? color + "10" : "#18181b"}
        stroke={nodeColor} strokeWidth={1.5} />
      <circle cx={x - w / 2 + 14} cy={y + h / 2} r={3.5}
        fill={nodeColor} className={isActive ? "animate-pulse-glow" : ""} />
      <text x={x - w / 2 + 24} y={y + h / 2 + 4}
        fontSize={12} fontWeight={600} fill={nodeColor}
        fontFamily="var(--font-geist-mono), monospace">
        {label}
      </text>
    </g>
  );
}

function ToolCard({ tool, x, y, color, highlighted, cardId }: {
  tool: ToolTrace; x: number; y: number; color: string; highlighted: boolean; cardId: string;
}) {
  const isDone = tool.status === "completed";
  const inputLines = tool.input ? flattenObj(tool.input) : [];
  const outputLines = tool.output ? flattenObj(tool.output) : [];
  const w = 210;
  const lineH = 14;
  const headerH = 22;
  const gap = outputLines.length > 0 && inputLines.length > 0 ? 6 : 0;
  const h = headerH + (inputLines.length + outputLines.length) * lineH + gap + 10;
  const clipId = `clip-${cardId}`;

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x={x - w / 2} y={y} width={w} height={h} rx={8} />
        </clipPath>
      </defs>
      {highlighted && (
        <rect x={x - w / 2 - 3} y={y - 3} width={w + 6} height={h + 6} rx={10}
          fill="none" stroke="#22c55e" strokeWidth={2} opacity={0.8} className="animate-pulse-glow" />
      )}
      <rect x={x - w / 2} y={y} width={w} height={h} rx={8}
        fill={highlighted ? "#052e1620" : "#0a0a12"}
        stroke={highlighted ? "#22c55e40" : color + "15"} strokeWidth={1} />
      <g clipPath={`url(#${clipId})`}>
        <rect x={x - w / 2} y={y + 4} width={2.5} height={h - 8} rx={1}
          fill={isDone ? color : "#eab308"} opacity={highlighted ? 1 : 0.4} />
        <text x={x - w / 2 + 10} y={y + 16} fontSize={11} fontWeight={700}
          fill={isDone ? color : "#eab308"}
          fontFamily="var(--font-geist-mono), monospace">
          {tool.name}
        </text>
        {tool.evidence_id && (
          <>
            <rect x={x + w / 2 - 60} y={y + 4} width={56} height={16} rx={4}
              fill={highlighted ? "#22c55e15" : "#ffffff05"} />
            <text x={x + w / 2 - 32} y={y + 15} fontSize={9}
              fill={highlighted ? "#4ade80" : "#3f3f46"} textAnchor="middle"
              fontFamily="var(--font-geist-mono), monospace">
              {tool.evidence_id}
            </text>
          </>
        )}
        {inputLines.map((line, i) => (
          <text key={`in-${i}`} x={x - w / 2 + 10} y={y + headerH + 8 + i * lineH}
            fontSize={10} fill="#a1a1aa"
            fontFamily="var(--font-geist-mono), monospace">
            {line}
          </text>
        ))}
        {gap > 0 && (
          <line x1={x - w / 2 + 10} y1={y + headerH + inputLines.length * lineH + 3}
            x2={x + w / 2 - 10} y2={y + headerH + inputLines.length * lineH + 3}
            stroke="#ffffff08" strokeWidth={0.5} />
        )}
        {outputLines.map((line, i) => (
          <text key={`out-${i}`} x={x - w / 2 + 10}
            y={y + headerH + inputLines.length * lineH + gap + 8 + i * lineH}
            fontSize={10} fill={highlighted ? "#86efac" : "#52525b"}
            fontFamily="var(--font-geist-mono), monospace">
            {line}
          </text>
        ))}
      </g>
    </g>
  );
}

function getToolCardHeight(tool: ToolTrace): number {
  const inLen = tool.input ? Object.keys(tool.input).length : 0;
  const outLen = tool.output ? Object.keys(tool.output).length : 0;
  const gap = outLen > 0 && inLen > 0 ? 6 : 0;
  return 22 + (inLen + outLen) * 14 + gap + 10;
}

// ── Battle Arena: Bull vs Bear ──
type RoundInfo = { round: number; bullStrength: number; bearStrength: number };

function BattleArena({ y, rounds, isActive }: { y: number; rounds: RoundInfo[]; isActive: boolean }) {
  const arenaW = 800;
  const arenaH = 220;
  const ax = CENTER_X - arenaW / 2;
  const bullX = CENTER_X - 280;
  const bearX = CENTER_X + 280;
  const midY = y + arenaH / 2;

  // Calculate current momentum
  const lastRound = rounds[rounds.length - 1];
  const bullTotal = rounds.reduce((s, r) => s + (r.bullStrength > r.bearStrength ? 1 : 0), 0);
  const bearTotal = rounds.length - bullTotal;
  const momentum = lastRound ? (lastRound.bullStrength - lastRound.bearStrength) : 0;

  // Tug-of-war bar position: 0=center, negative=bear winning, positive=bull winning
  const barW = 300;
  const barH = 14;
  const barX = CENTER_X - barW / 2;
  const barY = midY + 55;
  const tugPos = rounds.length > 0
    ? (bullTotal - bearTotal) / Math.max(1, rounds.length) * 0.5 + momentum * 0.5
    : 0;
  const tugClamp = Math.max(-1, Math.min(1, tugPos));
  const indicatorX = CENTER_X + tugClamp * (barW / 2 - 8);

  return (
    <g>
      {/* Arena background */}
      <rect x={ax} y={y} width={arenaW} height={arenaH} rx={16}
        fill="#0a0a14" stroke="#3f3f4630" strokeWidth={1} />

      {/* Gradient overlays for each side */}
      <defs>
        <linearGradient id="bullGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08" />
          <stop offset="60%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bearGlow" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.08" />
          <stop offset="60%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={ax} y={y} width={arenaW / 2} height={arenaH} rx={16} fill="url(#bullGlow)" />
      <rect x={CENTER_X} y={y} width={arenaW / 2} height={arenaH} rx={16} fill="url(#bearGlow)" />

      {/* Center divider */}
      <line x1={CENTER_X} y1={y + 12} x2={CENTER_X} y2={y + arenaH - 12}
        stroke="#ffffff08" strokeWidth={1} strokeDasharray="6 4" />

      {/* VS text */}
      <text x={CENTER_X} y={y + 30} fontSize={18} fontWeight={900} fill="#52525b" textAnchor="middle"
        fontFamily="var(--font-geist-mono), monospace" fontStyle="italic">
        VS
      </text>
      <text x={CENTER_X} y={y + 44} fontSize={8} fill="#3f3f46" textAnchor="middle"
        fontFamily="var(--font-geist-mono), monospace" letterSpacing="3">
        ADVERSARIAL DEBATE
      </text>

      {/* Bull Agent */}
      <g>
        {isActive && (
          <circle cx={bullX} cy={midY - 10} r={40} fill="none" stroke="#22c55e" strokeWidth={1} opacity={0.2} className="animate-pulse-glow" />
        )}
        <circle cx={bullX} cy={midY - 10} r={32} fill="#052e16" stroke="#22c55e" strokeWidth={2} />
        <text x={bullX} y={midY - 6} fontSize={24} textAnchor="middle" dominantBaseline="middle">
          {"\u{1F4AA}"}
        </text>
        <text x={bullX} y={midY + 32} fontSize={14} fontWeight={900} fill="#22c55e" textAnchor="middle"
          fontFamily="var(--font-geist-mono), monospace" letterSpacing="2">
          BULL
        </text>
        <text x={bullX} y={midY + 48} fontSize={10} fill="#22c55e80" textAnchor="middle"
          fontFamily="var(--font-geist-mono), monospace">
          {bullTotal > 0 ? `${bullTotal} rounds won` : "Ready"}
        </text>
      </g>

      {/* Bear Agent */}
      <g>
        {isActive && (
          <circle cx={bearX} cy={midY - 10} r={40} fill="none" stroke="#ef4444" strokeWidth={1} opacity={0.2} className="animate-pulse-glow" />
        )}
        <circle cx={bearX} cy={midY - 10} r={32} fill="#1c0a0a" stroke="#ef4444" strokeWidth={2} />
        <text x={bearX} y={midY - 6} fontSize={24} textAnchor="middle" dominantBaseline="middle">
          {"\u{1F6E1}\uFE0F"}
        </text>
        <text x={bearX} y={midY + 32} fontSize={14} fontWeight={900} fill="#ef4444" textAnchor="middle"
          fontFamily="var(--font-geist-mono), monospace" letterSpacing="2">
          BEAR
        </text>
        <text x={bearX} y={midY + 48} fontSize={10} fill="#ef444480" textAnchor="middle"
          fontFamily="var(--font-geist-mono), monospace">
          {bearTotal > 0 ? `${bearTotal} rounds won` : "Ready"}
        </text>
      </g>

      {/* Clash effects between agents */}
      {isActive && rounds.length > 0 && (
        <g>
          {/* Lightning bolts / clash lines */}
          {[0, 1, 2].map((i) => {
            const cx = CENTER_X + (i - 1) * 30;
            const cy = midY - 15 + i * 8;
            return (
              <g key={`clash-${i}`}>
                <line x1={cx - 20} y1={cy - 8} x2={cx - 3} y2={cy + 2}
                  stroke="#fbbf24" strokeWidth={2} opacity={0.6} />
                <line x1={cx - 3} y1={cy + 2} x2={cx + 10} y2={cy - 6}
                  stroke="#fbbf24" strokeWidth={2} opacity={0.6} />
                <line x1={cx + 10} y1={cy - 6} x2={cx + 20} y2={cy + 4}
                  stroke="#fbbf24" strokeWidth={2} opacity={0.6} />
              </g>
            );
          })}
          {/* Impact sparks */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i / 6) * Math.PI * 2 + (rounds.length * 0.5);
            const r = 15 + Math.sin(i * 2.1) * 8;
            const sx = CENTER_X + Math.cos(angle) * r;
            const sy = midY - 8 + Math.sin(angle) * r;
            return (
              <circle key={`spark-${i}`} cx={sx} cy={sy} r={1.5}
                fill="#fbbf24" opacity={0.4 + Math.sin(i * 1.3) * 0.3} />
            );
          })}
        </g>
      )}

      {/* Round indicators */}
      {rounds.length > 0 && (
        <g>
          <text x={CENTER_X} y={barY - 16} fontSize={9} fill="#71717a" textAnchor="middle"
            fontFamily="var(--font-geist-mono), monospace">
            ROUND {rounds.length} / 10
          </text>
          {/* Round dots */}
          {Array.from({ length: 10 }).map((_, i) => {
            const dotX = CENTER_X - 60 + i * 13.3;
            const dotY = barY - 6;
            const round = rounds.find((r) => r.round === i + 1);
            let fill = "#27272a";
            if (round) {
              fill = round.bullStrength > round.bearStrength ? "#22c55e" : "#ef4444";
            }
            return (
              <circle key={`dot-${i}`} cx={dotX} cy={dotY} r={3.5}
                fill={fill} stroke="#18181b" strokeWidth={1} />
            );
          })}
        </g>
      )}

      {/* Tug-of-war momentum bar */}
      {rounds.length > 0 && (
        <g>
          {/* Bar background */}
          <rect x={barX} y={barY} width={barW} height={barH} rx={7}
            fill="#18181b" stroke="#27272a" strokeWidth={1} />
          {/* Green half */}
          <rect x={barX} y={barY} width={barW / 2} height={barH} rx={7}
            fill="#22c55e08" />
          {/* Red half */}
          <rect x={CENTER_X} y={barY} width={barW / 2} height={barH} rx={7}
            fill="#ef444408" />
          {/* Center tick */}
          <line x1={CENTER_X} y1={barY + 2} x2={CENTER_X} y2={barY + barH - 2}
            stroke="#3f3f46" strokeWidth={1} />
          {/* Momentum indicator */}
          <circle cx={indicatorX} cy={barY + barH / 2} r={8}
            fill={tugClamp >= 0 ? "#22c55e" : "#ef4444"} stroke="#0a0a14" strokeWidth={2} />
          <circle cx={indicatorX} cy={barY + barH / 2} r={4}
            fill="#ffffff" opacity={0.9} />
          {/* Labels */}
          <text x={barX - 8} y={barY + barH / 2 + 4} fontSize={8} fill="#22c55e" textAnchor="end"
            fontFamily="var(--font-geist-mono), monospace" fontWeight={700}>
            BUY
          </text>
          <text x={barX + barW + 8} y={barY + barH / 2 + 4} fontSize={8} fill="#ef4444" textAnchor="start"
            fontFamily="var(--font-geist-mono), monospace" fontWeight={700}>
            SELL
          </text>
        </g>
      )}
    </g>
  );
}

export default function AgentGraph({ agents, highlightedEvidence, debateEvents }: Props) {
  // Build vertical flow
  let y = 10;
  const elements: React.ReactNode[] = [];
  const orchestrator = agents.orchestrator;
  const orchStatus = orchestrator?.status || "idle";

  // --- Phase 1: Orchestrator init ---
  if (orchestrator?.messages.some((m) => m.includes("Received") || m.includes("Identified") || m.includes("Dispatching"))) {
    elements.push(
      <OrchestratorNode key="orch-start" y={y} message="Identifying company and dispatching agents"
        status={orchStatus === "completed" ? "completed" : "running"} />
    );
    y += 60;

    // Dispatch arrows down to agents
    elements.push(
      <g key="dispatch-arrows">
        {CHILD_POSITIONS.map((child) => (
          <line key={`dispatch-${child.id}`}
            x1={CENTER_X} y1={y - 16}
            x2={child.x} y2={y + 4}
            stroke="#f59e0b25" strokeWidth={1.5} strokeDasharray="4 3"
            markerEnd="url(#arrowDown)" />
        ))}
      </g>
    );
    y += 16;
  }

  // --- Phase 2: Agent nodes ---
  const agentY = y;
  CHILD_POSITIONS.forEach((child) => {
    const agent = agents[child.id];
    elements.push(
      <AgentNode key={`agent-${child.id}`}
        x={child.x} y={agentY} label={child.label}
        color={child.color} status={agent?.status || "idle"} />
    );
  });
  y = agentY + 48;

  // --- Phase 3: Tool cards per agent column ---
  const columnHeights: Record<string, number> = {};
  CHILD_POSITIONS.forEach((child) => {
    const agent = agents[child.id];
    const tools = agent?.tools || [];
    const seen = new Map<string, ToolTrace>();
    for (const t of tools) {
      const key = t.evidence_id || t.name + t.status;
      seen.set(key, t);
    }
    const uniqueTools = Array.from(seen.values());

    let toolY = y;
    uniqueTools.forEach((tool, i) => {
      const isHighlighted = tool.evidence_id ? highlightedEvidence.includes(tool.evidence_id) : false;

      elements.push(
        <line key={`conn-${child.id}-${i}`}
          x1={child.x} y1={toolY - 8}
          x2={child.x} y2={toolY + 2}
          stroke={child.color + "30"} strokeWidth={1} />
      );

      elements.push(
        <ToolCard key={`tool-${child.id}-${i}`}
          tool={tool} x={child.x} y={toolY}
          color={child.color} highlighted={isHighlighted}
          cardId={`${child.id}-${i}`} />
      );

      toolY += getToolCardHeight(tool) + 12;
    });
    columnHeights[child.id] = toolY;
  });

  y = Math.max(y + 40, ...Object.values(columnHeights)) + 8;

  // --- Phase 4: Return arrows back to orchestrator ---
  if (orchestrator?.messages.some((m) => m.includes("Aggregating"))) {
    elements.push(
      <g key="return-arrows">
        {CHILD_POSITIONS.map((child) => (
          <line key={`return-${child.id}`}
            x1={child.x} y1={y - 8}
            x2={CENTER_X} y2={y + 20}
            stroke="#3b82f640" strokeWidth={1.5} strokeDasharray="4 3"
            markerEnd="url(#arrowUp)" />
        ))}
      </g>
    );
    y += 28;

    elements.push(
      <OrchestratorNode key="orch-agg" y={y} message="Aggregating results from all agents"
        status="running" />
    );
    y += 56;
  }

  // --- Phase 5: Orchestrator "Cross-referencing" ---
  if (orchestrator?.messages.some((m) => m.includes("Cross-referencing"))) {
    elements.push(
      <line key="orch-conn-2" x1={CENTER_X} y1={y - 8} x2={CENTER_X} y2={y + 4}
        stroke="#f59e0b20" strokeWidth={1} />
    );
    elements.push(
      <OrchestratorNode key="orch-synth" y={y} message="Cross-referencing evidence"
        status="running" />
    );
    y += 56;
  }

  // --- Phase 6: Orchestrator completes → dispatch to debate ---
  if (orchestrator?.messages.some((m) => m.includes("Evidence package") || m.includes("Initiating"))) {
    elements.push(
      <line key="orch-conn-debate" x1={CENTER_X} y1={y - 8} x2={CENTER_X} y2={y + 4}
        stroke="#f59e0b20" strokeWidth={1} />
    );
    elements.push(
      <OrchestratorNode key="orch-debate" y={y} message="Initiating adversarial debate"
        status="completed" />
    );
    y += 64;
  }

  // --- Phase 7: Battle Arena — Bull vs Bear ---
  const hasDebate = debateEvents.length > 0 || agents.bull?.status === "running" || agents.bear?.status === "running";
  if (hasDebate) {
    // Build round data from debate events
    const roundMap: Record<number, { bull: number; bear: number }> = {};
    for (const ev of debateEvents) {
      if (!ev.argument || ev.argument.ruling === "verdict") continue;
      const round = ev.debate_round ?? ev.argument.round ?? 0;
      if (round === 0) continue;
      if (!roundMap[round]) roundMap[round] = { bull: 0, bear: 0 };
      if (ev.argument.position === "bull" && ev.argument.strength != null) {
        roundMap[round].bull = ev.argument.strength;
      }
      if (ev.argument.position === "bear" && ev.argument.strength != null) {
        roundMap[round].bear = ev.argument.strength;
      }
    }
    const roundData: RoundInfo[] = Object.entries(roundMap)
      .filter(([, v]) => v.bull > 0 && v.bear > 0)
      .map(([k, v]) => ({ round: Number(k), bullStrength: v.bull, bearStrength: v.bear }))
      .sort((a, b) => a.round - b.round);

    // Dispatch arrows from orchestrator to battle
    elements.push(
      <g key="battle-dispatch">
        <line x1={CENTER_X - 100} y1={y - 20} x2={CENTER_X - 200} y2={y + 8}
          stroke="#22c55e30" strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={CENTER_X + 100} y1={y - 20} x2={CENTER_X + 200} y2={y + 8}
          stroke="#ef444430" strokeWidth={1.5} strokeDasharray="4 3" />
      </g>
    );

    const isDebateActive = agents.bull?.status === "running" || agents.bear?.status === "running";
    elements.push(
      <BattleArena key="battle-arena" y={y} rounds={roundData} isActive={isDebateActive || roundData.length > 0} />
    );
    y += 240;
  }

  // --- Phase 8: Verdict ---
  if (orchestrator?.messages.some((m) => m.includes("VERDICT"))) {
    elements.push(
      <line key="orch-conn-verdict" x1={CENTER_X} y1={y - 8} x2={CENTER_X} y2={y + 4}
        stroke="#3b82f620" strokeWidth={1} />
    );
    elements.push(
      <OrchestratorNode key="orch-verdict" y={y} message="VERDICT: BUY — Bull prevails 7-3"
        status="completed" />
    );
    y += 56;
  }

  const svgHeight = Math.max(300, y + 10);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 overflow-x-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Agent Flow</span>
        <div className="flex-1 h-px bg-zinc-800" />
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Active
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" /> Done
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 1000 ${svgHeight}`} className="w-full h-auto">
        <defs>
          <marker id="arrowDown" markerWidth="6" markerHeight="5" refX="3" refY="5" orient="auto">
            <path d="M0,0 L3,5 L6,0" fill="#f59e0b40" />
          </marker>
          <marker id="arrowUp" markerWidth="6" markerHeight="5" refX="3" refY="0" orient="auto">
            <path d="M0,5 L3,0 L6,5" fill="#3b82f660" />
          </marker>
        </defs>
        {elements}
      </svg>
    </div>
  );
}
