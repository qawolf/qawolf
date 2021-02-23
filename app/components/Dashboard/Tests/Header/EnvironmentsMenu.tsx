import { Box, Drop, DropProps } from "grommet";
import { MouseEvent } from "react";

import { useEnvironments } from "../../../../hooks/queries";
import { state } from "../../../../lib/state";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme-new";
import Option from "../../../shared-new/Select/Option";

type Props = {
  environmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  target: DropProps["target"];
  teamId: string | null;
};

const width = "240px";

export default function EnvironmentsMenu({
  environmentId,
  isOpen,
  onClose,
  target,
  teamId,
}: Props): JSX.Element {
  const { data, loading } = useEnvironments(
    { team_id: teamId },
    { environmentId }
  );

  if (!isOpen) return null;

  const handleClick = (environmentId: string): void => {
    state.setEnvironmentId(environmentId);
  };

  const handleClickOutside = (e: MouseEvent<HTMLDocument>) => {
    // ignore clicks on the button
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((target as any).contains(e.target as HTMLButtonElement)) return;
    onClose();
  };

  const optionsHtml = data?.environments.length ? (
    data.environments.map((e) => {
      return (
        <Option
          isSelected={e.id === environmentId}
          key={e.id}
          label={e.name}
          onClick={() => handleClick(e.id)}
        />
      );
    })
  ) : (
    <Option label={loading ? copy.loading : copy.environmentNotSelected} />
  );

  // use drop to avoid hover activating divider
  return (
    <Drop
      align={{ right: "right", top: "bottom" }}
      onClickOutside={handleClickOutside}
      style={{ marginTop: edgeSize.xxxsmall }}
      target={target}
    >
      <Box pad={{ vertical: "xxxsmall" }} width={width}>
        {optionsHtml}
      </Box>
    </Drop>
  );
}
