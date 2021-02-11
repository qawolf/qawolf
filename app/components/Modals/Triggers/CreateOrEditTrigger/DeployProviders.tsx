import { Box } from "grommet";
import { SiNetlify, SiZeit } from "react-icons/si";

import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme-new";
import Button from "../../../shared-new/AppButton";
import Text from "../../../shared-new/Text";
import { labelTextProps } from "../helpers";

export type Provider = "netlify" | "vercel";

type Props = {
  provider: Provider;
  setProvider: (provider: Provider) => void;
};

const buttonProps = {
  justify: "center" as const,
  type: "secondary" as const,
  width: `calc(50% - ${edgeSize.xxxsmall})`,
};

export default function DeployProvider({
  provider,
  setProvider,
}: Props): JSX.Element {
  return (
    <>
      <Text {...labelTextProps}>{copy.deployService}</Text>
      <Box direction="row" justify="between">
        <Button
          {...buttonProps}
          IconComponent={SiZeit}
          isSelected={provider === "vercel"}
          label={copy.vercel}
          onClick={() => setProvider("vercel")}
        />
        <Button
          {...buttonProps}
          IconComponent={SiNetlify}
          isSelected={provider === "netlify"}
          label={copy.netlify}
          onClick={() => setProvider("netlify")}
        />
      </Box>
    </>
  );
}
