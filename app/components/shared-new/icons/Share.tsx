import { Blank, IconProps } from "grommet-icons";

export default function Share(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        d="M10 2V1H15V6H14V2.707L9.707 7L9 6.293L13.293 2H10Z"
        fill={props.color}
      />
      <path
        d="M2.29329 13.7067C2.48075 13.8942 2.73489 13.9996 3 14H13C13.2651 13.9996 13.5193 13.8942 13.7067 13.7067C13.8942 13.5193 13.9996 13.2651 14 13V8H13V13H3V3H8V2H3C2.73489 2.00036 2.48075 2.10583 2.29329 2.29329C2.10583 2.48075 2.00036 2.73489 2 3V13C2.00036 13.2651 2.10583 13.5193 2.29329 13.7067Z"
        fill={props.color}
      />
    </Blank>
  );
}
