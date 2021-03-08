import Logo from "../../../shared/Logo";
import Wrapper from "../../../shared/Navigation/Wrapper";
import Buttons from "./Buttons";
import SelectDoc from "./SelectDoc";

export default function Navigation(): JSX.Element {
  return (
    <Wrapper>
      <Logo textColor="textDark" />
      <Buttons />
      <SelectDoc />
    </Wrapper>
  );
}
