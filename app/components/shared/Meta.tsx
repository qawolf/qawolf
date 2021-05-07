import { copy } from "../../theme/copy";

type Props = {
  description?: string;
  imageUrl?: string;
  title?: string;
};

const defaultDescription = copy.tagline;
const defaultImageUrl =
  "https://qawolf-public.s3.us-east-2.amazonaws.com/logo.png";
const defaultTitle = "QA Wolf";

export default function Meta({
  description,
  imageUrl,
  title,
}: Props): JSX.Element {
  const metaHtml: JSX.Element[] = [
    <meta
      content={description || defaultDescription}
      key="description"
      name="description"
    />,
    <meta content="website" key="type" property="og:type" />,
  ];

  ["og", "twitter"].forEach((platform) => {
    metaHtml.push(
      <meta
        content={description || defaultDescription}
        key={`${platform}:description`}
        property={`${platform}:description`}
      />
    );
    metaHtml.push(
      <meta
        content={imageUrl || defaultImageUrl}
        key={`${platform}:image`}
        property={`${platform}:image`}
      />
    );
    metaHtml.push(
      <meta
        content={title || defaultTitle}
        key={`${platform}:title`}
        property={`${platform}:title`}
      />
    );
  });

  return <>{metaHtml}</>;
}
