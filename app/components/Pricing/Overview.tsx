import { copy } from "../../theme/copy";
import Section from "../shared/Section";
import Text from "../shared/Text";
import ValueProps from "./ValueProps";

export default function Overview(): JSX.Element {
  return (
    <Section background="fill0">
      <Text
        color="textDark"
        margin={{ bottom: "small" }}
        size="xlarge"
        textAlign="center"
        weight="bold"
      >
        {copy.startTestingFree}
      </Text>
      <Text color="textLight" size="medium" textAlign="center" weight="normal">
        {copy.startTestingFreeDetail}
      </Text>
      <ValueProps />
    </Section>
  );
}
