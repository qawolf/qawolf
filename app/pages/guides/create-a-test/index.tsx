import { Box } from "grommet";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";

import { textProps } from "../../../components/Guides/CreateATest/helpers";
import Layout from "../../../components/Guides/CreateATest/Layout";
import Section from "../../../components/Guides/CreateATest/Section";
import Wolf from "../../../components/Guides/CreateATest/Wolf";
import Button from "../../../components/shared/AppButton";
import TextInput from "../../../components/shared/AppTextInput";
import Text from "../../../components/shared/Text";
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
  const wolf = data?.wolf || null;

  useEffect(() => {
    localStorage.setItem("userId", userId);
  }, [userId]);

  useEffect(() => {
    if (!userId || error) replace(routes.notFound);
  }, [error, replace, userId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleClick = (): void => {
    const route = `${routes.guides}/create-a-test/2`;

    if (name && name !== wolf.name) {
      updateWolf({ variables: { name, user_id: userId } }).then(() => {
        push(route);
      });
    } else push(route);
  };

  return (
    <Layout>
      <Wolf color={wolf?.variant} />
      <Section
        label={copy.wolfIntro}
        // ignore error text in bottom padding
        pad={{ bottom: "xxsmall", horizontal: "xlarge", top: "xlarge" }}
      >
        <Text {...textProps} margin={{ bottom: "xsmall" }}>
          {copy.wolfIntro2}
        </Text>
        <Text {...textProps}>{copy.wolfIntro3}</Text>
        <Box align="center" direction="row" margin={{ top: "xlarge" }}>
          <TextInput
            id="wolf-name"
            isLarge
            maxLength={maxLength}
            onChange={handleChange}
            placeholder={wolf?.name || copy.loading}
            value={name}
            width="full"
          />
          <Box flex={false} margin={{ left: "small" }}>
            <Button
              isDisabled={loading || !wolf}
              isLarge
              label={copy.nameWolf}
              onClick={handleClick}
              type="primary"
            />
          </Box>
        </Box>
        <Text
          color="error"
          margin={{ top: "xxsmall" }}
          size="componentParagraphLarge"
          style={{ opacity: name.length === maxLength ? "1" : "0", transition }}
        >
          {copy.nameWolfMaxLength}
        </Text>
      </Section>
    </Layout>
  );
}
