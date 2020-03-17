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
        <div data-qa="quill">
          <ReactQuill onChange={this.handleChange} value={this.state.text} />
        </div>
      </div>
    );
  }
}
export default Quill;
