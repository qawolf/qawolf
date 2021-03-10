import { Box } from "grommet";
import { ChangeEvent, useState } from "react";
import WolfSitting from "../../shared/icons/WolfSitting";

import Button from "../../shared/Button";
import Text from "../../shared/Text";
import TextInput from "../../shared/TextInput";
import { copy } from "../../../theme/copy";
import styled from "styled-components";

const textProps = {
  color: "gray9",
  size: "medium" as const,
  weight: "normal" as const,
};

const StyledBox = styled(Box)``;

export default function Intro1(): JSX.Element {
  const [name, setName] = useState("Spirit");

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  return (
    <Box align="center" height="100vh" justify="center">
      <Box align="center" width="50%">
        <Text {...textProps} margin={{ bottom: "medium" }}>
          {copy.wolfIntro}
        </Text>
        <StyledBox>
          <WolfSitting color="husky" />
        </StyledBox>
        <Text {...textProps} margin={{ top: "medium" }}>
          {copy.wolfIntro2}
        </Text>
        <Box
          align="center"
          direction="row"
          margin={{ top: "medium" }}
          width="full"
        >
          <TextInput
            maxLength={14}
            onChange={handleChange}
            placeholder="Spirit"
            value={name}
          />
          <Box flex={false} margin={{ left: "small" }}>
            <Button label={copy.nameWolf} size="medium" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
