import { useRouter } from "next/router";

import { routes } from "../../../../lib/routes";
import { RunStatus, SuiteRun } from "../../../../lib/types";
import Divider from "../../../shared-new/Divider";
import Select from "../../../shared-new/Select";
import { getLabelForStatus } from "../../helpers";
import StatusOption from "./StatusOption";

type Props = {
  runs: SuiteRun[];
};

const statuses: RunStatus[] = ["fail", "pass", "created"];
const width = "240px";

export default function SelectStatus({ runs }: Props): JSX.Element {
  const { replace, query } = useRouter();

  const suiteId = query.suite_id as string;
  const status = (query.status || null) as RunStatus | null;

  const label = getLabelForStatus(status);

  const handleAllClick = (): void => {
    replace(`${routes.suites}/${suiteId}`); // clear query
  };

  const handleClick = (status: RunStatus): void => {
    replace(`${routes.suites}/${suiteId}/?status=${status}`);
  };

  const optionsHtml = statuses.map((s) => {
    const count = runs.filter((r) => r.status === s).length;

    return (
      <StatusOption
        count={count}
        isSelected={s === status}
        key={s}
        onClick={() => handleClick(s)}
        status={s}
      />
    );
  });

  return (
    <Select flex={false} label={label} width={width}>
      <StatusOption
        count={runs.length}
        isSelected={!status}
        onClick={handleAllClick}
        status={null}
      />
      <Divider margin={{ vertical: "xxxsmall" }} />
      {optionsHtml}
    </Select>
  );
}
