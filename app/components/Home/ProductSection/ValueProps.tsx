import { Box } from "grommet";
import styled from "styled-components";

import { ValueProp } from "../../../lib/types";
import { breakpoints, edgeSize } from "../../../theme/theme-new";
import Button from "../../shared-new/Button";
import DetailText from "../DetailText";

type Props = {
  className?: string;
  href: string;
  isSecondary?: boolean;
  label: string;
  valueProps: ValueProp[];
};

function ValueProps({
  className,
  href,
  isSecondary,
  label,
  valueProps,
}: Props): JSX.Element {
  const valuePropsHtml = valueProps.map((props, i) => {
    return <DetailText bottomMargin key={i} {...props} />;
  });

  const buttonType = isSecondary ? "outlineDark" : "primary";

  return (
    <Box className={className} flex={false}>
      <Box align="start" pad={{ bottom: "xxsmall" }} width="full">
        {valuePropsHtml}
      </Box>
      <Button href={href} label={label} size="medium" type={buttonType} />
    </Box>
  );
}

const StyledValueProps = styled(ValueProps)`
  align-items: center;
  padding-top: ${edgeSize.xlarge};
  width: 100%;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    align-items: start;
    margin-right: ${edgeSize.xlarge};
    padding-top: 0;
    width: calc((100% - 2 * ${edgeSize.xlarge}) / 3);
    ${(props) =>
      props.isSecondary &&
      `
    margin-right: 0;
    margin-left: ${edgeSize.xlarge};
    `}
  }
`;

export default StyledValueProps;
