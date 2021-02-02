import { Box, Drop } from "grommet";
import { useRef, useState } from "react";

import { UserSubscription } from "../../../lib/types";
import Avatar from "../../shared/Avatar";
import Text from "../../shared/Text";

type Props = {
  extraWolfNames?: string[];
  user?: UserSubscription;
};

const textProps = { color: "white", size: "small" };

export default function Collaborator({
  extraWolfNames,
  user,
}: Props): JSX.Element {
  const [showDetail, setshowDetail] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  if (!extraWolfNames?.length && !user) return null;

  const avatarHtml = user ? (
    <Avatar wolfVariant={user.wolfVariant} />
  ) : (
    <Text color="black" size="large">{`+${
      (extraWolfNames || []).length
    }`}</Text>
  );

  const textHtml = user ? (
    <Text {...textProps}>{user.wolfName}</Text>
  ) : (
    (extraWolfNames || []).map((wolfName, i) => {
      return (
        <Text key={i} {...textProps}>
          {wolfName}
        </Text>
      );
    })
  );

  return (
    <Box
      margin={{ left: "small" }}
      onMouseEnter={() => setshowDetail(true)}
      onMouseLeave={() => setshowDetail(false)}
      ref={ref}
    >
      {avatarHtml}
      {showDetail && (
        <Drop align={{ top: "bottom" }} plain target={ref.current}>
          <Box background="black" pad={{ horizontal: "small" }} round="xsmall">
            {textHtml}
          </Box>
        </Drop>
      )}
    </Box>
  );
}
