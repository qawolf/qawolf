import { Icon } from "grommet-icons";

import Divider from "../Divider";
import Option from "./Option";

type Props = {
  IconComponent?: Icon;
  dividerSide?: "bottom" | "top";
  label: string;
  onClick: () => void;
};

const dividerProps = {
  margin: { vertical: "xxxsmall" },
};

export default function Action({
  IconComponent,
  dividerSide,
  label,
  onClick,
}: Props): JSX.Element {
  return (
    <>
      {dividerSide === "top" && <Divider {...dividerProps} />}
      <Option IconComponent={IconComponent} label={label} onClick={onClick} />
      {dividerSide !== "top" && <Divider {...dividerProps} />}
    </>
  );
}
