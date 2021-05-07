import { Tag } from "../../../../lib/types";

type Props = {
  isChecked: boolean;
  onClick: () => void;
  tag: Tag;
};

export default function TagOption({
  isChecked,
  onClick,
  tag,
}: Props): JSX.Element {
  return <h1>{tag.name}</h1>;
}
