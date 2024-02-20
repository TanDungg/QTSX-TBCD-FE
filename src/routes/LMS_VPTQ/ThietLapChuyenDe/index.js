import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

/* Chuyên đề đào tạo */
const ChuyenDeDaoTao = asyncComponent(() =>
  import("./ChuyenDeDaoTao/ChuyenDeDaoTao")
);
const ChuyenDeDaoTaoForm = asyncComponent(() =>
  import("./ChuyenDeDaoTao/ChuyenDeDaoTaoForm")
);

/* Học phí đào tạo */
const HocPhi = asyncComponent(() => import("./HocPhi/HocPhi"));
const HocPhiForm = asyncComponent(() => import("./HocPhi/HocPhiForm"));

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Đăng ký đào tạo */}
      <Route
        path={`${match.url}/chuyen-de-dao-tao`}
        exact
        component={Auth(ChuyenDeDaoTao, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuyen-de-dao-tao/them-moi`}
        exact
        component={Auth(ChuyenDeDaoTaoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuyen-de-dao-tao/:id/chinh-sua`}
        exact
        component={Auth(ChuyenDeDaoTaoForm, menus, pathname, permission)}
      />

      {/* Học phí đào tạo */}
      <Route
        path={`${match.url}/hoc-phi`}
        exact
        component={Auth(HocPhi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hoc-phi/them-moi`}
        exact
        component={Auth(HocPhiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hoc-phi/:id/chinh-sua`}
        exact
        component={Auth(HocPhiForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
