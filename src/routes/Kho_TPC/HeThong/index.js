import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "src/helpers/Auth";

const NotFound = asyncComponent(() => import("../../NotFound/NotFound"));

const NguoiDung = asyncComponent(() => import("./NguoiDung/NguoiDung"));
const NguoiDungForm = asyncComponent(() => import("./NguoiDung/NguoiDungForm"));
const NguoiDungApp = asyncComponent(() =>
  import("./NguoiDungApp/NguoiDungApp")
);
const NguoiDungAppForm = asyncComponent(() =>
  import("./NguoiDungApp/NguoiDungAppForm")
);
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
const MenuApp = asyncComponent(() => import("./MenuApp/MenuApp"));
const MenuAppForm = asyncComponent(() => import("./MenuApp/MenuAppForm"));
const PhanQuyenKho = asyncComponent(() =>
  import("./PhanQuyenKho/PhanQuyenKho")
);

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
        path={`${match.url}/nguoi-dung-app`}
        exact
        component={Auth(NguoiDungApp, menus, pathname, permission)}
      />{" "}
      <Route
        path={`${match.url}/nguoi-dung-app/them-moi`}
        exact
        component={Auth(NguoiDungAppForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nguoi-dung-app/:id/chinh-sua`}
        exact
        component={Auth(NguoiDungAppForm, menus, pathname, permission)}
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
        path={`${match.url}/chuc-nang`}
        exact
        component={Auth(ChucNang, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuc-nang/them-moi`}
        exact
        component={Auth(ChucNangForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuc-nang/:id/chinh-sua`}
        exact
        component={Auth(ChucNangForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/menu-app`}
        exact
        component={Auth(MenuApp, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/menu-app/them-moi`}
        exact
        component={Auth(MenuAppForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/menu-app/:id/chinh-sua`}
        exact
        component={Auth(MenuAppForm, menus, pathname, permission)}
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
      <Route
        path={`${match.url}/phan-quyen-kho`}
        exact
        component={Auth(PhanQuyenKho, menus, pathname, permission)}
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
      <Route path="*" component={Auth(NotFound, menus, pathname)} />
    </Switch>
  );
};

export default App;
