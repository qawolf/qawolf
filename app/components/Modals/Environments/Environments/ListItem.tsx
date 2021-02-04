import { Box } from "grommet";
import { MouseEvent, useState } from "react";
import styled from "styled-components";
import { Environment } from "../../../../lib/types";
import {
  borderSize,
  colors,
  edgeSize,
  overflowStyle,
  transitionDuration,
} from "../../../../theme/theme-new";
import Text from "../../../shared-new/Text";
import EnvironmentName from "./EnvironmentName";
import Options from "./Options";

type Props = {
  editEnvironmentId: string;
  environment: Environment;
  onCancel: () => void;
  onClick: () => void;
  onDelete: () => void;
  onEdit: () => void;
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
  onCancel,
  onClick,
  onDelete,
  onEdit,
}: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  if (environment.id === editEnvironmentId) {
    return <EnvironmentName environment={environment} onCancel={onCancel} />;
  }

  const handleOptionsClick = (e: MouseEvent): void => {
    e.stopPropagation(); // do not change selected environment
    setIsOpen((prev) => !prev);
  };

  const handleOptionsClose = (): void => setIsOpen(false);

  return (
    <StyledBox
      align="center"
      border={{ color: "transparent", size: "xsmall" }}
      direction="row"
      justify="between"
      margin={{ bottom: "2px" }}
      onClick={onClick}
      pad={{
        left: "xsmall",
        right: "xxsmall",
        vertical: `calc(${edgeSize.xxsmall} - ${borderSize.xsmall})`,
      }}
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
