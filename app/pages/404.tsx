import { Box } from "grommet";
import { useRouter } from "next/router";

import Button from "../components/shared/AppButton";
import Text from "../components/shared/Text";
import { routes } from "../lib/routes";
import { copy } from "../theme/copy";

const textProps = {
  color: "gray9",
  size: "componentHeader" as const,
};

export default function NotFound(): JSX.Element {
  const { replace } = useRouter();

  const handleClick = () => {
    replace(routes.home);
  };

  return (
    <Box align="center" margin={{ top: "xxlarge" }} width="full">
      <Text {...textProps}>{copy.woof}</Text>
      <Text {...textProps}>{copy.woof2}</Text>
      <Text {...textProps} margin={{ top: "medium" }} size="component">
        {copy.notFound}
      </Text>
      <Button
        margin={{ top: "xxlarge" }}
        label={copy.goHome}
        onClick={handleClick}
        type="primary"
      />
    </Box>
  );
}
