import React from "react";
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch
} from "react-router-dom";
import Buttons from "./pages/Buttons";
import ContentEditables from "./pages/ContentEditables";
import DatePickers from "./pages/DatePickers";
import Selects from "./pages/Selects";
import TextInputs from "./pages/TextInputs";
import TimePickers from "./pages/TimePickers";
// CSS
import "./App.css";

function Navigation() {
  return (
    <ul>
      <li>
        <Link to="/buttons">Buttons</Link>
      </li>
      <li>
        <Link to="/content-editables">Content editables</Link>
      </li>
      <li>
        <Link to="/date-pickers">Date pickers</Link>
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
        <Route component={ContentEditables} path="/content-editables" />
        <Route component={DatePickers} path="/date-pickers" />
        <Route component={Selects} path="/selects" />
        <Route component={TextInputs} path="/text-inputs" />
        <Route component={TimePickers} path="/time-pickers" />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
