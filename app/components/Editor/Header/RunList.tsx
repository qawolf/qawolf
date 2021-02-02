import Menu from "../../shared-new/Menu";

type Props = {
  onClose: () => void;
};

export default function RunList({ onClose }: Props): JSX.Element {
  return (
    <Menu direction="down" onClick={onClose}>
      <h1>hey</h1>
    </Menu>
  );
}
