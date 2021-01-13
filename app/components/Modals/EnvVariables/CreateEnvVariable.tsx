import { Box, Keyboard } from "grommet";
import { useEffect, useState } from "react";

import { useCreateEnvironmentVariable } from "../../../hooks/mutations";
import { copy } from "../../../theme/copy";
import Button from "../../shared/Button";
import TextInput from "../../shared/TextInput";

type Props = { groupId: string };

export default function CreateEnvVariable({ groupId }: Props): JSX.Element {
  const [
    createEnvironmentVariable,
    { data, loading },
  ] = useCreateEnvironmentVariable();

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  // clear form after creating an env variable
  useEffect(() => {
    if (!data?.createEnvironmentVariable) return;

    setName("");
    setValue("");
  }, [data]);

  const handleClick = () => {
    if (!name || !value) return;
    createEnvironmentVariable({
      variables: { group_id: groupId, name, value },
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <Keyboard onEnter={handleClick}>
      <Box direction="row" flex={false}>
        <TextInput
          name="environment variable name"
          onChange={handleNameChange}
          placeholder={copy.envVariableName}
          value={name}
        />
        <TextInput
          name="environment variable value"
          onChange={handleValueChange}
          placeholder={copy.envVariableValue}
          value={value}
        />
        <Button disabled={loading} message={copy.add} onClick={handleClick} />
      </Box>
    </Keyboard>
  );
}
