import React from 'react';

function RadioGroup({ index, values }) {
  const inputsHtml = values.map(value => {
    const rawValue = `${value.toLowerCase()}-${index}`;

    return (
      <React.Fragment key={rawValue}>
        <input type="radio" id={rawValue} name="pet" value={rawValue} />
        <label htmlFor={rawValue}>{` ${value}`}</label>
        <br />
      </React.Fragment>
    );
  });

  return <fieldset data-qa="radio-group">{inputsHtml}</fieldset>;
}

export default RadioGroup;
