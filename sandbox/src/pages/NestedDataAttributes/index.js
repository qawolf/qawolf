import React from 'react';
import RadioGroup from './RadioGroup';

function NestedDataAttributes() {
  return (
    <div className="container" data-qa="container">
      <h4>Best pet?</h4>
      <div data-test="first-group">
        <div data-test="best">
          <RadioGroup index={0} values={['Cat', 'Dog', 'Hedgehog']} />
        </div>
      </div>
      <h4>Second best pet?</h4>
      <RadioGroup index={1} values={['Cat', 'Dog', 'Hedgehog']} />
      <div data-test="click">
        <button data-qa="button" id="button">
          Click me!
        </button>
      </div>
      <br />
      <button data-qa="button">And me!</button>
      <br />
      <button data-qa="unique" id="unique">
        But not me!
      </button>
    </div>
  );
}

export default NestedDataAttributes;
