import React from "react";

function HtmlTimePickers() {
  return (
    <div className="container">
      <h3>Native HTML</h3>
      <h4>Time</h4>
      <input data-qa="html-time-picker" type="time" />
      <h4>Local date and time</h4>
      <input data-qa="html-datetime-local-picker" type="datetime-local" />
    </div>
  );
}

export default HtmlTimePickers;
