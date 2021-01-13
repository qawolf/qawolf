import { Box } from "grommet";
import { FastForward } from "grommet-icons";
import { useRouter } from "next/router";
import React, { useContext } from "react";

import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import PlayButton from "../../shared/PlayButton";
import { TestContext } from "../contexts/TestContext";
import RunButton from "./RunButton";
import ShareButton from "./ShareButton";

type Props = {
  isMobile: boolean;
};

export default function Buttons({ isMobile }: Props): JSX.Element {
  const { hasWriteAccess, isLatestCode, test } = useContext(TestContext);
  const { push } = useRouter();

  if (!test) return null;

  const showRun = isLatestCode && hasWriteAccess && !isMobile;

  const handleViewLatestClick = () => push(`${routes.test}/${test.id}`);

  return (
    <Box direction="row" justify="end">
      <ShareButton isMobile={isMobile} />
      {showRun && <RunButton />}
      {!isLatestCode && (
        <PlayButton
          IconComponent={FastForward}
          message={copy.viewLatest}
          onClick={handleViewLatestClick}
        />
      )}
    </Box>
  );
}
