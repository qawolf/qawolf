import { Box } from "grommet";

import { routes } from "../../lib/routes";
import { copy } from "../../theme/copy";
import { edgeSize } from "../../theme/theme-new";
import Button from "../shared/Button";
import ValueProp from "./ValueProp";

const valueProps = [
  copy.createOnline,
  copy.scheduleOneClick,
  copy.debugEasily,
  copy.connectToFailures,
  copy.testAcrossBrowsers,
];

export default function ValueProps(): JSX.Element {
  const valuePropsHtml = valueProps.map((label, i) => {
    return <ValueProp key={i} label={label} />;
  });

  return (
    <Box
      background="white"
      margin={{ top: "xxxlarge" }}
      pad="xxlarge"
      round="xsmall"
    >
      {valuePropsHtml}
      <Button
        href={routes.signUp}
        label={copy.startTesting}
        margin={{ top: `calc(${edgeSize.xlarge} - ${edgeSize.small})` }}
        size="medium"
      />
    </Box>
  );
}
