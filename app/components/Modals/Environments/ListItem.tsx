import { Box } from "grommet";
import { Environment } from "../../../lib/types";
import { overflowStyle, transitionDuration } from "../../../theme/theme-new";

import Text from "../../shared-new/Text";
import styled from "styled-components";
import Form from "./Form";
import EnvironmentActions from "./EnvironmentActions";

type Props = {
  editEnvironmentId: string | null;
  environment: Environment;
  onCancelClick: () => void;
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
  onEditClick,
}: Props): JSX.Element {
  if (environment.id === editEnvironmentId) {
    return <Form environment={environment} onCancelClick={onCancelClick} />;
  }

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
      <EnvironmentActions onEditClick={handleEditClick} />
    </StyledBox>
  );
}
