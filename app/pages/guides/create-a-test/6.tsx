import { Box } from "grommet";
import Image from "next/image";

import {
  headerProps,
  textProps,
} from "../../../components/Guides/CreateATest/helpers";
import Layout from "../../../components/Guides/CreateATest/Layout";
import NextButton from "../../../components/Guides/CreateATest/NextButton";
import Section from "../../../components/Guides/CreateATest/Section";
import Text from "../../../components/shared/Text";
import { copy } from "../../../theme/copy";

const step = 6;

export default function CreateATest6(): JSX.Element {
  return (
    <Layout>
      <Box {...headerProps} background="lightBlue">
        <Image
          alt="run selected code"
          height="144"
          src="/guides/run-selected-code.png"
          width="480"
        />
      </Box>
      <Section label={copy.runSelectedCode} step={step}>
        <Text {...textProps} margin={{ bottom: "small" }}>
          {copy.runSelectedCode2}
        </Text>
        <Text {...textProps}>
          <b>{copy.runSelectedCode3}</b> {copy.runSelectedCode4}
        </Text>
        <NextButton step={step} />
      </Section>
    </Layout>
  );
}
