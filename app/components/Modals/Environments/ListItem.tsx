import { Box } from "grommet";
import { Environment } from "../../../lib/types";
import { overflowStyle, transitionDuration } from "../../../theme/theme-new";

import Buttons from "./Buttons";
import Text from "../../shared-new/Text";
import styled from "styled-components";
import Form from "./Form";

type Props = {
  editEnvironmentId: string | null;
  environment: Environment;
  setEditEnvironmentId: (editEnvironmentId: string | null) => void;
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
  setEditEnvironmentId,
}: Props): JSX.Element {
  if (environment.id === editEnvironmentId) {
    const handleCancelClick = (): void => setEditEnvironmentId(null);

    return <Form environment={environment} onCancelClick={handleCancelClick} />;
  }

  const handleEditClick = (): void => setEditEnvironmentId(environment.id);

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
      <Buttons onEditClick={handleEditClick} />
    </StyledBox>
  );
}
