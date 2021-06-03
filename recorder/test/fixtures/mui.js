'use strict';

function CheckBoxExample() {
  const [checked, setChecked] = React.useState(false);

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  return (
    <div>
      <MaterialUI.Checkbox
        checked={checked}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'primary checkbox' }}
      />
    </div>
  );
}

function PageComponent() {
  return (
    <div>
      <CheckBoxExample />
    </div>
  );
}

ReactDOM.render(React.createElement(PageComponent), document.querySelector('#root'));
