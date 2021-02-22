import { Box } from "grommet";
import Link from "next/link";
import { useRef, useState } from "react";
import styled from "styled-components";

import { routes } from "../../../../../lib/routes";
import { RunStatus, TestSummaryRun } from "../../../../../lib/types";
import {
  colors,
  edgeSize,
  transitionDuration,
} from "../../../../../theme/theme-new";
import Tooltip from "../../../../shared-new/Tooltip";
import { getLabelForRun } from "../../../helpers";
import { boxProps } from "./RunBarEmpty";

type Props = {
  className?: string;
  run: TestSummaryRun;
};

const activeBackground: { [status in RunStatus]: string } = {
  created: colors.gray4,
  fail: colors.danger7,
  pass: colors.success7,
};

const background: { [status in RunStatus]: string } = {
  created: colors.gray4,
  fail: colors.danger5,
  pass: colors.success5,
};

const hoverBackground: { [status in RunStatus]: string } = {
  created: colors.gray4,
  fail: colors.danger6,
  pass: colors.success6,
};

function RunBar({ className, run }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isHover, setIsHover] = useState(false);

  const label = getLabelForRun(run);

  return (
    <>
      <Tooltip isVisible={isHover} label={label} target={ref.current} />
      <Link href={`${routes.run}/${run.id}`}>
        <a className={className}>
          <Box
            {...boxProps}
            ref={ref}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          />
        </a>
      </Link>
    </>
  );
}

const StyledRunBar = styled(RunBar)`
  background: ${(props) => background[props.run.status]};
  border-radius: ${edgeSize.xlarge};
  transition: background ${transitionDuration};

  &:hover {
    background: ${(props) => hoverBackground[props.run.status]};
  }

  &:active {
    background: ${(props) => activeBackground[props.run.status]};
  }
`;

export default StyledRunBar;
