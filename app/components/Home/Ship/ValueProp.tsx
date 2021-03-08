import { Box } from "grommet";
import { FC } from "react";
import styled from "styled-components";

import { ValueProp as ValuePropType } from "../../../lib/types";
import { breakpoints, edgeSize } from "../../../theme/theme";
import DetailText from "../DetailText";

type Props = ValuePropType & {
  IconComponent: FC;
};

const StyledBox = styled(Box)`
  margin-bottom: ${edgeSize.xlarge};

  @media screen and (min-width: ${breakpoints.small.value}px) {
    margin-bottom: 0;
    width: calc((100% - 2 * ${edgeSize.xlarge}) / 3);
  }
`;

export default function ValueProp({
  IconComponent,
  detail,
  message,
}: Props): JSX.Element {
  return (
    <StyledBox align="center">
      <IconComponent />
      <DetailText
        detail={detail}
        message={message}
        textAlign="center"
        topMargin
      />
    </StyledBox>
  );
}
