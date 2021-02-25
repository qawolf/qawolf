type Props = { width?: string };

export default function Pass({ width }: Props): JSX.Element {
  return (
    <svg
      fill="none"
      viewBox="0 0 16 16"
      width={width || "16"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="7" fill="#44C76B" />
      <path d="M5 8L7 10L11 6" stroke="white" stroke-width="1.5" />
    </svg>
  );
}
