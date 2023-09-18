import React from "react";
import { Avatar, Popover, Button } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import IntlMessages from "src/util/IntlMessages";
import { logOut, getTokenInfo } from "src/util/Common";
// import { useHistory } from "react-router-dom";
const UserInfo = ({ isDesktop, color }) => {
  const userInfo = getTokenInfo();
  // const history = useHistory();
  const userMenuOptions = (
    <ul className="gx-user-popover">
      <li>
        <Link
          to={"/ung-dung"}
          className="ant-btn ant-btn-link"
          style={{ margin: 0 }}
        >
          <AppstoreOutlined /> <IntlMessages id="user.app" />
        </Link>
      </li>
      <li>
        <Link
          to={"/tai-khoan"}
          className="ant-btn ant-btn-link"
          style={{ margin: 0 }}
        >
          <UserOutlined /> <IntlMessages id="user.account" />
        </Link>
      </li>
      <li onClick={() => logOut()}>
        <Button type="link" style={{ margin: 0 }}>
          <LogoutOutlined /> <IntlMessages id="user.logout" />
        </Button>
      </li>
    </ul>
  );

  return (
    <div className="gx-flex-row gx-align-items-center gx-avatar-row">
      <Popover
        placement="bottomRight"
        content={userMenuOptions}
        trigger="click"
      >
        {isDesktop && (
          <Avatar
            src={userInfo ? userInfo.hinhAnhUrl : null}
            icon={userInfo && userInfo.hinhAnhUrl ? null : <UserOutlined />}
            className="gx-size-40 gx-pointer gx-mr-3"
            alt="avatar"
          />
        )}
        <span className="gx-avatar-name" style={color ? { color } : {}}>
          {userInfo ? userInfo.fullName : ""}
          <i className="icon icon-chevron-down gx-fs-xxs gx-ml-2" />
        </span>
      </Popover>
    </div>
  );
};

export default UserInfo;
