import Head from "next/head";

import Text from "../shared/Text";

type Props = { children: string };

export default function Header({ children }: Props): JSX.Element {
  return (
    <>
      <Head>
        <title>{children}</title>
      </Head>
      <Text
        color="textDark"
        margin={{ top: "xlarge" }}
        size="large"
        textAs="h1"
        weight="bold"
      >
        {children}
      </Text>
    </>
  );
}
