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
import { edgeSize } from "../../../theme/theme";

const step = 5;

export default function CreateATest5(): JSX.Element {
  return (
    <Layout>
      <Box {...headerProps} background="peach">
        <Image
          alt="choose element"
          height="48"
          src="/guides/choose-element.png"
          width="480"
        />
        <Box height={edgeSize.medium} />
        <Image
          alt="add snippet"
          height="232"
          src="/guides/add-snippet.png"
          width="480"
        />
      </Box>
      <Section label={copy.addSnippetIntro} step={step}>
        <Text {...textProps}>{copy.addSnippetIntro2}</Text>
        <Text {...textProps} margin={{ vertical: "small" }}>
          <b>{copy.addSnippetIntro3}</b>
        </Text>
        <Text {...textProps}>{copy.addSnippetIntro4}</Text>
        <NextButton step={step} />
      </Section>
    </Layout>
  );
}
