import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

//Quy trình sản xuất
const QuyTrinhSanXuat = asyncComponent(() =>
  import("./QuyTrinhSanXuat/QuyTrinhSanXuat")
);
const QuyTrinhSanXuatForm = asyncComponent(() =>
  import("./QuyTrinhSanXuat/QuyTrinhSanXuatForm")
);

//Tiến độ sản xuất
const TienDoSanXuat = asyncComponent(() =>
  import("./TienDoSanXuat/TienDoSanXuat")
);

//Cấu hình KanBan
const CauHinhKanBan = asyncComponent(() =>
  import("./CauHinhKanBan/CauHinhKanBan")
);

//In KanBan
const InKanBan = asyncComponent(() => import("./InKanBan/InKanBan"));

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Quy trình sản xuất */}
      <Route
        path={`${match.url}/quy-trinh-san-xuat`}
        exact
        component={Auth(QuyTrinhSanXuat, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-san-xuat/them-moi`}
        exact
        component={Auth(QuyTrinhSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-san-xuat/:id/chinh-sua`}
        exact
        component={Auth(QuyTrinhSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-san-xuat/:id/chi-tiet`}
        exact
        component={Auth(QuyTrinhSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-san-xuat/:id/xac-nhan`}
        exact
        component={Auth(QuyTrinhSanXuatForm, menus, pathname, permission)}
      />

      {/* Tiến độ sản xuất */}
      <Route
        path={`${match.url}/tien-do-san-xuat`}
        exact
        component={Auth(TienDoSanXuat, menus, pathname, permission)}
      />

      {/* Cấu hình KanBan */}
      <Route
        path={`${match.url}/cau-hinh-kanban`}
        exact
        component={Auth(CauHinhKanBan, menus, pathname, permission)}
      />

      {/* In KanBan */}
      <Route
        path={`${match.url}/in-kanban`}
        exact
        component={Auth(InKanBan, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
