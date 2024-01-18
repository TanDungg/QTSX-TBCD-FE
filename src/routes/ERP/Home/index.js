import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "src/helpers/Auth";

const Home = asyncComponent(() => import("./Home"));
const NotFound = asyncComponent(() => import("../../NotFound/NotFound"));

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}`}
        exact
        component={Auth(Home, menus, pathname, permission)}
      />
      <Route path="*" component={Auth(NotFound, menus, pathname)} />
    </Switch>
  );
};

export default App;
