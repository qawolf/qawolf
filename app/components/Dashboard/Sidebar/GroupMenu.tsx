import { FaRegTrashAlt } from "react-icons/fa";

import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import Dropdown from "../../shared/Dropdown";
import Option from "../../shared/Dropdown/Option";

type Props = {
  closeMenu: () => void;
  groupId: string;
  groupName: string;
};

export default function GroupMenu({
  closeMenu,
  groupId,
  groupName,
}: Props): JSX.Element {
  const handleClick = () => {
    closeMenu();

    state.setModal({
      group: { id: groupId, name: groupName },
      name: "deleteGroup",
    });
  };

  return (
    <Dropdown>
      <Option
        IconComponent={FaRegTrashAlt}
        isSelected={false}
        message={copy.deleteGroup}
        onClick={handleClick}
      />
    </Dropdown>
  );
}
