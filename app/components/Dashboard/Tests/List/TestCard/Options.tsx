import { Box } from "grommet";
import { useRef, useState } from "react";

import { ShortTest } from "../../../../../lib/types";
import Button from "../../../../shared-new/AppButton";
import More from "../../../../shared-new/icons/More";

type Props = { test: ShortTest };

export default function Options({ test }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box ref={ref} style={{ position: "relative" }}>
      <Button IconComponent={More} type="ghost" />
    </Box>
  );
}
