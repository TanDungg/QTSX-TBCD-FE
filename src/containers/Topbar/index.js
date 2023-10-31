import React, { useEffect, useState } from "react";
import { Layout } from "antd";
import { Link, useHistory } from "react-router-dom";

import { toggleCollapsedSideNav } from "src/appRedux/actions/Setting";
import UserInfo from "src/components/UserInfo";

import {
  NAV_STYLE_DRAWER,
  NAV_STYLE_FIXED,
  NAV_STYLE_MINI_SIDEBAR,
  TAB_SIZE,
} from "src/constants/ThemeSetting";
import { useDispatch, useSelector } from "react-redux";
import { loadMenu, donViLoad } from "src/appRedux/actions";
import { Select } from "src/components/Common";
import { getLocalStorage, setLocalStorage } from "src/util/Common";
const { Header } = Layout;
const Topbar = () => {
  const { navStyle } = useSelector(({ settings }) => settings);
  const { navCollapsed, width } = useSelector(({ common }) => common).toJS();
  // const { thongbao } = useSelector(({ thongbao }) => thongbao);
  const { donvi } = useSelector(({ donvi }) => donvi);
  const [DonVi, setDonVi] = useState("");
  const MENUINFO = getLocalStorage("menu");
  // const INFO = getTokenInfo();
  const history = useHistory();

  useEffect(() => {
    setDonVi(
      MENUINFO && MENUINFO.donVi_Id
        ? MENUINFO.donVi_Id
        : donvi.length > 0
        ? donvi[0].DonVi_Id
        : ""
    );
    const menuInfo = getLocalStorage("menu");
    if (menuInfo && !menuInfo.donVi_Id) {
      menuInfo.donVi_Id = donvi.length > 0 ? donvi[0].DonVi_Id : "";
      setLocalStorage("menu", menuInfo);
    }
  }, [donvi]);
  // const setDefaut = (user_Id, role_Id) => {
  //   const param = convertObjectToUrlParams({
  //     user_Id,
  //     role_Id,
  //   });
  //   dispatch(
  //     fetchStart(
  //       `PhanMem/default-phan-mem-for-user?${param}`,
  //       "POST",
  //       null,
  //       "DETAIL",
  //       ""
  //     )
  //   );
  // };
  // const renderThongBao = (
  //   thongbao.length > 0 ? (
  //     thongbao.map((tb) => {
  //       return (a
  //         <Link
  //           to={{
  //             pathname: tb.url,
  //           }}
  //           className="gx-notification"
  //           onClick={() => handleClick(tb.id)}
  //         >
  //           {tb.body}
  //         </Link>
  //       );
  //     })
  //   ) : (
  //   <Empty />
  // );
  // );
  const handleOnSelectDonVi = (val) => {
    setDonVi(val);
    const menu = getLocalStorage("menu");
    menu.donVi_Id = val;
    menu.tenPhanMem = "HỆ THỐNG QUẢN LÝ NGUỒN NHÂN LỰC DOANH NGHIỆP (ERP)";
    menu.phanMem_Id = null;
    menu.Url = null;
    setLocalStorage("menu", menu);
    dispatch(loadMenu());
    dispatch(donViLoad());
    history.push("/home");
  };
  const dispatch = useDispatch();
  // const content = (
  //   <div
  //     style={{
  //       width: "100%",
  //       display: "flex",
  //       flexDirection: "column",
  //       fontSize: 12,
  //     }}
  //   >
  //     {renderThongBao}
  //   </div>
  // );
  return (
    <Header>
      {navStyle === NAV_STYLE_DRAWER ||
      ((navStyle === NAV_STYLE_FIXED || navStyle === NAV_STYLE_MINI_SIDEBAR) &&
        width < TAB_SIZE) ? (
        <div className="gx-linebar gx-mr-3">
          <i
            className="gx-icon-btn icon icon-menu"
            onClick={() => {
              dispatch(toggleCollapsedSideNav(!navCollapsed));
            }}
          />
        </div>
      ) : null}
      <Link
        to={MENUINFO ? MENUINFO.Url : ""}
        className="gx-d-block gx-d-lg-none gx-pointer"
      >
        <img
          height={width > 450 ? 36 : 27}
          width={width > 450 ? 160 : 120}
          alt="logoIndustries"
          src={require("assets/images/logo-industries.jpg")}
        />
      </Link>
      {width >= TAB_SIZE ? (
        <div style={{ marginBottom: -8 }}>
          <h3>
            {MENUINFO && MENUINFO.tenPhanMem
              ? MENUINFO.tenPhanMem
              : "QUẢN LÝ NGUỒN NHÂN LỰC DOANH NGHIỆP (ERP)"}
          </h3>
        </div>
      ) : null}
      <ul className="gx-header-notifications gx-ml-auto">
        {width >= 1200 ? (
          <li>
            <Select
              className="heading-select slt-search th-select-heading"
              data={donvi}
              placeholder="Chọn đơn vị"
              optionsvalue={["DonVi_Id", "tenDonVi"]}
              style={{ width: 300 }}
              onSelect={handleOnSelectDonVi}
              value={DonVi}
              defaultValue={donvi.length > 0 && donvi[0].DonVi_Id}
              optionFilterProp={"name"}
              showSearch
            />
          </li>
        ) : null}

        <li className="gx-user-nav">
          <UserInfo isDesktop={width >= TAB_SIZE} />
        </li>
      </ul>
    </Header>
  );
};

export default Topbar;
