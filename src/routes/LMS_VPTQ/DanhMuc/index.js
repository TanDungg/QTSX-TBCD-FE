import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

/* Tập đoàn */
const TapDoan = asyncComponent(() => import("./TapDoan/TapDoan"));
const TapDoanForm = asyncComponent(() => import("./TapDoan/TapDoanForm"));

/* Đơn vị */
const DonVi = asyncComponent(() => import("./DonVi/DonVi"));
const DonViForm = asyncComponent(() => import("./DonVi/DonViForm"));

/* Phòng ban */
const PhongBan = asyncComponent(() => import("./PhongBan/PhongBan"));
const PhongBanForm = asyncComponent(() => import("./PhongBan/PhongBanForm"));

/* Bộ phận */
const BoPhan = asyncComponent(() => import("./BoPhan/BoPhan"));
const BoPhanForm = asyncComponent(() => import("./BoPhan/BoPhanForm"));

/* Chức vụ */
const ChucVu = asyncComponent(() => import("./ChucVu/ChucVu"));
const ChucVuForm = asyncComponent(() => import("./ChucVu/ChucVuForm"));

/* Chức danh */
const ChucDanh = asyncComponent(() => import("./ChucDanh/ChucDanh"));
const ChucDanhForm = asyncComponent(() => import("./ChucDanh/ChucDanhForm"));

/* Chuyên môn */
const ChuyenMon = asyncComponent(() => import("./ChuyenMon/ChuyenMon"));
const ChuyenMonForm = asyncComponent(() => import("./ChuyenMon/ChuyenMonForm"));

/* Trường */
const Truong = asyncComponent(() => import("./Truong/Truong"));
const TruongForm = asyncComponent(() => import("./Truong/TruongForm"));

/* Hình thức đào tạo */
const HinhThucDaoTao = asyncComponent(() => import("./HinhThucDaoTao/HinhThucDaoTao"));
const HinhThucDaoTaoForm = asyncComponent(() => import("./HinhThucDaoTao/HinhThucDaoTaoForm"));

/* Cấp độ nhân sự */
const CapDoNhanSu = asyncComponent(() => import("./CapDoNhanSu/CapDoNhanSu"));
const CapDoNhanSuForm = asyncComponent(() => import("./CapDoNhanSu/CapDoNhanSuForm"));

/* Loại giảng viên */
const LoaiGiangVien = asyncComponent(() => import("./LoaiGiangVien/LoaiGiangVien"));
const LoaiGiangVienForm = asyncComponent(() => import("./LoaiGiangVien/LoaiGiangVienForm"));

/* Kiến thức */
const KienThuc = asyncComponent(() => import("./KienThuc/KienThuc"));
const KienThucForm = asyncComponent(() => import("./KienThuc/KienThucForm"));

/* Giảng viên */
const GiangVien = asyncComponent(() => import("./GiangVien/GiangVien"));
const GiangVienForm = asyncComponent(() => import("./GiangVien/GiangVienForm"));

/* Đơn vị đào tạo */
const DonViDaoTao = asyncComponent(() => import("./DonViDaoTao/DonViDaoTao"));
const DonViDaoTaoForm = asyncComponent(() => import("./DonViDaoTao/DonViDaoTaoForm"));


