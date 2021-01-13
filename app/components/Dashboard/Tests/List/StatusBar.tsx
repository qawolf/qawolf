import { Box, Drop } from "grommet";
import Link from "next/link";
import { useRef, useState } from "react";

import { timeToText } from "../../../../lib/helpers";
import { routes } from "../../../../lib/routes";
import { SuiteRun } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme";
import Text from "../../../shared/Text";

const getStatusColor = (status: string): string => {
  if (status === "pass") return "limeGreen";
  if (status === "fail") return "pink";

  return "borderGray";
};

const getStatusMessage = (status: string): string => {
  if (status === "pass") return copy.testPass;
  if (status === "fail") return copy.testFail;
  return copy.testInProgress;
};

type Props = {
  run: SuiteRun;
};

export default function StatusBar({ run }: Props): JSX.Element {
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const background = getStatusColor(run.status);
  const message = getStatusMessage(run.status);
  const timestamp = run.started_at
    ? timeToText(run.started_at)
    : copy.notStarted;

  return (
    <>
      <Link href={`${routes.run}/${run.id}`}>
        <a>
          <Box
            background={background}
            height={edgeSize.xxlarge}
            margin={{ left: "small" }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            ref={ref}
            round="xlarge"
            width={edgeSize.medium}
          />
        </a>
      </Link>
      {showTooltip && (
        <Drop align={{ bottom: "top" }} plain target={ref.current}>
          <Box background="black" pad={{ horizontal: "small" }} round="xsmall">
            <Text color="white" size="small">
              {`${message}: ${timestamp}`}
            </Text>
          </Box>
        </Drop>
      )}
    </>
  );
}
