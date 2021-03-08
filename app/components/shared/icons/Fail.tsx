type Props = { width?: string };

export default function Fail({ width }: Props): JSX.Element {
  return (
    <svg
      fill="none"
      viewBox="0 0 16 16"
      width={width || "16"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="7" fill="#DB4B4B" />
      <path d="M5.5 10.5L10.5 5.5" stroke="white" stroke-width="1.5" />
      <path d="M5.5 5.5L10.5 10.5" stroke="white" stroke-width="1.5" />
    </svg>
  );
}
