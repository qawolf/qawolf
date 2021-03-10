import { Box, Keyboard } from "grommet";
import { useRouter } from "next/router";
import { ChangeEvent, useState } from "react";

import { textProps } from "../../../components/Playground/Intro/helpers";
import Layout from "../../../components/Playground/Intro/Layout";
import Wolf from "../../../components/Playground/Intro/Wolf";
import Button from "../../../components/shared/Button";
import Text from "../../../components/shared/Text";
import TextInput from "../../../components/shared/TextInput";
import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import { transition } from "../../../theme/theme";

const maxLength = 14;

export default function Intro1(): JSX.Element {
  const { push } = useRouter();

  const [name, setName] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleClick = (): void => {
    // TODO: save wolf name if it changed
    push(`${routes.playground}/intro/2`);
  };

  return (
    <Layout>
      <Text {...textProps} margin={{ bottom: "medium" }}>
        {copy.wolfIntro}
      </Text>
      <Wolf color="blue" />
      <Text {...textProps} margin={{ top: "medium" }} textAlign="start">
        {copy.wolfIntro2}
      </Text>
      <Keyboard onEnter={handleClick}>
        <Box align="center" direction="row" margin={{ top: "medium" }}>
          <TextInput
            id="wolf-name"
            maxLength={maxLength}
            onChange={handleChange}
            placeholder="Spirit"
            value={name}
          />
          <Box flex={false} margin={{ left: "small" }}>
            <Button label={copy.nameWolf} onClick={handleClick} size="medium" />
          </Box>
        </Box>
      </Keyboard>
      <Text
        color="error"
        margin={{ top: "xxsmall" }}
        size="xsmall"
        style={{ opacity: name.length === maxLength ? "1" : "0", transition }}
        weight="medium"
      >
        {copy.nameWolfMaxLength}
      </Text>
    </Layout>
  );
}
