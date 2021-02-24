import { RunStatus } from "../../lib/types";
import { colors, edgeSize } from "../../theme/theme-new";
import DotCircle from "./icons/DotCircle";
import Fail from "./icons/Fail";
import Pass from "./icons/Pass";

type Props = { status: RunStatus };

export default function StatusIcon({ status }: Props): JSX.Element {
  if (status === "fail") return <Fail />;
  if (status === "pass") return <Pass />;

  return <DotCircle color={colors.gray9} size={edgeSize.small} />;
}
