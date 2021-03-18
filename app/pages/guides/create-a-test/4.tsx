import { Box } from "grommet";
import Image from "next/image";
import { useState } from "react";

import ClickButton from "../../../components/Guides/CreateATest/ClickButton";
import { headerProps } from "../../../components/Guides/CreateATest/helpers";
import { textProps } from "../../../components/Guides/CreateATest/helpers";
import Layout from "../../../components/Guides/CreateATest/Layout";
import NextButton from "../../../components/Guides/CreateATest/NextButton";
import Section from "../../../components/Guides/CreateATest/Section";
import Text from "../../../components/shared/Text";
import { copy } from "../../../theme/copy";

const step = 4;

export default function CreateATest4(): JSX.Element {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (): void => setIsClicked(true);

  return (
    <Layout>
      <Box
        {...headerProps}
        align="center"
        background="lightGreen"
        pad={{ vertical: "xxlarge" }}
      >
        <Image
          alt="toggle code off"
          height="48"
          src="/guides/create-code-off.png"
          width="178"
        />
      </Box>
      <Section label={copy.toggleCreateCode} step={step}>
        {!isClicked && (
          <Text {...textProps}>
            <b>{copy.toggleCreateCode2}</b> {copy.toggleCreateCode3}
          </Text>
        )}
        {isClicked && (
          <>
            <Text {...textProps} margin={{ bottom: "small" }}>
              {copy.toggleCreateCode4}
            </Text>
            <Text {...textProps}>
              <b>{copy.toggleCreateCode5}</b> {copy.toggleCreateCode6}
            </Text>
          </>
        )}
        <Box
          align="center"
          direction="row"
          justify="between"
          margin={{ top: "xlarge" }}
        >
          <ClickButton onClick={handleClick} />
          <NextButton isDisabled={!isClicked} noMargin step={step} />
        </Box>
      </Section>
    </Layout>
  );
}
