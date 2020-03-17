import React from 'react';
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import Buttons from './pages/Buttons';
import CheckboxInputs from './pages/CheckboxInputs';
import ContentEditables from './pages/ContentEditables';
import DatePickers from './pages/DatePickers';
import Images from './pages/Images';
import InfiniteScroll from './pages/InfiniteScroll';
import Large from './pages/Large';
import LogIn from './pages/LogIn';
import NestedDataAttributes from './pages/NestedDataAttributes';
import RadioInputs from './pages/RadioInputs';
import Selects from './pages/Selects';
import TextInputs from './pages/TextInputs';
import TimePickers from './pages/TimePickers';
// CSS
import './App.css';

function Navigation() {
  return (
    <ul>
      <li>
        <Link to="/buttons">Buttons</Link>
      </li>
      <li>
        <Link to="/checkbox-inputs">Checkbox inputs</Link>
      </li>
      <li>
        <Link to="/content-editables">Content editables</Link>
      </li>
      <li>
        <Link to="/date-pickers">Date pickers</Link>
      </li>
      <li>
        <Link to="/images">Images</Link>
      </li>
      <li>
        <Link to="/infinite-scroll">Infinite scroll</Link>
      </li>
      <li>
        <Link to="/large">Large</Link>
      </li>
      <li>
        <Link to="/login">Log in</Link>
      </li>
      <li>
        <Link to="/nested-data-attributes">Nested data attributes</Link>
      </li>
      <li>
        <Link to="/radio-inputs">Radio inputs</Link>
      </li>
      <li>
        <Link to="/selects">Selects</Link>
      </li>
      <li>
        <Link to="/text-inputs">Text inputs</Link>
      </li>
      <li>
        <Link to="/time-pickers">Time pickers</Link>
      </li>
    </ul>
  );
}

function App() {
  return (
    <Router>
      <Switch>
        <Route component={Navigation} exact path="/" />
        <Route component={Buttons} path="/buttons" />
        <Route component={CheckboxInputs} path="/checkbox-inputs" />
        <Route component={ContentEditables} path="/content-editables" />
        <Route component={DatePickers} path="/date-pickers" />
        <Route component={Images} path="/images" />
        <Route component={InfiniteScroll} path="/infinite-scroll" />
        <Route component={Large} path="/large" />
        <Route component={LogIn} path="/login" />
        <Route
          component={NestedDataAttributes}
          path="/nested-data-attributes"
        />
        <Route component={RadioInputs} path="/radio-inputs" />
        <Route component={Selects} path="/selects" />
        <Route component={TextInputs} path="/text-inputs" />
        <Route component={TimePickers} path="/time-pickers" />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
