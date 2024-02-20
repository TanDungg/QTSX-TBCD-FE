import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

/* Báo cáo học phí theo đăng ký đào tạo */
const HocPhiTheoDangKyDaoTao = asyncComponent(() =>
  import("./HocPhiTheoDangKyDaoTao/HocPhiTheoDangKyDaoTao")
);

/* Báo cáo học phí theo lớp học */
const HocPhiTheoLopHoc = asyncComponent(() =>
  import("./HocPhiTheoLopHoc/HocPhiTheoLopHoc")
);

/* Báo cáo học phí theo đơn vị */
const HocPhiTheoDonVi = asyncComponent(() =>
  import("./HocPhiTheoDonVi/HocPhiTheoDonVi")
);

/* Báo cáo học phí theo chuyên đề */
const HocPhiTheoChuyenDe = asyncComponent(() =>
  import("./HocPhiTheoChuyenDe/HocPhiTheoChuyenDe")
);

/* Báo cáo chuyên đề đào tạo */
const ChuyenDeDaoTao = asyncComponent(() =>
  import("./ChuyenDeDaoTao/ChuyenDeDaoTao")
);

/* Báo cáo học phí năm theo đơn vị */
const HocPhiNamTheoDonVi = asyncComponent(() =>
  import("./HocPhiNamTheoDonVi/HocPhiNamTheoDonVi")
);

/* Báo cáo đào tạo năm theo đơn vị */
const DaoTaoNamTheoDonVi = asyncComponent(() =>
  import("./DaoTaoNamTheoDonVi/DaoTaoNamTheoDonVi")
);

/* Báo cáo kết quả đào tạo theo tháng */
const KetQuaDaoTaoTheoThang = asyncComponent(() =>
  import("./KetQuaDaoTaoTheoThang/KetQuaDaoTaoTheoThang")
);

/* Báo cáo kết quả chuyên đề đào tạo theo tháng */
const KetQuaChuyenDeDaoTaoTheoThang = asyncComponent(() =>
  import("./KetQuaChuyenDeDaoTaoTheoThang/KetQuaChuyenDeDaoTaoTheoThang")
);

/* Báo cáo học chuyên đề đào tạo theo đơn vị */
const HocChuyenDeDaoTaoTheoDonVi = asyncComponent(() =>
  import("./HocChuyenDeDaoTaoTheoDonVi/HocChuyenDeDaoTaoTheoDonVi")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Báo cáo học phí theo đăng ký đào tạo */}
      <Route
        path={`${match.url}/hoc-phi-theo-dang-ky-dao-tao`}
        exact
        component={Auth(HocPhiTheoDangKyDaoTao, menus, pathname, permission)}
      />

      {/* Báo cáo học phí theo lớp học */}
      <Route
        path={`${match.url}/hoc-phi-theo-lop-hoc`}
        exact
        component={Auth(HocPhiTheoLopHoc, menus, pathname, permission)}
      />

      {/* Báo cáo học phí theo đơn vị */}
      <Route
        path={`${match.url}/hoc-phi-theo-don-vi`}
        exact
        component={Auth(HocPhiTheoDonVi, menus, pathname, permission)}
      />

      {/* Báo cáo học phí theo chuyên đề */}
      <Route
        path={`${match.url}/hoc-phi-theo-chuyen-de`}
        exact
        component={Auth(HocPhiTheoChuyenDe, menus, pathname, permission)}
      />

      {/* Báo cáo chuyên đề đào tạo*/}
      <Route
        path={`${match.url}/chuyen-de-dao-tao`}
        exact
        component={Auth(ChuyenDeDaoTao, menus, pathname, permission)}
      />

      {/* Báo cáo học phí năm theo đơn vị */}
      <Route
        path={`${match.url}/hoc-phi-nam-theo-don-vi`}
        exact
        component={Auth(HocPhiNamTheoDonVi, menus, pathname, permission)}
      />

      {/* Báo cáo đào tạo năm theo đơn vị */}
      <Route
        path={`${match.url}/dao-tao-nam-theo-don-vi`}
        exact
        component={Auth(DaoTaoNamTheoDonVi, menus, pathname, permission)}
      />

      {/* Báo cáo kết quả đào tạo theo tháng */}
      <Route
        path={`${match.url}/ket-qua-dao-tao-theo-thang`}
        exact
        component={Auth(KetQuaDaoTaoTheoThang, menus, pathname, permission)}
      />

      {/* Báo cáo kết quả chuyên đề đào tạo theo tháng */}
      <Route
        path={`${match.url}/ket-qua-chuyen-de-dao-tao-theo-thang`}
        exact
        component={Auth(KetQuaChuyenDeDaoTaoTheoThang, menus, pathname, permission)}
      />

      {/* Báo cáo học chuyên đề đào tạo theo đơn vị */}
      <Route
        path={`${match.url}/hoc-chuyen-de-dao-tao-theo-don-vi`}
        exact
        component={Auth(HocChuyenDeDaoTaoTheoDonVi, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
