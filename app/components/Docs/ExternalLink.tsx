type Props = {
  children: string;
  href: string;
};

export default function ExternalLink(props: Props): JSX.Element {
  return (
    <a href={props.href} target="_blank">
      {props.children}
    </a>
  );
}
