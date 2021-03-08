import { RunStatus } from "../../lib/types";
import { colors, edgeSize } from "../../theme/theme";
import DotCircle from "./icons/DotCircle";
import Fail from "./icons/Fail";
import Pass from "./icons/Pass";

type Props = {
  status: RunStatus;
  width?: string;
};

export default function StatusIcon({ status, width }: Props): JSX.Element {
  if (status === "fail") return <Fail width={width} />;
  if (status === "pass") return <Pass width={width} />;

  return <DotCircle color={colors.gray9} size={width || edgeSize.small} />;
}
