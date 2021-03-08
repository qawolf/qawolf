import { Box, BoxProps } from "grommet";
import { ReactNode } from "react";

import Layer from "../Layer";

type Props = {
  a11yTitle?: string;
  children: ReactNode;
  closeModal: () => void;
  width?: BoxProps["width"];
};

const defaultWidth = "480px";

export default function Modal({
  a11yTitle,
  children,
  closeModal,
  width,
}: Props): JSX.Element {
  return (
    <Layer
      data-hj-suppress
      margin={{ vertical: "xlarge" }}
      onClickOutside={closeModal}
      onEsc={closeModal}
    >
      <Box a11yTitle={a11yTitle} width={width || defaultWidth}>
        {children}
      </Box>
    </Layer>
  );
}
