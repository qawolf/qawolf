import { copy } from "../../theme/copy";

type Props = {
  description?: string;
  imageUrl?: string;
  title?: string;
};

const defaultDescription = copy.tagline;
const defaultImageUrl =
  "https://qawolf-public.s3.us-east-2.amazonaws.com/logo-small.png";
const defaultTitle = "QA Wolf";

export default function Meta({
  description,
  imageUrl,
  title,
}: Props): JSX.Element {
  const metaHtml: JSX.Element[] = [
    <meta
      key="description"
      name="description"
      content={description || defaultDescription}
    />,
  ];

  ["og", "twitter"].forEach((platform) => {
    metaHtml.push(
      <meta
        content={description || defaultDescription}
        key={`${platform}:description`}
        name={`${platform}:description`}
      />
    );
    metaHtml.push(
      <meta
        content={imageUrl || defaultImageUrl}
        key={`${platform}:image`}
        name={`${platform}:image`}
      />
    );
    metaHtml.push(
      <meta
        content={title || defaultTitle}
        key={`${platform}:title`}
        name={`${platform}:title`}
      />
    );
  });

  return <>{metaHtml}</>;
}
