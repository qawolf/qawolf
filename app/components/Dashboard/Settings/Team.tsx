import { Box } from "grommet";
import { KeyboardEvent, useRef } from "react";
import { ChangeEvent, useState } from "react";

import { useUpdateTeam } from "../../../hooks/mutations";
import { TeamWithUsers } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { border } from "../../../theme/theme-new";
import Button from "../../shared/AppButton";
import TextInput from "../../shared/AppTextInput";
import Text from "../../shared/Text";

type Props = { team: TeamWithUsers };

export default function Team({ team }: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  const [error, setError] = useState("");
  const [name, setName] = useState(team.name);

  const [updateTeam, { loading }] = useUpdateTeam();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleSave = (): void => {
    if (!name) {
      setError(copy.required);
      return;
    }

    setError("");

    updateTeam({
      optimisticResponse: {
        updateTeam: { ...team, name },
      },
      variables: { id: team.id, name },
    }).then(() => {
      ref.current?.blur();
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <Box
      align="start"
      border={{ ...border, side: "bottom" }}
      pad={{ bottom: "medium" }}
    >
      <Text color="gray9" margin={{ bottom: "medium" }} size="componentLarge">
        {copy.team}
      </Text>
      <Text color="gray9" margin={{ bottom: "xxsmall" }} size="componentBold">
        {copy.teamName}
      </Text>
      <Box align="center" direction="row" width="full">
        <TextInput
          error={error}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={copy.teamNamePlaceholder}
          ref={ref}
          value={name}
          width="full"
        />
        <Button
          isDisabled={name === team.name || loading}
          label={copy.save}
          margin={{ left: "small" }}
          onClick={handleSave}
          type="primary"
        />
      </Box>
    </Box>
  );
}
