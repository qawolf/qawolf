import { Box, Keyboard } from "grommet";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";

import { textProps } from "../../../components/Guides/CreateATest/helpers";
import Layout from "../../../components/Guides/CreateATest/Layout";
import Wolf from "../../../components/Guides/CreateATest/Wolf";
import Button from "../../../components/shared/Button";
import Text from "../../../components/shared/Text";
import TextInput from "../../../components/shared/TextInput";
import { useUpdateWolf } from "../../../hooks/mutations";
import { useWolf } from "../../../hooks/queries";
import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import { transition } from "../../../theme/theme";

const maxLength = 12;

export default function CreateATest1(): JSX.Element {
  const { asPath, push, replace } = useRouter();
  // use asPath since query not hydrated immediately
  const userId = asPath.split("user_id=")[1] || "";

  const [name, setName] = useState("");

  const [updateWolf, { loading }] = useUpdateWolf();

  const { data, error } = useWolf({ user_id: userId });
  const wolfName = data?.wolf?.name || null;

  useEffect(() => {
    if (!userId || error) replace(routes.notFound);
  }, [error, replace, userId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleClick = (): void => {
    const route = `${routes.guides}/create-a-test/2`;
    const defaultRoute = `${route}?wolf=${wolfName}`;

    if (name && name !== wolfName) {
      updateWolf({ variables: { name, user_id: userId } }).then((response) => {
        const { data } = response || {};

        if (data?.updateWolf) {
          push(`${route}?wolf=${data.updateWolf.name}`);
        } else push(defaultRoute);
      });
    } else push(defaultRoute);
  };

  return (
    <Layout>
      <Text {...textProps}>{copy.wolfIntro}</Text>
      <Text {...textProps} margin={{ bottom: "medium" }}>
        {copy.wolfIntro2}
      </Text>
      <Wolf color="blue" />
      <Text {...textProps} margin={{ top: "medium" }} textAlign="start">
        {copy.wolfIntro3}
      </Text>
      <Keyboard onEnter={handleClick}>
        <Box align="center" direction="row" margin={{ top: "medium" }}>
          <TextInput
            id="wolf-name"
            maxLength={maxLength}
            onChange={handleChange}
            placeholder={wolfName || copy.loading}
            value={name}
          />
          <Box flex={false} margin={{ left: "small" }}>
            <Button
              disabled={loading || !wolfName}
              label={copy.nameWolf}
              onClick={handleClick}
              size="medium"
            />
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
