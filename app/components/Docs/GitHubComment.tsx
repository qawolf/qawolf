import Image from "./Image";

export default function GitHubComment(): JSX.Element {
  return (
    <>
      <p>
        QA Wolf will also comment on a pull request with the most recent test
        suite. As your tests run, the comment is updated to report the latest
        results.
      </p>

      <Image
        alt="GitHub pull request comment"
        height={179}
        src="/docs/run-tests-on-netlify-deployment/pull-request-comment.png"
        width={800}
      />
    </>
  );
}
