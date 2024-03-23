import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "src/helpers/Auth";

/* Yêu cầu báo giá */
const YeuCauBaoGia = asyncComponent(() => import("./YeuCauBaoGia"));

const App = ({ match, location, menus }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Yêu cầu báo giá */}
      <Route
        path={`${match.url}/yeu-cau-bao-gia`}
        component={Auth(YeuCauBaoGia, menus, pathname)}
      />
    </Switch>
  );
};

export default App;
