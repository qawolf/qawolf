import {
  getUserId,
  textProps,
} from "../../../components/Guides/CreateATest/helpers";
import Layout from "../../../components/Guides/CreateATest/Layout";
import Section from "../../../components/Guides/CreateATest/Section";
import Wolf from "../../../components/Guides/CreateATest/Wolf";
import Text from "../../../components/shared/Text";
import { useWolf } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";

export default function CreateATest7(): JSX.Element {
  const userId = getUserId();

  const { data } = useWolf({ user_id: userId });
  const wolf = data?.wolf || null;

  const wolfNameHtml = wolf ? <b>{wolf.name}</b> : null;

  return (
    <Layout>
      <Wolf background="lightPink" color={wolf?.variant} />
      <Section label={copy.learnedBasics}>
        <Text {...textProps} margin={{ bottom: "small" }}>
          {copy.learnedBasics2} {wolfNameHtml} {copy.learnedBasics3}
        </Text>
        <Text {...textProps}>{copy.learnedBasics4}</Text>
      </Section>
    </Layout>
  );
}
