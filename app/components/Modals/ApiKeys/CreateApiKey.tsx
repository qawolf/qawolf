import { Box, Keyboard } from "grommet";
import { useContext, useEffect, useState } from "react";

import { useCreateApiKey } from "../../../hooks/mutations";
import { ApiKey } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Button from "../../shared/Button";
import TextInput from "../../shared/TextInput";
import { StateContext } from "../../StateContext";
import CopyApiKey from "./CopyApiKey";

type Props = { refetchApiKeys: () => void };

export default function CreateApiKey({ refetchApiKeys }: Props): JSX.Element {
  const [createApiKey, { data, loading }] = useCreateApiKey();
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [name, setName] = useState("");

  const { teamId } = useContext(StateContext);

  useEffect(() => {
    if (!data?.createApiKey) return;

    setApiKey(data.createApiKey);
    setName("");
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleClick = () => {
    if (!name) return;
    createApiKey({ variables: { name, team_id: teamId || "" } });
  };

  const handleDoneClick = () => {
    refetchApiKeys(); // refetch so token is overwritten in cache
    setApiKey(null);
  };

  if (apiKey) {
    return <CopyApiKey apiKey={apiKey} onDoneClick={handleDoneClick} />;
  }

  return (
    <Keyboard onEnter={handleClick}>
      <Box direction="row" flex={false}>
        <TextInput
          onChange={handleChange}
          placeholder={copy.apiKeyName}
          value={name}
        />
        <Button
          disabled={loading}
          message={copy.apiKeyCreate}
          onClick={handleClick}
        />
      </Box>
    </Keyboard>
  );
}
