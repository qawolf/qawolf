import { Box } from "grommet";
import { useContext, useRef, useState } from "react";
import { VscFilter } from "react-icons/vsc";

import { useTags } from "../../../../hooks/queries";
import { copy } from "../../../../theme/copy";
import Button from "../../../shared/AppButton";
import { StateContext } from "../../../StateContext";
import TagsMenu from "./TagsMenu";

type Props = { tagIds: string[] };

// TODO: delete SelectTrigger
export default function SelectTags({ tagIds }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useTags({ team_id: teamId });
  const tags = data?.tags || null;

  const handleClick = (): void => setIsOpen((prev) => !prev);
  const handleClose = (): void => setIsOpen(false);

  return (
    <Box flex={false} ref={ref}>
      <Button
        IconComponent={VscFilter}
        iconPosition="right"
        label={copy.filter}
        onClick={handleClick}
        type="secondary"
      />
      <TagsMenu
        isOpen={isOpen}
        onClose={handleClose}
        tagIds={tagIds}
        tags={tags}
        target={ref.current}
      />
    </Box>
  );
}
