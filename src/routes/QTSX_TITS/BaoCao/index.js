import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

//Báo cáo chất lượng theo tháng
const BaoCaoChatLuongTheoThang = asyncComponent(() =>
  import("./BaoCaoChatLuongTheoThang/BaoCaoChatLuongTheoThang")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Báo cáo chất lượng theo tháng */}
      <Route
        path={`${match.url}/chat-luong-theo-thang`}
        exact
        component={Auth(BaoCaoChatLuongTheoThang, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
