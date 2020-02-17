import React from "react";
import { Form, Input, TextArea } from "semantic-ui-react";

function SemanticUiTextINputs() {
  return (
    <div className="container">
      <h3>
        <a href="https://github.com/Semantic-Org/Semantic-UI-React">
          Semantic UI
        </a>
      </h3>
      <Input
        data-qa="semantic-text-input"
        placeholder="Text input"
        type="text"
      />
      <br />
      <br />
      <Input
        data-qa="semantic-text-input-filled"
        defaultValue="initial value"
        placeholder="Filled text input"
        type="text"
      />
      <br />
      <br />
      <Input
        data-qa="semantic-password-input"
        placeholder="Password input"
        type="password"
      />
      <br />
      <br />
      <Input
        data-qa="semantic-number-input"
        placeholder="Number input"
        type="number"
      />
      <br />
      <br />
      <Form>
        <TextArea data-qa="semantic-textarea" placeholder="Textarea" />
      </Form>
    </div>
  );
}

export default SemanticUiTextINputs;
