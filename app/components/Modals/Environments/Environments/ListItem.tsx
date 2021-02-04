import { Box, Button } from "grommet";
import { useState } from "react";
import styled from "styled-components";
import { Environment } from "../../../../lib/types";
import {
  borderSize,
  colors,
  overflowStyle,
  transitionDuration,
} from "../../../../theme/theme-new";
import Text from "../../../shared-new/Text";
import Options from "./Options";

type Props = {
  environment: Environment;
  onClick: () => void;
};

const StyledBox = styled(Box)`
  cursor: pointer;
  transition: background ${transitionDuration};

  button {
    opacity: 0;
    transiton: opacity ${transitionDuration};
  }

  &:hover {
    background: ${colors.gray2};

    button {
      opacity: 1;
    }
  }
`;

export default function ListItem({ environment, onClick }: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionsClick = (): void => setIsOpen((prev) => !prev);
  const handleOptionsClose = (): void => setIsOpen(false);

  return (
    <StyledBox
      align="center"
      direction="row"
      justify="between"
      margin={{ bottom: "2px" }}
      onClick={onClick}
      pad={{ left: "xsmall", right: "xxsmall", vertical: "xxsmall" }}
      round={borderSize.small}
    >
      <Text color="gray9" size="component" style={overflowStyle}>
        {environment.name}
      </Text>
      <Options
        isOpen={isOpen}
        onClick={handleOptionsClick}
        onClose={handleOptionsClose}
      />
    </StyledBox>
  );
}
