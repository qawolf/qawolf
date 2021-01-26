import { Icon } from "grommet-icons";

import Divider from "../Divider";
import Option from "./Option";

type Props = {
  IconComponent?: Icon;
  label: string;
  onClick: () => void;
};

export default function Action({
  IconComponent,
  label,
  onClick,
}: Props): JSX.Element {
  return (
    <>
      <Option IconComponent={IconComponent} label={label} onClick={onClick} />
      <Divider margin={{ vertical: "xxxsmall" }} />
    </>
  );
}
