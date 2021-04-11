import { Box } from "grommet";
import styled from "styled-components";

import BlogLink from "../../components/Blog/BlogLink";
import Layout from "../../components/Blog/Layout";
import { edgeSize, width } from "../../theme/theme";

const posts = [
  {
    date: "January 13, 2021",
    imageUrl:
      "https://qawolf-public.s3.us-east-2.amazonaws.com/blog/why-we-open-sourced-everything/index.png",
    title: "Why We Open Sourced Everything",
  },
  {
    date: "April 1, 2021",
    imageUrl:
      "https://qawolf-public.s3.us-east-2.amazonaws.com/blog/q-1-newsletter/wolf-q1.jpg",
    title: "Q1 Newsletter",
  },
];

const StyledBox = styled(Box)`
  padding: ${edgeSize.medium} ${edgeSize.medium} 0;

  @media screen and (min-width: ${width.content}) {
    // give extra width to fit two blog tiles with padding
    max-width: calc(${width.content} + ${edgeSize.xlarge});
    // TODO: remove once we have more than one post
    min-width: ${width.content};
    padding: 0;
    padding-top: ${edgeSize.large};
  }
`;

export default function Blog(): JSX.Element {
  const titlesHtml = posts.map((props, i) => {
    return <BlogLink key={i} {...props} />;
  });

  return (
    <Layout isJsx>
      <StyledBox
        direction="row"
        fill="horizontal"
        overflow={{ vertical: "auto" }}
        wrap
      >
        {titlesHtml}
      </StyledBox>
    </Layout>
  );
}
