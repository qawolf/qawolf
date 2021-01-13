import { Box, TextProps } from "grommet";
import { useRouter } from "next/router";

import Button from "../components/shared/Button";
import Text from "../components/shared/Text";
import { routes } from "../lib/routes";
import { copy } from "../theme/copy";

const textProps = {
  color: "black",
  size: "xlarge",
  weight: "bold" as TextProps["weight"],
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
      <Text
        {...textProps}
        margin={{ top: "medium" }}
        size="medium"
        weight="normal"
      >
        {copy.notFound}
      </Text>
      <Button
        margin={{ top: "xxlarge" }}
        message={copy.goHome}
        onClick={handleClick}
      />
    </Box>
  );
}
