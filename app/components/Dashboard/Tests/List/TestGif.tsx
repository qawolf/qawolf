import { Box, Image } from "grommet";

import { copy } from "../../../../theme/copy";
import WolfHead from "../../../shared/icons/WolfHead";
import Spinner from "../../../shared/Spinner";
import Text from "../../../shared/Text";

type Props = {
  gifUrl: string | null;
  inProgress: boolean;
  wolfVariant: string;
};

const ASPECT_RATIO = 1.6;
export const HEIGHT = "80px";
// 18px is height of small spinner
const SPINNER_PAD = `calc((${HEIGHT} - 18px) / 2)`;
const WIDTH = `calc(${HEIGHT} * ${ASPECT_RATIO})`;

export default function TestGif({
  gifUrl,
  inProgress,
  wolfVariant,
}: Props): JSX.Element {
  let innerHtml = (
    <Box
      align="center"
      background="brand"
      height={HEIGHT}
      justify="center"
      width={WIDTH}
    >
      <WolfHead variant={wolfVariant} />
      <Text color="black" size="small">
        {copy.noRuns}
      </Text>
    </Box>
  );

  if (gifUrl) {
    innerHtml = <Image height={HEIGHT} src={gifUrl} width={WIDTH} />;
  } else if (inProgress) {
    innerHtml = (
      <Box
        background="black"
        height={HEIGHT}
        justify="center"
        pad={{ top: SPINNER_PAD }}
        width={WIDTH}
      >
        <Spinner color="white" noMargin small />
      </Box>
    );
  }

  return (
    <Box
      flex={false}
      overflow="hidden"
      round={{ corner: "left", size: "small" }}
    >
      {innerHtml}
    </Box>
  );
}
