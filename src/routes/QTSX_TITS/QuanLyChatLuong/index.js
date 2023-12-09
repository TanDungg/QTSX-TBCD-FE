import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const NhomLoi = asyncComponent(() => import("./NhomLoi/NhomLoi"));
const NhomLoiForm = asyncComponent(() => import("./NhomLoi/NhomLoiForm"));

const Loi = asyncComponent(() => import("./Loi/Loi"));
const LoiForm = asyncComponent(() => import("./Loi/LoiForm"));

const HangMucKiemTra = asyncComponent(() =>
  import("./HangMucKiemTra/HangMucKiemTra")
);
const HangMucKiemTraForm = asyncComponent(() =>
  import("./HangMucKiemTra/HangMucKiemTraForm")
);
const ChiTietHangMucKiemTra = asyncComponent(() =>
  import("./HangMucKiemTra/ChiTietHangMucKiemTra")
);
const ThemChiTietHMKTForm = asyncComponent(() =>
  import("./HangMucKiemTra/ThemChiTietHMKTForm")
);

const QuanLyChecksheets = asyncComponent(() =>
  import("./QuanLyChecksheets/QuanLyChecksheets")
);
const QuanLyChecksheetsForm = asyncComponent(() =>
  import("./QuanLyChecksheets/QuanLyChecksheetsForm")
);
const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/nhom-loi`}
        exact
        component={Auth(NhomLoi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhom-loi/them-moi`}
        exact
        component={Auth(NhomLoiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhom-loi/:id/chinh-sua`}
        exact
        component={Auth(NhomLoiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loi`}
        exact
        component={Auth(Loi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loi/them-moi`}
        exact
        component={Auth(LoiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loi/:id/chinh-sua`}
        exact
        component={Auth(LoiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hang-muc-kiem-tra`}
        exact
        component={Auth(HangMucKiemTra, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hang-muc-kiem-tra/them-moi`}
        exact
        component={Auth(HangMucKiemTraForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hang-muc-kiem-tra/:id/chinh-sua`}
        exact
        component={Auth(HangMucKiemTraForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hang-muc-kiem-tra/:id/chi-tiet`}
        exact
        component={Auth(ChiTietHangMucKiemTra, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hang-muc-kiem-tra/:id/chi-tiet/them-moi`}
        exact
        component={Auth(ThemChiTietHMKTForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hang-muc-kiem-tra/:id/chi-tiet/:idchitiet/chinh-sua`}
        exact
        component={Auth(ThemChiTietHMKTForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ql-checksheets`}
        exact
        component={Auth(QuanLyChecksheets, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ql-checksheets/them-moi`}
        exact
        component={Auth(QuanLyChecksheetsForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ql-checksheets/:id/chinh-sua`}
        exact
        component={Auth(QuanLyChecksheetsForm, menus, pathname, permission)}
      />{" "}
      <Route
        path={`${match.url}/ql-checksheets/:id/chi-tiet`}
        exact
        component={Auth(QuanLyChecksheetsForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
