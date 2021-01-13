import { Box } from "grommet";
import { RiQuestionFill } from "react-icons/ri";
import { SiNetlify, SiZeit } from "react-icons/si";

import { copy } from "../../../theme/copy";
import { edgeSize } from "../../../theme/theme";
import IconButton from "../../shared/IconButton";
import Text from "../../shared/Text";
import styles from "./Deployment.module.css";

export type PlatformType = "netlify" | "other" | "vercel";

type Props = {
  platform: PlatformType;
  setPlatform: (platform: PlatformType) => void;
};

const buttonProps = {
  borderStyle: "solid" as const,
  className: styles.platform,
  color: "black",
  justify: "center" as const,
  style: { width: `calc(33.3% - (2 / 3 * ${edgeSize.large}))` },
};

export default function Platform({
  platform,
  setPlatform,
}: Props): JSX.Element {
  return (
    <>
      <Text color="black" margin={{ bottom: "medium" }} size="medium">
        {copy.selectPlatform}
      </Text>
      <Box direction="row" justify="between" margin={{ bottom: "large" }}>
        <IconButton
          {...buttonProps}
          IconComponent={SiNetlify}
          background={platform === "netlify" ? "lightBlue" : "transparent"}
          message={copy.netlify}
          onClick={() => setPlatform("netlify")}
        />
        <IconButton
          {...buttonProps}
          IconComponent={SiZeit}
          background={platform === "vercel" ? "lightBlue" : "transparent"}
          message={copy.vercel}
          onClick={() => setPlatform("vercel")}
        />
        <IconButton
          {...buttonProps}
          IconComponent={RiQuestionFill}
          background={platform === "other" ? "lightBlue" : "transparent"}
          message={copy.other}
          onClick={() => setPlatform("other")}
        />
      </Box>
    </>
  );
}
