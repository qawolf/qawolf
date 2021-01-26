import { Blank, IconProps } from "grommet-icons";

export default function Check(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path d="M3.5 8L6.5 11L12.5 5" stroke={props.color} stroke-width="1.5" />
    </Blank>
  );
}
