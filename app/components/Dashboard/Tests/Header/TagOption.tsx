import { Tag } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import TagCheckBox from "../../../shared/TagCheckBox";
import Option from "./Option";

type Props = {
  isChecked: boolean;
  onClick: () => void;
  tag?: Tag;
};

export default function TagOption({
  isChecked,
  onClick,
  tag,
}: Props): JSX.Element {
  return (
    <Option a11yTitle={`filter ${tag?.name || copy.noTags}`} onClick={onClick}>
      <TagCheckBox
        pad={{ horizontal: "xsmall", vertical: "xxsmall" }}
        selectState={isChecked ? "all" : "none"}
        tag={tag}
        width="full"
      />
    </Option>
  );
}
