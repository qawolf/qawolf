import { Box } from "grommet";
import Link from "next/link";

import { routes } from "../../../../../lib/routes";
import { RunStatus, SuiteRun } from "../../../../../server/types";
import { borderSize, edgeSize } from "../../../../../theme/theme-new";

type Props = { runs: SuiteRun[] };

const getBackgroundForRun = (status: RunStatus): string => {
  if (status === "pass") return "success5";
  if (status === "fail") return "danger5";

  return "gray3";
};

export default function RunBars({ runs }: Props): JSX.Element {
  const innerHtml = runs.map((run) => {
    return (
      <Link href={`${routes.run}/${run.id}`} key={run.id}>
        <a>
          <Box
            background={getBackgroundForRun(run.status)}
            height={edgeSize.small}
            round={borderSize.xsmall}
            width={edgeSize.xxxsmall}
          />
        </a>
      </Link>
    );
  });

  return (
    <Box
      direction="row-reverse"
      gap={borderSize.small}
      margin={{ left: "small", right: "xxsmall" }}
    >
      {innerHtml}
    </Box>
  );
}
