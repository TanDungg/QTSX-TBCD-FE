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
//KHO_NHUA
const DanhMuc_KHO_TPC = asyncComponent(() => import("./Kho_TPC/DanhMuc"));
const HeThong_KHO_TPC = asyncComponent(() => import("./Kho_TPC/HeThong"));
const SanXuat_KHO_TPC = asyncComponent(() => import("./Kho_TPC/SanXuat"));
const MuaHang_KHO_TPC = asyncComponent(() => import("./Kho_TPC/MuaHang"));
const BaoCao_KHO_TPC = asyncComponent(() => import("./Kho_TPC/BaoCao"));
const QuanLyKho_KHO_TPC = asyncComponent(() => import("./Kho_TPC/QuanLyKho"));
const InBarcode = asyncComponent(() => import("./Kho_TPC/InBarcode"));
const HOME_KHO_TPC = asyncComponent(() => import("./Kho_TPC/Home"));
//QTSX_TITS
const Home_QTSX_TITS = asyncComponent(() => import("./QTSX_TITS/Home"));
const DanhMuc_QTSX_TITS = asyncComponent(() => import("./QTSX_TITS/DanhMuc"));
const HeThong_QTSX_TITS = asyncComponent(() => import("./QTSX_TITS/HeThong"));
const KeHoach_QTSX_TITS = asyncComponent(() => import("./QTSX_TITS/KeHoach"));
const MuaHang_QTSX_TITS = asyncComponent(() => import("./QTSX_TITS/MuaHang"));
const KyThuat_QTSX_TITS = asyncComponent(() => import("./QTSX_TITS/KyThuat"));
const SanXuat_QTSX_TITS = asyncComponent(() => import("./QTSX_TITS/SanXuat"));
const QuanLyKhoVatTu_QTSX_TITS = asyncComponent(() =>
  import("./QTSX_TITS/QuanLyKhoVatTu")
);
const QuanLyKhoThanhPham_QTSX_TITS = asyncComponent(() =>
  import("./QTSX_TITS/QuanLyKhoThanhPham")
);
const QuanLyChatLuong_QTSX_TITS = asyncComponent(() =>
  import("./QTSX_TITS/QuanLyChatLuong")
);
const BaoCao_QTSX_TITS = asyncComponent(() => import("./QTSX_TITS/BaoCao"));
const InBarcode_QTSX_TITS = asyncComponent(() =>
  import("./QTSX_TITS/InBarcode")
);
const ManHinh = asyncComponent(() => import("./QTSX_TITS/QuanLyManHinh"));
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

/* LMS_VPTQ */
const Home_QTSX_TSEC = asyncComponent(() => import("./QTSX_TSEC/Home"));
const HeThong_QTSX_TSEC = asyncComponent(() => import("./QTSX_TSEC/HeThong"));
const DanhMuc_QTSX_TSEC = asyncComponent(() => import("./QTSX_TSEC/DanhMuc"));

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
          path={`${match.url}home-qtsx-tits`}
          component={Auth(Home_QTSX_TITS, menus, pathname)}
        />
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
        <Route
          path={`${match.url}mua-hang-qtsx-tits`}
          component={Auth(MuaHang_QTSX_TITS, menus, pathname)}
        />
        <Route
          path={`${match.url}ky-thuat-qtsx-tits`}
          component={Auth(KyThuat_QTSX_TITS, menus, pathname)}
        />
        <Route
          path={`${match.url}san-xuat-qtsx-tits`}
          component={Auth(SanXuat_QTSX_TITS, menus, pathname)}
        />
        <Route
          path={`${match.url}quan-ly-kho-vat-tu-qtsx-tits`}
          component={Auth(QuanLyKhoVatTu_QTSX_TITS, menus, pathname)}
        />
        <Route
          path={`${match.url}quan-ly-kho-thanh-pham-qtsx-tits`}
          component={Auth(QuanLyKhoThanhPham_QTSX_TITS, menus, pathname)}
        />
        <Route
          path={`${match.url}quan-ly-chat-luong-qtsx-tits`}
          component={Auth(QuanLyChatLuong_QTSX_TITS, menus, pathname)}
        />
        <Route
          path={`${match.url}bao-cao-qtsx-tits`}
          component={Auth(BaoCao_QTSX_TITS, menus, pathname)}
        />
        <Route
          path={`${match.url}in-barcode-qtsx-tits`}
          component={Auth(InBarcode_QTSX_TITS, menus, pathname)}
        />
        <Route
          path={`${match.url}quan-ly-man-hinh-qtsx-tits`}
          component={Auth(ManHinh, menus, pathname)}
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
         {/* LMS-VPTQ */}
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
        <Route path="*" component={Auth(NotFound, menus, pathname)} />
      </Switch>
    </div>
  );
};

export default App;
