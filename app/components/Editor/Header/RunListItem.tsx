import { Box } from "grommet";
import Link from "next/link";
import styled from "styled-components";
import { timeToText } from "../../../lib/helpers";
import { routes } from "../../../lib/routes";
import { TestHistoryRun } from "../../../lib/types";
import { colors, edgeSize, transitionDuration } from "../../../theme/theme-new";
import StatusBadge from "../../shared-new/StatusBadge";
import Text from "../../shared-new/Text";

type Props = { run: TestHistoryRun };

const StyledBox = styled(Box)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }
`;

export default function RunListItem({ run }: Props): JSX.Element {
  return (
    <Link href={`${routes.run}/${run.id}`}>
      <a>
        <StyledBox
          align="center"
          direction="row"
          height={edgeSize.large}
          justify="between"
          pad={{ horizontal: "xsmall" }}
        >
          <Text color="gray9" size="component">
            {timeToText(run.started_at)}
          </Text>
          <StatusBadge status={run.status} />
        </StyledBox>
      </a>
    </Link>
  );
}
