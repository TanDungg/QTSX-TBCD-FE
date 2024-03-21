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

/* Hình thức đào tạo */
const HinhThucDaoTao = asyncComponent(() =>
  import("./HinhThucDaoTao/HinhThucDaoTao")
);
const HinhThucDaoTaoForm = asyncComponent(() =>
  import("./HinhThucDaoTao/HinhThucDaoTaoForm")
);

/* Loại giảng viên */
const LoaiGiangVien = asyncComponent(() =>
  import("./LoaiGiangVien/LoaiGiangVien")
);
const LoaiGiangVienForm = asyncComponent(() =>
  import("./LoaiGiangVien/LoaiGiangVienForm")
);

/* Kiến thức */
const KienThuc = asyncComponent(() => import("./KienThuc/KienThuc"));
const KienThucForm = asyncComponent(() => import("./KienThuc/KienThucForm"));

/* Giảng viên */
const GiangVien = asyncComponent(() => import("./GiangVien/GiangVien"));
const GiangVienForm = asyncComponent(() => import("./GiangVien/GiangVienForm"));

/* Đơn vị đào tạo */
const DonViDaoTao = asyncComponent(() => import("./DonViDaoTao/DonViDaoTao"));
const DonViDaoTaoForm = asyncComponent(() =>
  import("./DonViDaoTao/DonViDaoTaoForm")
);

/* Mục tiêu đào tạo */
const MucTieuDaoTao = asyncComponent(() =>
  import("./MucTieuDaoTao/MucTieuDaoTao")
);
const MucTieuDaoTaoForm = asyncComponent(() =>
  import("./MucTieuDaoTao/MucTieuDaoTaoForm")
);

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

      {/* Mục tiêu đào tạo */}
      <Route
        path={`${match.url}/muc-tieu-dao-tao`}
        exact
        component={Auth(MucTieuDaoTao, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/muc-tieu-dao-tao/them-moi`}
        exact
        component={Auth(MucTieuDaoTaoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/muc-tieu-dao-tao/:id/chinh-sua`}
        exact
        component={Auth(MucTieuDaoTaoForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
