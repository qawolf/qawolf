import React from "react";
import ReactQuill from "react-quill";

class Quill extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: "" }; // You can also pass a Quill Delta here
  }

  handleChange = value => {
    this.setState({ text: value });
  };

  render() {
    return (
      <div className="container">
        <h3>
          <a href="https://github.com/zenoamaro/react-quill#quick-start">
            Quill
          </a>
        </h3>
        <ReactQuill value={this.state.text} onChange={this.handleChange} />
      </div>
    );
  }
}
export default Quill;
