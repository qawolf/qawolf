import { useDeleteEnvironmentVariable } from "../../../hooks/mutations";
import DeleteButton from "../../shared/DeleteButton";

type Props = { environmentVariableId: string };

export default function DeleteEnvVariable({
  environmentVariableId,
}: Props): JSX.Element {
  const [deleteEnvVariable, { loading }] = useDeleteEnvironmentVariable();

  const handleDelete = () => {
    deleteEnvVariable({ variables: { id: environmentVariableId } });
  };

  return <DeleteButton disabled={loading} onDelete={handleDelete} />;
}
