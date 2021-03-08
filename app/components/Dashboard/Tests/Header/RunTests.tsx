import { Box } from "grommet";
import { useContext, useRef, useState } from "react";
import styled from "styled-components";

import { useCreateSuite } from "../../../../hooks/mutations";
import { useEnvironments } from "../../../../hooks/queries";
import { ShortTest } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import {
  borderSize,
  colors,
  transitionDuration,
} from "../../../../theme/theme";
import Button from "../../../shared/AppButton";
import ArrowDown from "../../../shared/icons/ArrowDown";
import Play from "../../../shared/icons/Play";
import { StateContext } from "../../../StateContext";
import EnvironmentsMenu from "./EnvironmentsMenu";

type Props = { tests: ShortTest[] | null };

const dividerId = "run-tests-divider";

const StyledBox = styled(Box)`
  #${dividerId} {
    transition: background ${transitionDuration};
  }

  &:hover {
    #${dividerId} {
      background: ${colors.gray5};
    }
  }

  &:active {
    #${dividerId} {
      background: ${colors.gray7};
    }
  }
`;

export default function RunTests({ tests }: Props): JSX.Element {
  const { environmentId, teamId } = useContext(StateContext);
  const ref = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const [createSuite, { loading }] = useCreateSuite();
  const { data } = useEnvironments({ team_id: teamId }, { environmentId });

  const environments = data?.environments || [];
  const selected = environments.find((e) => e.id === environmentId) || null;

  const handleMenuClick = (): void => setIsOpen((prev) => !prev);
  const handleMenuClose = (): void => setIsOpen(false);

  const test_ids = tests?.map((t) => t.id) || [];

  const handleRunClick = (): void => {
    if (!test_ids.length) return;

    createSuite({
      variables: { environment_id: environmentId, test_ids },
    });
  };

  return (
    <StyledBox direction="row" margin={{ right: "small" }}>
      <Button
        IconComponent={Play}
        a11yTitle="run tests"
        isDisabled={loading || !test_ids.length}
        label={copy.runTests(test_ids.length, selected?.name)}
        noBorderSide={selected ? "right" : undefined}
        onClick={handleRunClick}
        type="secondary"
      />
      {!!selected && (
        <>
          <Box
            background={colors.gray3}
            id={dividerId}
            width={borderSize.xsmall}
          />
          <Box ref={ref}>
            <Button
              a11yTitle="choose environment"
              IconComponent={ArrowDown}
              noBorderSide="left"
              onClick={handleMenuClick}
              type="secondary"
            />
            <EnvironmentsMenu
              environmentId={environmentId}
              environments={environments}
              isOpen={isOpen}
              onClose={handleMenuClose}
              target={ref.current}
              testCount={test_ids.length}
            />
          </Box>
        </>
      )}
    </StyledBox>
  );
}
