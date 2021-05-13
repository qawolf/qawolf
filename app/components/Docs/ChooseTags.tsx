import Image from "./Image";

export default function ChooseTags(): JSX.Element {
  return (
    <>
      <p>
        You can choose to run all your tests on a schedule, or only tests with
        specific tags.
      </p>
      <Image
        alt="Choose tags"
        height={126}
        src="/docs/run-tests-on-a-schedule/choose-tags.png"
        width={488}
      />
    </>
  );
}
