import { Blank, IconProps } from "grommet-icons";

export default function ArrowDown(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        d="M2.34448 5.50444L3.01099 4.83765L7.99997 9.82878L12.989 4.83765L13.6555 5.50444L7.99997 11.1624L2.34448 5.50444Z"
        fill={props.color}
      />
    </Blank>
  );
}
