import { Blank, IconProps } from "grommet-icons";

export default function Book(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path d="M6.5 5H3V6H6.5V5Z" fill={props.color} />
      <path d="M3 7.5H6.5V8.5H3V7.5Z" fill={props.color} />
      <path d="M6.5 10H3V11H6.5V10Z" fill={props.color} />
      <path d="M13 5H9.5V6H13V5Z" fill={props.color} />
      <path d="M13 7.5H9.5V8.5H13V7.5Z" fill={props.color} />
      <path d="M9.5 10H13V11H9.5V10Z" fill={props.color} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 2.5H14C14.2651 2.50026 14.5193 2.60571 14.7068 2.79319C14.8943 2.98066 14.9997 3.23486 15 3.5V12.5C14.9997 12.7651 14.8943 13.0193 14.7068 13.2068C14.5193 13.3943 14.2651 13.4997 14 13.5H2C1.73486 13.4997 1.48066 13.3943 1.29319 13.2068C1.10571 13.0193 1.00026 12.7651 1 12.5V3.5C1.00026 3.23486 1.10571 2.98066 1.29319 2.79319C1.48066 2.60571 1.73486 2.50026 2 2.5ZM7.5 3.5H2V12.5H7.5V3.5ZM8.5 3.5V12.5H14V3.5H8.5Z"
        fill={props.color}
      />
    </Blank>
  );
}
