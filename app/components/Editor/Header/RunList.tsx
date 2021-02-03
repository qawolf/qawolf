import { Box } from "grommet";
import { useRef } from "react";
import { useOnClickOutside } from "../../../hooks/onClickOutside";
import { useTestHistory } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import { edgeSize } from "../../../theme/theme-new";
import Menu from "../../shared-new/Menu";
import Text from "../../shared-new/Text";

type Props = { testId: string | null };

const width = "160px";

export default function RunList({ testId }: Props): JSX.Element {
  const { data } = useTestHistory({ id: testId });

  let innerHtml: JSX.Element;

  if (!data?.testHistory?.length) {
    const message = data?.testHistory ? copy.noHistory : copy.loading;

    innerHtml = (
      <Box
        height={edgeSize.large}
        justify="center"
        pad={{ horizontal: "xsmall" }}
      >
        <Text color="gray9" size="component">
          {message}
        </Text>
      </Box>
    );
  } else {
    innerHtml = <h1>runs here</h1>;
  }

  return (
    <Menu direction="down" width={width}>
      {innerHtml}
    </Menu>
  );
}
