import React from "react";
import { Route, Switch } from "react-router-dom";
import Auth from "src/helpers/Auth";
import asyncComponent from "util/asyncComponent";

const TaiKhoan = asyncComponent(() => import("./TaiKhoan"));
const NotFound = asyncComponent(() => import("./NotFound/NotFound"));
//ERP
const Home_ERP = asyncComponent(() => import("./ERP/Home"));
const HeThong_ERP = asyncComponent(() => import("./ERP/HeThong"));
const DanhMuc_ERP = asyncComponent(() => import("./ERP/DanhMuc"));

/* LMS_VPTQ */
const Home_LMS_VPTQ = asyncComponent(() => import("./LMS_VPTQ/Home"));
const HeThong_LMS_VPTQ = asyncComponent(() => import("./LMS_VPTQ/HeThong"));
const DanhMuc_LMS_VPTQ = asyncComponent(() => import("./LMS_VPTQ/DanhMuc"));
const ThietLapChuyenDe = asyncComponent(() =>
  import("./LMS_VPTQ/ThietLapChuyenDe")
);
const DangKyVaTheoDoi = asyncComponent(() =>
  import("./LMS_VPTQ/DangKyVaTheoDoi")
);
const DaoTao = asyncComponent(() => import("./LMS_VPTQ/DaoTao"));
const TaiLieuThamKhao = asyncComponent(() =>
  import("./LMS_VPTQ/TaiLieuThamKhao")
);
const KiemTra = asyncComponent(() => import("./LMS_VPTQ/KiemTra"));
const BaoCao = asyncComponent(() => import("./LMS_VPTQ/BaoCao"));

/* QTSX_TSEC */
const Home_QTSX_TSEC = asyncComponent(() => import("./QTSX_TSEC/Home"));
const HeThong_QTSX_TSEC = asyncComponent(() => import("./QTSX_TSEC/HeThong"));
const DanhMuc_QTSX_TSEC = asyncComponent(() => import("./QTSX_TSEC/DanhMuc"));
const BanHang_QTSX_TSEC = asyncComponent(() => import("./QTSX_TSEC/BanHang"));

const App = ({ match, menus, location }) => {
  const { pathname } = location;
  return (
    <div className="gx-main-content-wrapper">
      <Switch>
        {/* ERP */}
        <Route
          path={`${match.url}home`}
          component={Auth(Home_ERP, menus, pathname)}
        />
        <Route
          path={`${match.url}he-thong-erp`}
          component={Auth(HeThong_ERP, menus, pathname)}
        />
        <Route
          path={`${match.url}tai-khoan`}
          component={Auth(TaiKhoan, menus, pathname)}
        />
        <Route
          path={`${match.url}danh-muc-erp`}
          component={Auth(DanhMuc_ERP, menus, pathname)}
        />

        {/* LMS-VPTQ */}
        <Route
          path={`${match.url}home-lms-vptq`}
          component={Auth(Home_LMS_VPTQ, menus, pathname)}
        />
        <Route
          path={`${match.url}he-thong-lms-vptq`}
          component={Auth(HeThong_LMS_VPTQ, menus, pathname)}
        />
        <Route
          path={`${match.url}danh-muc-lms-vptq`}
          component={Auth(DanhMuc_LMS_VPTQ, menus, pathname)}
        />
        <Route
          path={`${match.url}dao-tao-lms-vptq`}
          component={Auth(DaoTao, menus, pathname)}
        />
        <Route
          path={`${match.url}dang-ky-va-theo-doi-lms-vptq`}
          component={Auth(DangKyVaTheoDoi, menus, pathname)}
        />
        <Route
          path={`${match.url}thiet-lap-chuyen-de-lms-vptq`}
          component={Auth(ThietLapChuyenDe, menus, pathname)}
        />
        <Route
          path={`${match.url}tai-lieu-tham-khao-lms-vptq`}
          component={Auth(TaiLieuThamKhao, menus, pathname)}
        />
        <Route
          path={`${match.url}kiem-tra-lms-vptq`}
          component={Auth(KiemTra, menus, pathname)}
        />
        <Route
          path={`${match.url}bao-cao-lms-vptq`}
          component={Auth(BaoCao, menus, pathname)}
        />

        {/* QTSX_TSEC */}
        <Route
          path={`${match.url}home-qtsx-tsec`}
          component={Auth(Home_QTSX_TSEC, menus, pathname)}
        />
        <Route
          path={`${match.url}he-thong-qtsx-tsec`}
          component={Auth(HeThong_QTSX_TSEC, menus, pathname)}
        />
        <Route
          path={`${match.url}danh-muc-qtsx-tsec`}
          component={Auth(DanhMuc_QTSX_TSEC, menus, pathname)}
        />
        <Route
          path={`${match.url}ban-hang-qtsx-tsec`}
          component={Auth(BanHang_QTSX_TSEC, menus, pathname)}
        />
        <Route path="*" component={Auth(NotFound, menus, pathname)} />
      </Switch>
    </div>
  );
};

export default App;
