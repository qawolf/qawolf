import { Box } from "grommet";
import styled from "styled-components";

import { Environment } from "../../../lib/types";
import { overflowStyle, transitionDuration } from "../../../theme/theme-new";
import Text from "../../shared-new/Text";
import EnvironmentActions from "./EnvironmentActions";
import Form from "./Form";

type Props = {
  editEnvironmentId: string | null;
  environment: Environment;
  onCancelClick: () => void;
  onDeleteClick: (environment: Environment) => void;
  onEditClick: (editEnvironmentId: string) => void;
};

const StyledBox = styled(Box)`
  button {
    opacity: 0;
    transition: opacity ${transitionDuration};
  }

  &:hover {
    button {
      opacity: 1;
    }
  }
`;

export default function ListItem({
  editEnvironmentId,
  environment,
  onCancelClick,
  onDeleteClick,
  onEditClick,
}: Props): JSX.Element {
  if (environment.id === editEnvironmentId) {
    return <Form environment={environment} onCancelClick={onCancelClick} />;
  }

  const handleDeleteClick = (): void => onDeleteClick(environment);
  const handleEditClick = (): void => onEditClick(environment.id);

  return (
    <StyledBox align="center" direction="row" flex={false} justify="between">
      <Text
        color="gray9"
        margin={{ vertical: "small" }}
        size="component"
        style={overflowStyle}
      >
        {environment.name}
      </Text>
      <EnvironmentActions
        onDeleteClick={handleDeleteClick}
        onEditClick={handleEditClick}
      />
    </StyledBox>
  );
}
