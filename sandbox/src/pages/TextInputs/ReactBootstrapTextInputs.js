import React from "react";
import Form from "react-bootstrap/Form";
import "bootstrap/dist/css/bootstrap.min.css";

function ReactBootstrapTextInputs() {
  return (
    <div className="container">
      <h3>
        <a href="https://github.com/react-bootstrap/react-bootstrap">
          React Bootstrap
        </a>
      </h3>
      <Form.Control
        data-qa="bootstrap-text-input"
        type="text"
        placeholder="Text input"
      />
      <br />
      <Form.Control
        data-qa="bootstrap-text-input-filled"
        defaultValue="initial value"
        type="text"
        placeholder="Filled text input"
      />
      <br />
      <Form.Control
        as="input"
        data-qa="bootstrap-password-input"
        type="password"
        placeholder="Password input"
      />
      <br />
      <Form.Control
        data-qa="bootstrap-number-input"
        type="number"
        placeholder="Number input"
      />
      <br />
      <Form.Control
        as="textarea"
        data-qa="bootstrap-textarea"
        placeholder="Textarea"
      />
    </div>
  );
}

export default ReactBootstrapTextInputs;
