import React from "react";
import { Route, Switch } from "react-router-dom";

import Auth from "src/helpers/Auth";
import asyncComponent from "util/asyncComponent";

const TaiKhoan = asyncComponent(() => import("./TaiKhoan"));
//ERP
const Home_ERP = asyncComponent(() => import("./ERP/Home"));
const HeThong_ERP = asyncComponent(() => import("./ERP/HeThong"));
const DanhMuc_ERP = asyncComponent(() => import("./ERP/DanhMuc"));
//KHO_NHUA
const DanhMuc_KHO_TPC = asyncComponent(() => import("./Kho_TPC/DanhMuc"));
const HeThong_KHO_TPC = asyncComponent(() => import("./Kho_TPC/HeThong"));
const SanXuat_KHO_TPC = asyncComponent(() => import("./Kho_TPC/SanXuat"));
const MuaHang_KHO_TPC = asyncComponent(() => import("./Kho_TPC/MuaHang"));
const BaoCao_KHO_TPC = asyncComponent(() => import("./Kho_TPC/BaoCao"));
const QuanLyKho_KHO_TPC = asyncComponent(() => import("./Kho_TPC/QuanLyKho"));
const InBarcode = asyncComponent(() => import("./Kho_TPC/InBarcode"));
const HOME_KHO_TPC = asyncComponent(() => import("./Kho_TPC/Home"));

const DanhMuc_QTSX_TITS = asyncComponent(() => import("./QTSX_TITS/DanhMuc"));
const HeThong_QTSX_TITS = asyncComponent(() => import("./QTSX_TITS/HeThong"));
const KeHoach_QTSX_TITS = asyncComponent(() => import("./QTSX_TITS/KeHoach"));

const App = ({ match, menus, location }) => {
  const { pathname } = location;
  return (
    <div className="gx-main-content-wrapper">
      <Switch>
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
        {/* KHO_TPC */}
        <Route
          path={`${match.url}danh-muc-kho-tpc`}
          component={Auth(DanhMuc_KHO_TPC, menus, pathname)}
        />
        <Route
          path={`${match.url}he-thong-kho-tpc`}
          component={Auth(HeThong_KHO_TPC, menus, pathname)}
        />
        <Route
          path={`${match.url}san-xuat-kho-tpc`}
          component={Auth(SanXuat_KHO_TPC, menus, pathname)}
        />
        <Route
          path={`${match.url}mua-hang-kho-tpc`}
          component={Auth(MuaHang_KHO_TPC, menus, pathname)}
        />
        <Route
          path={`${match.url}bao-cao-kho-tpc`}
          component={Auth(BaoCao_KHO_TPC, menus, pathname)}
        />
        <Route
          path={`${match.url}quan-ly-kho-tpc`}
          component={Auth(QuanLyKho_KHO_TPC, menus, pathname)}
        />
        <Route
          path={`${match.url}in-barcode-kho-tpc`}
          component={Auth(InBarcode, menus, pathname)}
        />
        <Route
          path={`${match.url}home-kho-tpc`}
          component={Auth(HOME_KHO_TPC, menus, pathname)}
        />
        {/* QTSX-TITS */}
        <Route
          path={`${match.url}danh-muc-qtsx-tits`}
          component={Auth(DanhMuc_QTSX_TITS, menus, pathname)}
        />
        <Route
          path={`${match.url}he-thong-qtsx-tits`}
          component={Auth(HeThong_QTSX_TITS, menus, pathname)}
        />
        <Route
          path={`${match.url}ke-hoach-qtsx-tits`}
          component={Auth(KeHoach_QTSX_TITS, menus, pathname)}
        />
        <Route path="*" component={Auth(Home_ERP, menus, pathname)} />
      </Switch>
    </div>
  );
};

export default App;
