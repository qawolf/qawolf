import { Anchor, Box } from "grommet";

import { copy } from "../../../theme/copy";
import Text from "../../shared/Text";

type Props = { wolfName: string | null };

const getTwitterLink = (wolfName: string | null): string => {
  return `https://twitter.com/intent/tweet?text=🐺+Creating%20a%20test%20with%20my%20QA%20Wolf%20${
    wolfName || ""
  }&url=https://qawolf.com`;
};

export default function Instructions({ wolfName }: Props): JSX.Element {
  const href = getTwitterLink(wolfName);

  return (
    <Box align="center" margin={{ top: "medium" }}>
      <Text color="white" size="small" weight="bold">
        {copy.enterUrl}{" "}
        <Anchor a11yTitle="Share on Twitter" href={href} target="_">{`@${
          wolfName || "your QA Wolf"
        }`}</Anchor>
      </Text>
    </Box>
  );
}
