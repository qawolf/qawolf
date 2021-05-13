import { Box } from "grommet";
import { useState } from "react";

import { EnvironmentVariable } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { overflowStyle } from "../../../../theme/theme";
import EditDeleteButtons, {
  StyledBox,
} from "../../../shared/EditDeleteButtons";
import Text from "../../../shared/Text";
import Form from "./Form";

type Props = {
  editEnvironmentVariableId: string;
  environmentVariable: EnvironmentVariable;
  onClose: () => void;
  onDelete: () => void;
  onEdit: (editEnvironmentVariableId: string) => void;
};

export const nameWidth = "220px";

export default function ListItem({
  editEnvironmentVariableId,
  environmentVariable,
  onClose,
  onDelete,
  onEdit,
}: Props): JSX.Element {
  const [isHover, setIsHover] = useState(false);

  if (environmentVariable.id === editEnvironmentVariableId) {
    return (
      <Form
        environmentId={environmentVariable.environment_id}
        environmentVariable={environmentVariable}
        onClose={onClose}
      />
    );
  }

  const handleEditClick = (): void => {
    setIsHover(false);
    onEdit(environmentVariable.id);
  };

  return (
    <StyledBox
      align="center"
      direction="row"
      flex={false}
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
        <EditDeleteButtons onDelete={onDelete} onEdit={handleEditClick} />
      </Box>
    </StyledBox>
  );
}
