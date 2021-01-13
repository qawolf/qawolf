import { Box } from "grommet";

import { edgeSize } from "../../theme/theme";

type Props = {
  background: string;
  reverse?: boolean;
  src: string;
};

const backgroundRound = "80px";
const rotate = "6deg";

export default function ProductVideo({
  background,
  reverse,
  src,
}: Props): JSX.Element {
  const rotation = `${reverse ? "" : "-"}${rotate}`;

  return (
    <Box style={{ position: "relative" }} width="full">
      <video
        autoPlay
        controls={false}
        loop
        muted
        playsInline
        src={src}
        style={{ borderRadius: edgeSize.medium, width: "100%", zIndex: 1 }}
      />
      <Box
        background={background}
        fill
        round={backgroundRound}
        style={{
          left: 0,
          position: "absolute",
          top: 0,
          transform: `rotate(${rotation})`,
        }}
      />
    </Box>
  );
}