const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Tập đoàn */}
      <Route
        path={`${match.url}/tap-doan`}
        exact
        component={Auth(TapDoan, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/tap-doan/them-moi`}
        exact
        component={Auth(TapDoanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/tap-doan/:id/chinh-sua`}
        exact
        component={Auth(TapDoanForm, menus, pathname, permission)}
      />

      {/* Đơn vị */}
      <Route
        path={`${match.url}/don-vi`}
        exact
        component={Auth(DonVi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/don-vi/them-moi`}
        exact
        component={Auth(DonViForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/don-vi/:id/chinh-sua`}
        exact
        component={Auth(DonViForm, menus, pathname, permission)}
      />

      {/* Phòng ban */}
      <Route
        path={`${match.url}/phong-ban`}
        exact
        component={Auth(PhongBan, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phong-ban/them-moi`}
        exact
        component={Auth(PhongBanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phong-ban/:id/chinh-sua`}
        exact
        component={Auth(PhongBanForm, menus, pathname, permission)}
      />

      {/* Bộ phận */}
      <Route
        path={`${match.url}/bo-phan`}
        exact
        component={Auth(BoPhan, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bo-phan/them-moi`}
        exact
        component={Auth(BoPhanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bo-phan/:id/chinh-sua`}
        exact
        component={Auth(BoPhanForm, menus, pathname, permission)}
      />

      {/* Chức vụ */}
      <Route
        path={`${match.url}/chuc-vu`}
        exact
        component={Auth(ChucVu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuc-vu/them-moi`}
        exact
        component={Auth(ChucVuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuc-vu/:id/chinh-sua`}
        exact
        component={Auth(ChucVuForm, menus, pathname, permission)}
      />

      {/* Chức danh */}
      <Route
        path={`${match.url}/chuc-danh`}
        exact
        component={Auth(ChucDanh, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuc-danh/them-moi`}
        exact
        component={Auth(ChucDanhForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuc-danh/:id/chinh-sua`}
        exact
        component={Auth(ChucDanhForm, menus, pathname, permission)}
      />

      {/* Chuyên môn */}
      <Route
        path={`${match.url}/chuyen-mon`}
        exact
        component={Auth(ChuyenMon, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuyen-mon/them-moi`}
        exact
        component={Auth(ChuyenMonForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuyen-mon/:id/chinh-sua`}
        exact
        component={Auth(ChuyenMonForm, menus, pathname, permission)}
      />

      {/* Trường */}
      <Route
        path={`${match.url}/truong`}
        exact
        component={Auth(Truong, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/truong/them-moi`}
        exact
        component={Auth(TruongForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/truong/:id/chinh-sua`}
        exact
        component={Auth(TruongForm, menus, pathname, permission)}
      />

      {/* Hình thức đào tạo */}
      <Route
        path={`${match.url}/hinh-thuc-dao-tao`}
        exact
        component={Auth(HinhThucDaoTao, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hinh-thuc-dao-tao/them-moi`}
        exact
        component={Auth(HinhThucDaoTaoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hinh-thuc-dao-tao/:id/chinh-sua`}
        exact
        component={Auth(HinhThucDaoTaoForm, menus, pathname, permission)}
      />

      {/* Cấp độ nhân sự */}
      <Route
        path={`${match.url}/cap-do-nhan-su`}
        exact
        component={Auth(CapDoNhanSu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/cap-do-nhan-su/them-moi`}
        exact
        component={Auth(CapDoNhanSuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/cap-do-nhan-su/:id/chinh-sua`}
        exact
        component={Auth(CapDoNhanSuForm, menus, pathname, permission)}
      />

       {/* Loại giảng viên */}
       <Route
        path={`${match.url}/loai-giang-vien`}
        exact
        component={Auth(LoaiGiangVien, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-giang-vien/them-moi`}
        exact
        component={Auth(LoaiGiangVienForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-giang-vien/:id/chinh-sua`}
        exact
        component={Auth(LoaiGiangVienForm, menus, pathname, permission)}
      />

      {/* Kiến thức */}
      <Route
        path={`${match.url}/kien-thuc`}
        exact
        component={Auth(KienThuc, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/kien-thuc/them-moi`}
        exact
        component={Auth(KienThucForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/kien-thuc/:id/chinh-sua`}
        exact
        component={Auth(KienThucForm, menus, pathname, permission)}
      />

      {/* Giảng viên */}
      <Route
        path={`${match.url}/giang-vien`}
        exact
        component={Auth(GiangVien, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/giang-vien/them-moi`}
        exact
        component={Auth(GiangVienForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/giang-vien/:id/chinh-sua`}
        exact
        component={Auth(GiangVienForm, menus, pathname, permission)}
      />

      {/* Đơn vị đào tạo */}
      <Route
        path={`${match.url}/don-vi-dao-tao`}
        exact
        component={Auth(DonViDaoTao, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/don-vi-dao-tao/them-moi`}
        exact
        component={Auth(DonViDaoTaoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/don-vi-dao-tao/:id/chinh-sua`}
        exact
        component={Auth(DonViDaoTaoForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
