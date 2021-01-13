import { Box } from "grommet";
import { Code } from "grommet-icons";
import { Component } from "react";

import { colors } from "../../theme/theme";
import { animateAction } from "./animateAction";

type Props = {
  id: string;
  removeAction: (id: string) => void;
  x: number;
  y: number;
};

export default class Action extends Component<Props> {
  componentDidMount(): void {
    animateAction(this.props);
  }

  render(): JSX.Element {
    return (
      <Box
        id={this.props.id}
        style={{
          position: "fixed",
          zIndex: 10,
        }}
        width="0"
      >
        <Box
          align="center"
          background="fadedBlue"
          className="action-code"
          height="full"
          justify="center"
          round="xsmall"
          width="full"
        >
          <Box margin="small">
            <Code fill={colors.white} width="100%" />
          </Box>
        </Box>
      </Box>
    );
  }
}
