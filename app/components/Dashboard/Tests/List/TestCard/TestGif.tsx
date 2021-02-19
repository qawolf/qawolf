import { Box, Image } from "grommet";
import { useContext } from "react";

import { copy } from "../../../../../theme/copy";
import { borderSize } from "../../../../../theme/theme-new";
import WolfHead from "../../../../shared-new/icons/WolfHead";
import Text from "../../../../shared-new/Text";
import { UserContext } from "../../../../UserContext";

type Props = {
  gifUrl: string | null;
  testName: string;
};

const boxProps = {
  height: "72px",
  round: borderSize.small,
  width: "115.2px",
};

export default function TestGif({ gifUrl, testName }: Props): JSX.Element {
  const { wolf } = useContext(UserContext);

  if (gifUrl) {
    return (
      <Box {...boxProps} overflow="hidden">
        <Image
          a11yTitle={`${testName} latest run`}
          fit="contain"
          src={gifUrl}
        />
      </Box>
    );
  }

  return (
    <Box {...boxProps} align="center" background="gray3" justify="center">
      {!!wolf && <WolfHead color={wolf.variant} />}
      <Text color="gray9" margin={{ top: "xxsmall" }} size="component">
        {copy.noRuns}
      </Text>
    </Box>
  );
}
