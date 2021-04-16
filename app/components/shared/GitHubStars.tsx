import axios from "axios";
import { Box } from "grommet";
import noop from "lodash/noop";
import { useEffect, useState } from "react";
import { RiStarLine } from "react-icons/ri";
import styled from "styled-components";

import { copy } from "../../theme/copy";
import { borderSize, colors, edgeSize, transition } from "../../theme/theme";
import Text from "./Text";

type Props = {
  className?: string;
  type: "dark" | "light";
};

const boxProps = {
  align: "center" as const,
  direction: "row" as const,
  pad: {
    horizontal: `calc(${edgeSize.xsmall} - ${borderSize.small})`,
  },
};

const formatStarCount = (starCount: number): string => {
  const countInK = Math.round((starCount / 1000) * 10) / 10;

  return `${countInK}k`;
};

const gitHubApiUrl = "https://api.github.com/repos/qawolf/qawolf";
const gitHubHref = "https://github.com/qawolf/qawolf/stargazers";

const textProps = {
  size: "xxsmall" as const,
  weight: "medium" as const,
};

function GitHubStars({ className, type }: Props): JSX.Element {
  const [starCount, setStarCount] = useState(2650);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();

    axios
      .get(gitHubApiUrl, {
        cancelToken: cancelTokenSource.token,
      })
      .then(({ data }) => {
        const count = (data || {}).stargazers_count;
        if (count) {
          setStarCount(count);
        }
      })
      .catch(noop);

    return () => cancelTokenSource.cancel();
  }, []);

  const borderColor = type === "light" ? "primaryFillLight" : "fill30";
  const color = type === "light" ? colors.white : colors.textDark;
  const formattedStarCount = formatStarCount(starCount);

  return (
    <a href={gitHubHref} rel="noopener" target="_blank">
      <Box
        border={{ color: borderColor, size: "small" }}
        className={className}
        direction="row"
        height={edgeSize.large}
        round="xxxsmall"
        style={{ transition }}
      >
        <Box
          {...boxProps}
          border={{ color: borderColor, side: "right", size: "small" }}
          style={{ transition }}
        >
          <RiStarLine
            color={color}
            size={edgeSize.small}
            style={{ transition }}
          />
          <Text {...textProps} color={color} margin={{ left: "xxxsmall" }}>
            {copy.star}
          </Text>
        </Box>
        <Box {...boxProps}>
          <Text {...textProps} color={color}>
            {formattedStarCount}
          </Text>
        </Box>
      </Box>
    </a>
  );
}

const StyledGitHubStars = styled(GitHubStars)`
  &:hover {
    background: ${(props) =>
      props.type === "light" ? colors.primaryFillLight : colors.fill10};

    ${(props) =>
      props.type === "dark" &&
      `
    border-color: ${colors.fill10};

    div {
      border-color: ${colors.fill10};
    }
    `}

    ${(props) =>
      props.type === "light" &&
      `
    p {
      color: ${colors.textDark};
    }

    svg {
      fill: ${colors.textDark};
    }
    `}
  }
`;

export default StyledGitHubStars;
