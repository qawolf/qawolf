import { Environment } from "../../../lib/types";
import { overflowStyle } from "../../../theme/theme-new";
import Text from "../../shared-new/Text";
import EditDeleteButtons, {
  StyledBox,
} from "../../shared-new/EditDeleteButtons";
import Form from "./Form";

type Props = {
  editEnvironmentId: string | null;
  environment: Environment;
  onCancelClick: () => void;
  onDeleteClick: (environment: Environment) => void;
  onEditClick: (editEnvironmentId: string) => void;
};

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
      <EditDeleteButtons
        onDeleteClick={handleDeleteClick}
        onEditClick={handleEditClick}
      />
    </StyledBox>
  );
}
