import { Box } from "grommet";
import { useTestHistory } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import { edgeSize } from "../../../theme/theme-new";
import Menu from "../../shared-new/Menu";
import Text from "../../shared-new/Text";
import RunListItem from "./RunListItem";

type Props = { testId: string | null };

const width = "160px";

export default function RunList({ testId }: Props): JSX.Element {
  const { data } = useTestHistory({ id: testId });

  let innerHtml: JSX.Element | JSX.Element[];

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
    innerHtml = data.testHistory.map((run) => {
      return <RunListItem key={run.id} run={run} />;
    });
  }

  return (
    <Menu direction="down" width={width}>
      {innerHtml}
    </Menu>
  );
}
