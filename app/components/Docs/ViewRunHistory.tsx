import Image from "./Image";
import SubHeader from "./SubHeader";

type Props = { description: string };

export default function ViewRunHistory({ description }: Props): JSX.Element {
  return (
    <>
      <SubHeader>View Run History</SubHeader>
      <p>{`🎉 Congratulations - now your tests will run ${description} in 100% parallel!`}</p>
      <p>
        You can see your test runs in the "Run history" page of the{" "}
        <a href="https://www.qawolf.com/suites" target="_blank">
          dashboard
        </a>
        .
      </p>
      <Image
        alt="Run history"
        height={292}
        src="/docs/run-tests-on-a-schedule/history.png"
        width={277}
      />
    </>
  );
}
