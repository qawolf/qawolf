import { Blank, IconProps } from "grommet-icons";

export default function Select(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        d="M2 2H13V6H14V2C14 1.44775 13.5522 1 13 1H2C1.44775 1 1 1.44775 1 2V13C1 13.5522 1.44775 14 2 14H6V13H2V2Z"
        fill={props.color}
      />
      <path
        d="M15 9L7 7L9 15L11.2054 11.9125L14.1465 14.8536L14.8536 14.1465L11.9125 11.2054L15 9Z"
        fill={props.color}
      />
    </Blank>
  );
}
