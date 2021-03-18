import { Box } from "grommet";
import Image from "next/image";

import { headerProps } from "../../../components/Guides/CreateATest/helpers";
import { textProps } from "../../../components/Guides/CreateATest/helpers";
import Layout from "../../../components/Guides/CreateATest/Layout";
import NextButton from "../../../components/Guides/CreateATest/NextButton";
import Section from "../../../components/Guides/CreateATest/Section";
import Text from "../../../components/shared/Text";
import { copy } from "../../../theme/copy";

const step = 3;

export default function CreateATest3(): JSX.Element {
  return (
    <Layout>
      <Box
        {...headerProps}
        align="center"
        background="lightYellow"
        pad={{ vertical: "xxlarge" }}
      >
        <Image
          alt="run test"
          height="80"
          src="/guides/run-test.png"
          width="480"
        />
      </Box>
      <Section label={copy.runTestIntro} step={step}>
        <Text {...textProps}>
          <b>{copy.runTestIntro2}</b> {copy.runTestIntro3}
        </Text>
        <NextButton step={step} />
      </Section>
    </Layout>
  );
}
