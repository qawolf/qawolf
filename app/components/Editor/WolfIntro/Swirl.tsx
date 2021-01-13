import { Box } from "grommet";

import LoadableImage from "../../shared/LoadableImage";
import {
  LARGE_SWIRL_SIZE,
  MAX_SWIRL_SIZE,
  SWIRL_SIZE,
} from "./animations/swirls";

type Props = {
  index: number;
};

const getSwirlHeight = (index: number): string => {
  if (index === 2) return MAX_SWIRL_SIZE;
  if (index === 3) return LARGE_SWIRL_SIZE;

  return SWIRL_SIZE;
};

export default function Swirl({ index }: Props): JSX.Element {
  const height = getSwirlHeight(index);

  return (
    <Box
      id={`swirl-${index}-container`}
      style={{
        position: "absolute",
        zIndex: 10,
      }}
    >
      <Box height={height} id={`swirl-${index}`} width="0">
        <LoadableImage fit="contain" group="wolf" src={`/swirl_${index}.png`} />
      </Box>
    </Box>
  );
}
