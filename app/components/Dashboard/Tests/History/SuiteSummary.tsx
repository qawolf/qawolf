import classNames from "classnames";
import { Box } from "grommet";
import Link from "next/link";

import { getBackgroundForStatus } from "../../../../lib/colors";
import { formatDate } from "../../../../lib/helpers";
import { routes } from "../../../../lib/routes";
import { Suite } from "../../../../lib/types";
import { edgeSize, hoverTransition } from "../../../../theme/theme";
import Text from "../../../shared/Text";
import StatusIcon from "../StatusIcon";
import { getHeadlineForSuite, getStatusForSuite } from "../utils";
import styles from "./History.module.css";

type Props = {
  selectedSuiteId?: string;
  setHoverSuiteId: (suiteId: string | null) => void;
  suite: Suite;
};

export default function SuiteSummary({
  selectedSuiteId,
  setHoverSuiteId,
  suite,
}: Props): JSX.Element {
  const status = getStatusForSuite(suite);
  const headline = getHeadlineForSuite(suite);
  const timestamp = formatDate(suite.created_at);

  const { background } = getBackgroundForStatus(status);

  const isSelected = selectedSuiteId === suite.id;

  const route = isSelected ? `${routes.tests}` : `${routes.tests}/${suite.id}`;

  // clear existing suite id if toggling it off
  const handleClick = () => {
    if (isSelected) setHoverSuiteId(null);
  };

  return (
    <Link href={route} replace>
      <a>
        <Box
          align="center"
          className={styles.suiteButton}
          data-test="suite-summary"
          direction="row"
          flex={false}
          justify="between"
          onClick={handleClick}
          onMouseEnter={() => setHoverSuiteId(suite.id)}
          onMouseLeave={() => setHoverSuiteId(null)}
          pad={{ bottom: "medium" }}
          width="full"
        >
          <Box align="center" direction="row">
            <StatusIcon margin={{ horizontal: "medium" }} status={status} />
            <Box>
              <Text color="black" size="medium" weight="bold">
                {headline}
              </Text>
              <Text color="gray" size="small">
                {timestamp}
              </Text>
            </Box>
          </Box>
          <Box
            background={background}
            className={classNames(styles.suiteBorder, {
              [styles.suiteBorderSelected]: isSelected,
            })}
            height={edgeSize.xxlarge}
            style={{ transition: hoverTransition }}
            width={edgeSize.small}
          />
        </Box>
      </a>
    </Link>
  );
}
