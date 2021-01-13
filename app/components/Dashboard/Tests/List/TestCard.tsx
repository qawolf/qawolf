import { Box, CheckBox } from "grommet";
import Link from "next/link";
import { ReactNode } from "react";

import { copy } from "../../../../theme/copy";
import { overflowStyle } from "../../../../theme/theme";
import Text from "../../../shared/Text";
import TestGif from "./TestGif";

type Props = {
  children: ReactNode;
  gifUrl: string | null;
  isChecked: boolean;
  isDeleted?: boolean;
  inProgress: boolean;
  name: string;
  onCheck: () => void;
  route: string;
  wolfVariant: string;
};

const GRAYED_OUT_STYLE = {
  filter: "brightness(88%)",
};

export default function TestCard({
  children,
  gifUrl,
  isChecked,
  isDeleted,
  inProgress,
  name,
  onCheck,
  route,
  wolfVariant,
}: Props): JSX.Element {
  const message = isDeleted ? `${name} ${copy.deleted}` : name;
  const style = isDeleted ? GRAYED_OUT_STYLE : undefined;

  // have extra box for click handler because the box shadow goes away otherwise
  return (
    <Box
      data-test="test-card"
      direction="row"
      flex={false}
      margin={{ bottom: "medium" }}
      width="full"
    >
      <CheckBox
        a11yTitle={`checkbox ${name}`}
        checked={isChecked}
        disabled={isDeleted}
        onClick={onCheck}
      />
      <Box
        background="white"
        elevation="xsmall"
        margin={{ left: "medium" }}
        round="small"
        style={style}
        width="full"
      >
        <Link href={route}>
          <a>
            <Box align="center" direction="row">
              <TestGif
                gifUrl={gifUrl}
                inProgress={inProgress}
                wolfVariant={wolfVariant}
              />
              <Box
                align="center"
                data-test="test-details"
                direction="row"
                fill
                justify="between"
                pad="medium"
                title={message}
              >
                <Text color="black" size="medium" style={overflowStyle}>
                  {message}
                </Text>
                {children}
              </Box>
            </Box>
          </a>
        </Link>
      </Box>
    </Box>
  );
}
