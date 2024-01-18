import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const NotFound = asyncComponent(() => import("../../NotFound/NotFound"));

const BCNhapKho = asyncComponent(() => import("./NhapKho/NhapKho"));
const BCXuatKho = asyncComponent(() => import("./XuatKho/XuatKho"));
const BCDieuChuyen = asyncComponent(() => import("./DieuChuyen/DieuChuyen"));
const BCThanhLy = asyncComponent(() => import("./ThanhLy/ThanhLy"));
const BCTonKho = asyncComponent(() => import("./TonKho/TonKho"));
const DongBoCKD = asyncComponent(() => import("./DongBoCKD/DongBoCKD"));

const BCTienDoSanXuatGiaoHang = asyncComponent(() =>
  import("./TienDoSanXuatGiaoHang/TienDoSanXuatGiaoHang")
);
const BCGiaoHangTheoKeHoach = asyncComponent(() =>
  import("./GiaoHangTheoKeHoach/GiaoHangTheoKeHoach")
);
const BCTraCuuSanPham = asyncComponent(() =>
  import("./TraCuuSanPham/TraCuuSanPham")
);
const ThongKeDinhMucSanXuat = asyncComponent(() =>
  import("./ThongKeDinhMucSanXuat/ThongKeDinhMucSanXuat")
);
const SoSanhDinhMuc = asyncComponent(() =>
  import("./SoSanhDinhMuc/SoSanhDinhMuc")
);
const NhapXuatTon = asyncComponent(() => import("./NhapXuatTon/NhapXuatTon"));
const SoChiTietVatTu = asyncComponent(() =>
  import("./NhapXuatTon/SoChiTietVatTu")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/nhap-kho`}
        exact
        component={Auth(BCNhapKho, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho`}
        exact
        component={Auth(BCXuatKho, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen`}
        exact
        component={Auth(BCDieuChuyen, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly`}
        exact
        component={Auth(BCThanhLy, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ton-kho`}
        exact
        component={Auth(BCTonKho, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/tien-do-san-xuat-giao-hang`}
        exact
        component={Auth(BCTienDoSanXuatGiaoHang, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/giao-hang-theo-ke-hoach`}
        exact
        component={Auth(BCGiaoHangTheoKeHoach, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/tra-cuu-san-pham`}
        exact
        component={Auth(BCTraCuuSanPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thong-ke-dinh-muc-san-xuat`}
        exact
        component={Auth(ThongKeDinhMucSanXuat, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-sanh-dinh-muc`}
        exact
        component={Auth(SoSanhDinhMuc, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-xuat-ton`}
        exact
        component={Auth(NhapXuatTon, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dong-bo-ckd`}
        exact
        component={Auth(DongBoCKD, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-xuat-ton/so-chi-tiet-vat-tu`}
        exact
        component={Auth(SoChiTietVatTu, menus, pathname, permission)}
      />
      <Route path="*" component={Auth(NotFound, menus, pathname)} />
    </Switch>
  );
};

export default App;
