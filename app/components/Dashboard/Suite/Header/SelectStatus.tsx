import { RunStatus, SuiteRun } from "../../../../lib/types";
import Divider from "../../../shared-new/Divider";
import Select from "../../../shared-new/Select";
import { getLabelForStatus } from "../../helpers";
import StatusOption from "./StatusOption";

type Props = {
  runs: SuiteRun[];
  setStatus: (status: RunStatus | null) => void;
  status: RunStatus | null;
};

const statuses: RunStatus[] = ["fail", "pass", "created"];
const width = "240px";

export default function SelectStatus({
  runs,
  setStatus,
  status,
}: Props): JSX.Element {
  const label = getLabelForStatus(status);

  const handleClick = (status: RunStatus | null): void => {
    setStatus(status);
  };

  const optionsHtml = statuses.map((s) => {
    const count = runs.filter((r) => r.status === s).length;

    return (
      <StatusOption
        count={count}
        isSelected={s === status}
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
        onClick={() => handleClick(null)}
        status={null}
      />
      <Divider margin={{ vertical: "xxxsmall" }} />
      {optionsHtml}
    </Select>
  );
}
