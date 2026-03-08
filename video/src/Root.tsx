import { Composition } from "remotion";
import { AnalysisVideo } from "./AnalysisVideo";
import { MOCK_DATA } from "./data";

export const Root: React.FC = () => {
  return (
    <Composition
      id="AnalysisVideo"
      component={AnalysisVideo}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={MOCK_DATA}
    />
  );
};
