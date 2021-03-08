import { Blank, IconProps } from "grommet-icons";

export default function List(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <rect
        x="0.5"
        y="0.5"
        width="15"
        height="15"
        rx="3.5"
        stroke={props.color}
      />
      <rect x="4" y="5" width="8" height="1" fill={props.color} />
      <rect x="4" y="8" width="8" height="1" fill={props.color} />
    </Blank>
  );
}
