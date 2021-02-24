import { Box, Image } from "grommet";
import { useContext } from "react";

import { copy } from "../../../../../theme/copy";
import { borderSize } from "../../../../../theme/theme-new";
import WolfHead from "../../../../shared-new/icons/WolfHead";
import Spinner from "../../../../shared-new/Spinner";
import Text from "../../../../shared-new/Text";
import { UserContext } from "../../../../UserContext";

type Props = {
  gifUrl: string | null;
  isLoading: boolean;
  isRunning: boolean;
  testName: string;
};

const boxProps = {
  height: "72px",
  flex: false,
  round: borderSize.small,
  width: "115.2px",
};

export default function TestGif({
  gifUrl,
  isLoading,
  isRunning,
  testName,
}: Props): JSX.Element {
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

  const innerHtml = isRunning ? (
    <Spinner size="small" />
  ) : (
    <>
      {!!wolf && <WolfHead color={wolf.variant} />}
      <Text color="gray7" margin={{ top: "2px" }} size="componentSmall">
        {isLoading ? copy.loading : copy.notRunYet}
      </Text>
    </>
  );

  return (
    <Box {...boxProps} align="center" background="gray2" justify="center">
      {innerHtml}
    </Box>
  );
}
