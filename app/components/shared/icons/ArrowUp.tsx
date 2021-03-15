import { Blank, IconProps } from "grommet-icons";

export default function ArrowUp(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        d="M13.6555 10.4956L12.989 11.1624L7.99997 6.17123L3.01099 11.1624L2.34448 10.4956L7.99997 4.83765L13.6555 10.4956Z"
        fill={props.color}
      />
    </Blank>
  );
}
