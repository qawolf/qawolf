import { Box } from "grommet";

import { containerProps } from "../helpers";
import Header from "./Header";

type Props = {
  isComplete: boolean;
  isOpen: boolean;
  label: string;
  onClick: () => void;
};

export default function Section({
  isComplete,
  isOpen,
  label,
  onClick,
}: Props): JSX.Element {
  return (
    <Box {...containerProps} pad={{ bottom: "medium" }}>
      <Header
        isComplete={isComplete}
        isOpen={isOpen}
        label={label}
        onClick={onClick}
      />
    </Box>
  );
}
