import { Box } from "grommet";

import LoadableImage from "../../shared/LoadableImage";

export default function Ramp(): JSX.Element {
  return (
    <>
      <Box
        id="ramp-container"
        style={{
          position: "absolute",
          zIndex: 11,
        }}
      >
        <Box id="ramp" style={{ transform: "scale(0)" }}>
          <LoadableImage fit="contain" group="wolf" src="/ramp.png" />
        </Box>
      </Box>
      <Box
        id="ramp-shadow-container"
        style={{
          position: "absolute",
          zIndex: 15,
        }}
        width="full"
      >
        <Box height="21px" id="ramp-shadow" style={{ transform: "scale(0)" }}>
          <LoadableImage fit="contain" group="wolf" src="/ramp_shadow.png" />
        </Box>
      </Box>
    </>
  );
}
