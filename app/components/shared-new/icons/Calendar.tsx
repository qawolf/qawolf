import { Blank, IconProps } from "grommet-icons";

export default function Calendar(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 6H2V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V6ZM1 6V3C1 1.89543 1.89543 1 3 1H13C14.1046 1 15 1.89543 15 3V6V13C15 14.1046 14.1046 15 13 15H3C1.89543 15 1 14.1046 1 13V6Z"
        fill={props.color}
      />
    </Blank>
  );
}
