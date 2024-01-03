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

//Theo doi tiến độ sản xuất
const TheoDoiTienDoSanXuat = asyncComponent(() =>
  import("./TheoDoiTienDoSanXuat/TheoDoiTienDoSanXuat")
);

//Cấu hình KanBan
const CauHinhKanBan = asyncComponent(() =>
  import("./KanBan/CauHinhKanBan/CauHinhKanBan")
);

//Chi tiết cấu hình KanBan
const ChiTietCauHinhKanBan = asyncComponent(() =>
  import("./KanBan/ChiTietCauHinhKanBan/ChiTietCauHinhKanBan")
);

//Máy sản xuất
const MaySanXuat = asyncComponent(() => import("./KanBan/MaySanXuat/MaySanXuat"));

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
      {/*Theo dõi Tiến độ sản xuất */}
      <Route
        path={`${match.url}/theo-doi-tien-do-san-xuat`}
        exact
        component={Auth(TheoDoiTienDoSanXuat, menus, pathname, permission)}
      />
      {/* Cấu hình KanBan */}
      <Route
        path={`${match.url}/kanban/cau-hinh`}
        exact
        component={Auth(CauHinhKanBan, menus, pathname, permission)}
      />

      {/* Chi tiết cầu hình KanBan */}
      <Route
        path={`${match.url}/kanban/chi-tiet-cau-hinh`}
        exact
        component={Auth(ChiTietCauHinhKanBan, menus, pathname, permission)}
      />

      {/* Máy sản xuất */}
      <Route
        path={`${match.url}/kanban/may-san-xuat`}
        exact
        component={Auth(MaySanXuat, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
