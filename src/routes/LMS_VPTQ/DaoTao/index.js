import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "src/helpers/Auth";


/* Cập nhật kết quả đào tạo */
const CapNhatKetQuaDaoTao = asyncComponent(() => import("./CapNhatKetQuaDaoTao/CapNhatKetQuaDaoTao"));
const CapNhatKetQuaDaoTaoForm = asyncComponent(() =>
  import("./CapNhatKetQuaDaoTao/CapNhatKetQuaDaoTaoForm")
);

/* Xác nhận kết quả đào tạo */
const XacNhanKetQuaDaoTao = asyncComponent(() =>
  import("./XacNhanKetQuaDaoTao/XacNhanKetQuaDaoTao")
);

/* Học trực tuyến */
const HocTrucTuyen = asyncComponent(() =>
  import("./HocTrucTuyen/HocTrucTuyen")
);
const ChiTietHocTrucTuyen = asyncComponent(() =>
  import("./HocTrucTuyen/ChiTietHocTrucTuyen")
);

/* Thi khảo sát */
const ThiKhaoSat = asyncComponent(() => import("./ThiKhaoSat/ThiKhaoSat"));

/* Xác nhận đào tạo */
const XacNhanDaoTao = asyncComponent(() =>
  import("./XacNhanDaoTao/XacNhanDaoTao")
);
const XacNhanDaoTaoForm = asyncComponent(() =>
  import("./XacNhanDaoTao/XacNhanDaoTaoForm")
);

/* Tiến trình học tập */
const TienTrinhHocTap = asyncComponent(() =>
  import("./TienTrinhHocTap/TienTrinhHocTap")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Cập nhật kết quả đào tạo */}
      <Route
        path={`${match.url}/cap-nhat-ket-qua-dao-tao`}
        exact
        component={Auth(CapNhatKetQuaDaoTao, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/cap-nhat-ket-qua-dao-tao/them-moi`}
        exact
        component={Auth(CapNhatKetQuaDaoTaoForm, menus, pathname, permission)}
      />

      {/* Xác nhận kết quả đào tạo */}
      <Route
        path={`${match.url}/xac-nhan-ket-qua-dao-tao`}
        exact
        component={Auth(XacNhanKetQuaDaoTao, menus, pathname, permission)}
      />

      {/* Học trực tuyến */}
      <Route
        path={`${match.url}/hoc-truc-tuyen`}
        exact
        component={Auth(HocTrucTuyen, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hoc-truc-tuyen/:id/chi-tiet`}
        exact
        component={Auth(ChiTietHocTrucTuyen, menus, pathname, permission)}
      />

      {/* Thi khảo sát */}
      <Route
        path={`${match.url}/thi-khao-sat`}
        exact
        component={Auth(ThiKhaoSat, menus, pathname, permission)}
      />

      {/* Xác nhận đào tạo */}
      <Route
        path={`${match.url}/xac-nhan-dao-tao`}
        exact
        component={Auth(XacNhanDaoTao, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xac-nhan-dao-tao/:id/xac-nhan-danh-sach`}
        exact
        component={Auth(XacNhanDaoTaoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xac-nhan-dao-tao/:id/chinh-sua-danh-sach`}
        exact
        component={Auth(XacNhanDaoTaoForm, menus, pathname, permission)}
      />

      {/* Tiến trình học tập */}
      <Route
        path={`${match.url}/tien-trinh-hoc-tap`}
        exact
        component={Auth(TienTrinhHocTap, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
