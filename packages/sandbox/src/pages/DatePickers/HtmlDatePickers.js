import React from "react";

function HtmlDatePickers() {
  return (
    <div className="container">
      <h3>Native HTML</h3>
      <h4>Date</h4>
      <input data-qa="html-date-picker" type="date" />
      <h4>Week</h4>
      <input data-qa="html-week-picker" type="week" />
      <h4>Month</h4>
      <input data-qa="html-month-picker" type="month" />
    </div>
  );
}

export default HtmlDatePickers;
