import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

/* Ngân hàng câu hỏi */
const NganHangCauHoi = asyncComponent(() =>
  import("./NganHangCauHoi/NganHangCauHoi")
);
const NganHangCauHoiForm = asyncComponent(() =>
  import("./NganHangCauHoi/NganHangCauHoiForm")
);

/* Ngân hàng đề thi */
const NganHangDeThi = asyncComponent(() => import("./NganHangDeThi/NganHangDeThi"));
const NganHangDeThiForm = asyncComponent(() => import("./NganHangDeThi/NganHangDeThiForm"));
const ThiThu = asyncComponent(() => import("./NganHangDeThi/ThiThu"));

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Ngân hàng câu hỏi */}
      <Route
        path={`${match.url}/ngan-hang-cau-hoi`}
        exact
        component={Auth(NganHangCauHoi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ngan-hang-cau-hoi/them-moi`}
        exact
        component={Auth(NganHangCauHoiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ngan-hang-cau-hoi/:id/chinh-sua`}
        exact
        component={Auth(NganHangCauHoiForm, menus, pathname, permission)}
      />

      {/* Ngân hàng đề thi */}
      <Route
        path={`${match.url}/ngan-hang-de-thi`}
        exact
        component={Auth(NganHangDeThi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ngan-hang-de-thi/them-moi`}
        exact
        component={Auth(NganHangDeThiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ngan-hang-de-thi/:id/chinh-sua`}
        exact
        component={Auth(NganHangDeThiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ngan-hang-de-thi/:id/thi-thu`}
        exact
        component={Auth(ThiThu, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
