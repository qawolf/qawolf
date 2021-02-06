import { Box } from "grommet";
import { forwardRef, Ref } from "react";
import { borderSize } from "../../../theme/theme-new";
import Text from "../Text";

type Props = { error: string };

const offset = "4px";

function ErrorBadge(
  { error }: Props,
  ref?: Ref<HTMLInputElement>
): JSX.Element {
  return (
    <Box
      background="danger2"
      pad={{ horizontal: "xxsmall", vertical: "xxxsmall" }}
      ref={ref}
      round={borderSize.small}
      style={{ position: "absolute", right: offset, top: offset }}
    >
      <Text color="danger7" size="component">
        {error}
      </Text>
    </Box>
  );
}

export default forwardRef<HTMLDivElement, Props>(ErrorBadge);
