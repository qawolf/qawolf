import { Box } from "grommet";
import Image from "next/image";

import {
  getUserId,
  headerProps,
} from "../../../components/Guides/CreateATest/helpers";
import { textProps } from "../../../components/Guides/CreateATest/helpers";
import Layout from "../../../components/Guides/CreateATest/Layout";
import NextButton from "../../../components/Guides/CreateATest/NextButton";
import Section from "../../../components/Guides/CreateATest/Section";
import Text from "../../../components/shared/Text";
import { useWolf } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";

const step = 2;

export default function CreateATest2(): JSX.Element {
  const userId = getUserId();

  const { data } = useWolf({ user_id: userId });
  const wolf = data?.wolf || null;

  return (
    <Layout>
      <Box
        {...headerProps}
        align="center"
        background="primary1"
        pad={{ vertical: "xxlarge" }}
      >
        <Image
          alt="get code from actions"
          height="161"
          src="/guides/get-code.png"
          width="480"
        />
      </Box>
      <Section label={copy.getCode} step={step}>
        {!!wolf && (
          <Text {...textProps} margin={{ bottom: "xxsmall" }}>
            {copy.getCode2(wolf.name)}
          </Text>
        )}
        <Text {...textProps}>{copy.getCode3}</Text>
        <Text {...textProps} margin={{ top: "xxsmall" }}>
          <b>{copy.getCode4}</b> {copy.getCode5}
        </Text>
        <NextButton step={step} />
      </Section>
    </Layout>
  );
}
