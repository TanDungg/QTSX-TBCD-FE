import React from "react";
import { Layout } from "antd";
import { useDispatch, useSelector } from "react-redux";
import UserInfo from "src/components/UserInfo";
import HorizontalNav from "../HorizontalNav";
import { Link } from "react-router-dom";
import { toggleCollapsedSideNav } from "src/appRedux/actions/Setting";

const { Header } = Layout;

const HorizontalDefault = () => {
  const dispatch = useDispatch();
  const { themeType } = useSelector(({ settings }) => settings);
  const { navCollapsed } = useSelector(({ common }) => common).toJS();
  const logo =
    themeType === "THEME_TYPE_DARK"
      ? require("assets/images/logo-industries.jpg")
      : require("assets/images/logo-industries.jpg");
  return (
    <div className="gx-header-horizontal">
      <Header className="gx-header-horizontal-main">
        <div className="gx-container">
          <div className="gx-header-horizontal-main-flex">
            <div className="gx-d-block gx-d-lg-none gx-linebar gx-mr-xs-3">
              <i
                className="gx-icon-btn icon icon-menu"
                onClick={() => {
                  dispatch(toggleCollapsedSideNav(!navCollapsed));
                }}
              />
            </div>
            <Link
              to="/home"
              className="gx-d-block gx-d-lg-none gx-pointer gx-w-logo"
            >
              <img
                height={36}
                width={160}
                alt=""
                src={require("assets/images/logo-492d5473.png")}
              />
            </Link>
            <Link
              to="/home"
              className="gx-d-none gx-d-lg-block gx-pointer gx-mr-xs-5 gx-logo"
            >
              <img height={36} width={160} alt="logoIndustries" src={logo} />
            </Link>

            <ul className="gx-header-notifications gx-ml-auto">
              {/* <li className="gx-user-nav">
                <Button>Phản hồi</Button>
              </li> */}
              <li className="gx-user-nav">
                <UserInfo />
              </li>
            </ul>
          </div>
        </div>
      </Header>
      <div className="gx-header-horizontal-nav gx-header-horizontal-nav-curve gx-d-none gx-d-lg-block">
        <div className="gx-container">
          <div className="gx-header-horizontal-nav-flex">
            <HorizontalNav />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalDefault;
