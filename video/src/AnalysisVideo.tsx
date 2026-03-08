import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import type { AnalysisData } from "./data";
import { IntroScene } from "./scenes/IntroScene";
import { AgentsScene } from "./scenes/AgentsScene";
import { DebateScene } from "./scenes/DebateScene";
import { VerdictScene } from "./scenes/VerdictScene";
import { DashboardScene } from "./scenes/DashboardScene";

// Scene timing (frames at 30fps)
const INTRO_START = 0;
const INTRO_DURATION = 90; // 3s
const AGENTS_START = 90;
const AGENTS_DURATION = 120; // 4s
const DEBATE_START = 210;
const DEBATE_DURATION = 150; // 5s
const VERDICT_START = 360;
const VERDICT_DURATION = 90; // 3s
const DASHBOARD_START = 450;
const DASHBOARD_DURATION = 150; // 5s

export const AnalysisVideo: React.FC<AnalysisData> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050510" }}>
      <Sequence from={INTRO_START} durationInFrames={INTRO_DURATION}>
        <IntroScene company={props.company} ticker={props.ticker} />
      </Sequence>
      <Sequence from={AGENTS_START} durationInFrames={AGENTS_DURATION}>
        <AgentsScene agents={props.agents} />
      </Sequence>
      <Sequence from={DEBATE_START} durationInFrames={DEBATE_DURATION}>
        <DebateScene debate={props.debate} />
      </Sequence>
      <Sequence from={VERDICT_START} durationInFrames={VERDICT_DURATION}>
        <VerdictScene
          signal={props.signal}
          confidence={props.confidence}
          summary={props.summary}
        />
      </Sequence>
      <Sequence from={DASHBOARD_START} durationInFrames={DASHBOARD_DURATION}>
        <DashboardScene
          signal={props.signal}
          confidence={props.confidence}
          alpha={props.alpha}
          beta={props.beta}
          priceHistory={props.priceHistory}
          prediction={props.prediction}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
