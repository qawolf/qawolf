import { useDeleteApiKey } from "../../../hooks/mutations";
import DeleteButton from "../../shared/DeleteButton";

type Props = { apiKeyId: string };

export default function DeleteApiKey({ apiKeyId }: Props): JSX.Element {
  const [deleteApiKey, { loading }] = useDeleteApiKey();

  const handleDelete = () => {
    deleteApiKey({ variables: { id: apiKeyId } });
  };

  return <DeleteButton disabled={loading} onDelete={handleDelete} />;
}
