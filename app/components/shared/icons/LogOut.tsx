import { Blank, IconProps } from "grommet-icons";

export default function LogOut(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        d="M10 15H4C3.73488 14.9997 3.4807 14.8942 3.29323 14.7068C3.10576 14.5193 3.0003 14.2651 3 14V2C3.0003 1.73488 3.10576 1.4807 3.29323 1.29323C3.4807 1.10576 3.73488 1.0003 4 1H10C10.2651 1.0003 10.5193 1.10576 10.7068 1.29323C10.8942 1.4807 10.9997 1.73488 11 2V4H10V2H4V14H10V12H11V14C10.9997 14.2651 10.8942 14.5193 10.7068 14.7068C10.5193 14.8942 10.2651 14.9997 10 15Z"
        fill={props.color}
      />
      <path
        d="M13.086 8.5L11.293 10.293L12 11L15 8L12 5L11.293 5.707L13.086 7.5H6V8.5H13.086Z"
        fill={props.color}
      />
    </Blank>
  );
}
