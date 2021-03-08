import { Blank, IconProps } from "grommet-icons";

export default function Stop(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 3H3L3 13H13V3ZM3 2C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2H3Z"
        fill={props.color}
      />
    </Blank>
  );
}
