'use strict';

function CheckBoxExample() {
  const [checked, setChecked] = React.useState(true);
  return (
    <div id="checkbox-example">
      <Grommet.CheckBox
        checked={checked}
        label="interested?"
        onChange={(event) => setChecked(event.target.checked)}
      />
    </div>
  );
}

function PageComponent() {
  return (
    <Grommet.Grommet plain>
      <CheckBoxExample />
    </Grommet.Grommet>
  );
}

ReactDOM.render(React.createElement(PageComponent), document.querySelector('#root'));
