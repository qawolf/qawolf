import { Drop, DropProps } from "grommet";
import { CSSProperties } from "react";

import { edgeSize } from "../../../theme/theme";
import TooltipComponent from "./Tooltip";

type Props = {
  align?: DropProps["align"];
  isVisible: boolean;
  label: string;
  target: DropProps["target"];
  style?: CSSProperties;
};

export default function Tooltip({
  align,
  isVisible,
  label,
  target,
  style,
}: Props): JSX.Element {
  if (!isVisible) return null;

  return (
    <Drop
      align={align || { bottom: "top" }}
      plain
      style={style || { marginBottom: edgeSize.xxxsmall }}
      target={target}
    >
      <TooltipComponent label={label} />
    </Drop>
  );
}
