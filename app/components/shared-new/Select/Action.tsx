import { Box } from "grommet";
import { Icon } from "grommet-icons";

import Option from "./Option";

type Props = {
  IconComponent?: Icon;
  label: string;
  onClick: () => void;
};

const borderHeight = "1px";

export default function Action({
  IconComponent,
  label,
  onClick,
}: Props): JSX.Element {
  return (
    <>
      <Option IconComponent={IconComponent} label={label} onClick={onClick} />
      <Box
        background="gray3"
        height={borderHeight}
        margin={{ vertical: "xxxsmall" }}
        width="full"
      />
    </>
  );
}
