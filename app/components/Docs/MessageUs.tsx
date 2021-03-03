type Props = { label?: string };

export default function MessageUs({ label }: Props): JSX.Element {
  return <a className="open-intercom">{label || "Message us"}</a>;
}
