import { Box, BoxProps, Image } from "grommet";
import { useContext, useState } from "react";

import { copy } from "../../theme/copy";
import { borderSize } from "../../theme/theme";
import { UserContext } from "../UserContext";
import WolfHead from "./icons/WolfHead";
import Spinner from "./Spinner";
import Text from "./Text";

type Props = {
  gifUrl: string | null;
  isLoading?: boolean;
  isRunning?: boolean;
  margin?: BoxProps["margin"];
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
  margin,
  testName,
}: Props): JSX.Element {
  const { wolf } = useContext(UserContext);
  const [hasError, setHasError] = useState(false);

  const handleError = (): void => setHasError(true);

  if (gifUrl && !hasError) {
    return (
      <Box {...boxProps} margin={margin} overflow="hidden">
        <Image
          a11yTitle={`${testName} latest run`}
          fit="contain"
          onError={handleError}
          src={gifUrl}
        />
      </Box>
    );
  }

  let message = copy.notRunYet;
  if (isLoading) message = copy.loading;
  if (hasError) message = copy.notAvailable;

  const innerHtml = isRunning ? (
    <Spinner size="small" />
  ) : (
    <>
      {!!wolf && <WolfHead color={wolf.variant} />}
      <Text color="gray7" margin={{ top: "2px" }} size="componentSmall">
        {message}
      </Text>
    </>
  );

  return (
    <Box
      {...boxProps}
      align="center"
      background="gray2"
      justify="center"
      margin={margin}
    >
      {innerHtml}
    </Box>
  );
}
