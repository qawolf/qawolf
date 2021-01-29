import { Box } from "grommet";
import { useState } from "react";

import { EnvironmentVariable } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { overflowStyle } from "../../../theme/theme-new";
import EditDeleteButtons, {
  StyledBox,
} from "../../shared-new/EditDeleteButtons";
import Text from "../../shared-new/Text";
import Form from "./Form";

type Props = {
  editEnvironmentVariableId: string;
  environmentVariable: EnvironmentVariable;
  onCancelClick: () => void;
  onDeleteClick: () => void;
  onEditClick: (editEnvironmentVariableId: string) => void;
};

export const nameWidth = "220px";

export default function ListItem({
  editEnvironmentVariableId,
  environmentVariable,
  onCancelClick,
  onDeleteClick,
  onEditClick,
}: Props): JSX.Element {
  const [isHover, setIsHover] = useState(false);

  if (environmentVariable.id === editEnvironmentVariableId) {
    return (
      <Form
        environmentId={environmentVariable.environment_id}
        environmentVariable={environmentVariable}
        onCancelClick={onCancelClick}
      />
    );
  }

  const handleEditClick = (): void => {
    setIsHover(false);
    onEditClick(environmentVariable.id);
  };

  return (
    <StyledBox
      align="center"
      direction="row"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <Box
        flex={false}
        margin={{ right: "xxsmall", vertical: "small" }}
        width={nameWidth}
      >
        <Text color="gray9" size="component" style={overflowStyle}>
          {environmentVariable.name}
        </Text>
      </Box>
      <Box align="center" direction="row" justify="between" width="full">
        <Text
          color={isHover ? "gray9" : "gray7"}
          margin={{ right: "xxsmall" }}
          size="component"
          style={overflowStyle}
        >
          {isHover ? environmentVariable.value : copy.encrypted}
        </Text>
        <EditDeleteButtons
          onDeleteClick={onDeleteClick}
          onEditClick={handleEditClick}
        />
      </Box>
    </StyledBox>
  );
}
