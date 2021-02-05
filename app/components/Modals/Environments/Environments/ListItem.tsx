import { Box } from "grommet";
import { MouseEvent, useState } from "react";
import styled from "styled-components";

import { Environment } from "../../../../lib/types";
import {
  borderSize,
  colors,
  overflowStyle,
  transitionDuration,
} from "../../../../theme/theme-new";
import Text from "../../../shared-new/Text";
import EnvironmentName from "./EnvironmentName";
import Options from "./Options";

type Props = {
  editEnvironmentId: string;
  environment: Environment;
  isSelected: boolean;
  onCancel: () => void;
  onClick: () => void;
  onDelete: () => void;
  onEdit: () => void;
  teamId: string;
};

const StyledBox = styled(Box)`
  cursor: pointer;
  transition: background ${transitionDuration};

  .env-options {
    opacity: 0;
    transiton: opacity ${transitionDuration};
  }

  &:hover {
    background: ${colors.gray2};

    .env-options {
      opacity: 1;
    }
  }
`;

export default function ListItem({
  editEnvironmentId,
  environment,
  isSelected,
  onCancel,
  onClick,
  onDelete,
  onEdit,
  teamId,
}: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  if (environment.id === editEnvironmentId) {
    return (
      <EnvironmentName
        environment={environment}
        onCancel={onCancel}
        teamId={teamId}
      />
    );
  }

  const handleClick = (): void => {
    if (!isOpen) onClick();
  };

  const handleOptionsClick = (e: MouseEvent): void => {
    e.stopPropagation(); // do not change selected environment
    setIsOpen((prev) => !prev);
  };

  const handleOptionsClose = (): void => setIsOpen(false);

  return (
    <StyledBox
      align="center"
      background={isSelected ? "gray2" : "transparent"}
      direction="row"
      flex={false}
      justify="between"
      margin={{ bottom: "2px" }}
      onClick={handleClick}
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
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </StyledBox>
  );
}
