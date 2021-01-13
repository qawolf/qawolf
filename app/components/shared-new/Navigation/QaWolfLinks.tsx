import Link from "next/link";

import { routes } from "../../../lib/routes";
import { NavigationType } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { edgeSize } from "../../../theme/theme-new";
import Text from "../Text";

type Props = {
  noMargin?: boolean;
  type: NavigationType;
};

const baseLinkProps = {
  hover: true,
  size: "xxsmall" as const,
  style: { padding: `${edgeSize.xxxsmall} 0` },
  weight: "medium" as const,
};

export default function QaWolfLinks({ noMargin, type }: Props): JSX.Element {
  const anchorStyle = noMargin ? undefined : { marginLeft: edgeSize.xlarge };
  const linkProps = {
    ...baseLinkProps,
    color: type === "dark" ? "textDark" : "white",
  };

  return (
    <>
      <Link href={routes.pricing}>
        <a style={anchorStyle}>
          <Text {...linkProps}>{copy.pricing}</Text>
        </a>
      </Link>
      <Link href={routes.docs}>
        <a style={anchorStyle}>
          <Text {...linkProps}>{copy.docs}</Text>
        </a>
      </Link>
      <Link href={routes.blog}>
        <a style={anchorStyle}>
          <Text {...linkProps}>{copy.blog}</Text>
        </a>
      </Link>
    </>
  );
}
