import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "src/helpers/Auth";

const NguoiDung = asyncComponent(() => import("./NguoiDung/NguoiDung"));
const NguoiDungForm = asyncComponent(() => import("./NguoiDung/NguoiDungForm"));
const CanBoNhanVien = asyncComponent(() =>
  import("./CanBoNhanVien/CanBoNhanVien")
);
const CanBoNhanVienForm = asyncComponent(() =>
  import("./CanBoNhanVien/CanBoNhanVienForm")
);
const Quyen = asyncComponent(() => import("./Quyen/Quyen"));
const ChucNang = asyncComponent(() => import("./ChucNang/ChucNang"));
const ChucNangForm = asyncComponent(() => import("./ChucNang/ChucNangForm"));
const VaiTro = asyncComponent(() => import("./VaiTro/VaiTro"));
const VaiTroForm = asyncComponent(() => import("./VaiTro/VaiTroForm"));
const ChuKy = asyncComponent(() => import("./ChuKy/ChuKy"));

// const PhanQuyenDonVi = asyncComponent(() =>
//   import("./PhanQuyenDonVi/PhanQuyenDonVi")
// );
// const DieuChuyenNhanVien = asyncComponent(() =>
//   import("./DieuChuyenNhanVien/DieuChuyenNhanVien")
// );
// const ImportDieuChuyenNhanVien = asyncComponent(() =>
//   import("./DieuChuyenNhanVien/ImportDieuChuyenNhanVien")
// );
// const LapYeuCau = asyncComponent(() =>
//   import("./DieuChuyenNhanVien/LapYeuCau")
// );
// const TiepNhanDieuChuyen = asyncComponent(() =>
//   import("./TiepNhanDieuChuyen/TiepNhanDieuChuyen")
// );
// // const Home = asyncComponent(() => import("../Home"));
// const NhanVienNghiViec = asyncComponent(() =>
//   import("./NhanVienNghiViec/NhanVienNghiViec")
// );

// const PhanMemDonVi = asyncComponent(() =>
//   import("./PhanMemDonVi/PhanMemDonVi")
// );
// const PhanMemDonViForm = asyncComponent(() =>
//   import("./PhanMemDonVi/PhanMemDonViForm")
// );

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/nguoi-dung`}
        exact
        component={Auth(NguoiDung, menus, pathname, permission)}
      />{" "}
      <Route
        path={`${match.url}/nguoi-dung/them-moi`}
        exact
        component={Auth(NguoiDungForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nguoi-dung/:id/chinh-sua`}
        exact
        component={Auth(NguoiDungForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/can-bo-nhan-vien`}
        exact
        component={Auth(CanBoNhanVien, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/can-bo-nhan-vien/them-moi`}
        exact
        component={Auth(CanBoNhanVienForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/can-bo-nhan-vien/:id/chinh-sua`}
        exact
        component={Auth(CanBoNhanVienForm, menus, pathname, permission)}
      />
      {/* <Route
        path={`${match.url}/nhan-vien-nghi-viec`}
        exact
        component={Auth(NhanVienNghiViec, menus, pathname, permission)}
      /> */}
      <Route
        path={`${match.url}/menu`}
        exact
        component={Auth(ChucNang, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/menu/them-moi`}
        exact
        component={Auth(ChucNangForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/menu/:id/chinh-sua`}
        exact
        component={Auth(ChucNangForm, menus, pathname, permission)}
      />
      {/* <Route
        path={`${match.url}/phan-mem-don-vi`}
        exact
        component={Auth(PhanMemDonVi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phan-mem-don-vi/them-moi`}
        exact
        component={Auth(PhanMemDonViForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phan-mem-don-vi/:id/chinh-sua`}
        exact
        component={Auth(PhanMemDonViForm, menus, pathname, permission)}
      /> */}
      <Route
        path={`${match.url}/vai-tro`}
        exact
        component={Auth(VaiTro, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/vai-tro/them-moi`}
        exact
        component={Auth(VaiTroForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/vai-tro/:id/chinh-sua`}
        exact
        component={Auth(VaiTroForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/vai-tro/:id/phan-quyen`}
        exact
        component={Auth(Quyen, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chu-ky-so`}
        exact
        component={Auth(ChuKy, menus, pathname, permission)}
      />
      {/* <Route
        path={`${match.url}/dieu-chuyen-cbnv`}
        exact
        component={Auth(DieuChuyenNhanVien, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen-cbnv/lap-yeu-cau`}
        exact
        component={Auth(LapYeuCau, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen-cbnv/:id/chinh-sua`}
        exact
        component={Auth(LapYeuCau, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen-cbnv/:id/chi-tiet`}
        exact
        component={Auth(LapYeuCau, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen-cbnv/import`}
        exact
        component={Auth(ImportDieuChuyenNhanVien, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/tiep-nhan-dieu-chuyen-cbnv`}
        exact
        component={Auth(TiepNhanDieuChuyen, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quyen-don-vi`}
        exact
        component={Auth(PhanQuyenDonVi, menus, pathname, permission)}
      />{" "} */}
      {/* <Route path="*" component={Auth(Home, menus, pathname, permission)} /> */}
    </Switch>
  );
};

export default App;