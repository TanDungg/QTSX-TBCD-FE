import React, { useEffect, useState } from "react";
import { Empty, Layout, Modal as AntModal, Drawer, Space, Button } from "antd";
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
import {
  loadMenu,
  donViLoad,
  fetchStart,
  fetchReset,
} from "src/appRedux/actions";
import { Modal, Select } from "src/components/Common";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
  setLocalStorage,
} from "src/util/Common";
import {
  BellOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { confirm } = AntModal;

const Topbar = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { navStyle } = useSelector(({ settings }) => settings);
  const { navCollapsed, width } = useSelector(({ common }) => common).toJS();
  const { donvi } = useSelector(({ donvi }) => donvi);
  const [DonVi, setDonVi] = useState("");
  const [ListThongBao, setListThongBao] = useState([]);
  const [ThongBaoChuaXem, setThongBaoChuaXem] = useState(0);
  const [ShowThongBao, setShowThongBao] = useState(false);
  const MENUINFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };

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

  useEffect(() => {
    const fetchData = () => {
      if (MENUINFO.phanMem_Id) {
        getListThongBao();
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 60000);

    return () => {
      clearInterval(interval);
      dispatch(fetchReset());
    };
  }, []); 

  const getListThongBao = () => {
    let param = convertObjectToUrlParams({
      phanMem_Id: MENUINFO && MENUINFO.phanMem_Id,
      donVi_Id: MENUINFO && MENUINFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `ThongBaoHeThong?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        setListThongBao(res.data.list_ChiTiets);
        setThongBaoChuaXem(res.data.soLuongChuaXem);
      } else {
        setListThongBao([]);
        setThongBaoChuaXem(0);
      }
    });
  };

  const handleOnSelectDonVi = (val) => {
    setDonVi(val);
    const menu = getLocalStorage("menu");
    menu.donVi_Id = val;
    menu.tenPhanMem = "QUẢN LÝ NGUỒN NHÂN LỰC DOANH NGHIỆP (ERP)";
    menu.phanMem_Id = null;
    menu.Url = null;
    setLocalStorage("menu", menu);
    dispatch(loadMenu());
    dispatch(donViLoad());
    history.push("/home");
  };


  const handleXemThongBao = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `ThongBaoHeThong/danh-dau-da-xem/${id}`,
          "PUT",
          null,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status !== 409) {
        getListThongBao();
      }
    });
  };

  const XemThongBao = (thongbao) => {
    handleXemThongBao(thongbao.id);
    history.push({
      pathname: thongbao.duongDan,
    });
  };

  const handleDaXemTatCaThongBao = () => {
    const param = convertObjectToUrlParams({
      phanMem_Id: MENUINFO && MENUINFO.phanMem_Id,
      donVi_Id: MENUINFO && MENUINFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `ThongBaoHeThong/danh-dau-da-xem-tat-ca?${param}`,
          "PUT",
          null,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status !== 409) {
        getListThongBao();
      }
    });
  };

  const handleXoaTatCaThongBao = () => {
    const param = convertObjectToUrlParams({
      phanMem_Id: MENUINFO && MENUINFO.phanMem_Id,
      donVi_Id: MENUINFO && MENUINFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `ThongBaoHeThong/xoa-tat-ca?${param}`,
          "DELETE",
          null,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status !== 409) {
        getListThongBao();
      }
    });
  };

  const propXoaThongBao = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận xóa tất cả thông báo",
    onOk: handleXoaTatCaThongBao,
  };

  const modalXoaThongBao = () => {
    Modal(propXoaThongBao);
  };

  const handleXoaThongBao = (thongbao) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `ThongBaoHeThong/${thongbao.id}`,
          "DELETE",
          null,
          "",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getListThongBao();
        }
      })
      .catch((error) => console.error(error));
  };

  const ModalXoaThongBao = (thongbao) => {
    confirm({
      title: "Xóa thông báo!",
      icon: <ExclamationCircleOutlined />,
      content: `${thongbao.body}`,
      onOk() {
        handleXoaThongBao(thongbao);
      },
    });
  };

  const onClose = () => {
    setShowThongBao(false);
  };

  const title = (
    <span style={{ color: ThongBaoChuaXem !== 0 ? "#0469b9" : "" }}>
      Thông báo mới ({ThongBaoChuaXem})
    </span>
  );

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
        to={MENUINFO ? "/" + MENUINFO.Url : ""}
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
              style={{ width: 350 }}
              onSelect={handleOnSelectDonVi}
              value={DonVi}
              defaultValue={donvi.length > 0 && donvi[0].DonVi_Id}
              optionFilterProp={"name"}
              showSearch
            />
          </li>
        ) : null}
        {MENUINFO.phanMem_Id && (
          <li>
            <span
              style={{ cursor: "pointer", position: "relative" }}
              title="Xem thông báo"
            >
              <BellOutlined
                style={{
                  fontSize: 25,
                  color: !ThongBaoChuaXem ? "#c8c8c8" : "#0469b9",
                }}
                onClick={() => setShowThongBao(true)}
              />
              {ThongBaoChuaXem !== 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -17,
                    left: 17,
                    width: 25,
                    height: 25,
                    borderRadius: 20,
                    backgroundColor: "#ff4d4f",
                    color: "white",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {ThongBaoChuaXem}
                </span>
              )}
            </span>
          </li>
        )}
        <li className="gx-user-nav">
          <UserInfo isDesktop={width >= TAB_SIZE} />
        </li>
      </ul>
      <Drawer
        title={title}
        onClose={onClose}
        open={ShowThongBao}
        extra={
          <Space style={{ margin: 0 }}>
            <Button
              className="th-margin-bottom-0 btn-xem"
              onClick={() => handleDaXemTatCaThongBao()}
              disabled={ThongBaoChuaXem === 0}
            >
              Đánh dấu đã đọc
            </Button>
            <Button
              className="th-margin-bottom-0 btn-xoathongbao"
              onClick={() => modalXoaThongBao()}
              disabled={ListThongBao.length === 0}
            >
              Xóa tất cả
            </Button>
          </Space>
        }
      >
        {ListThongBao.length > 0 ? (
          ListThongBao.map((tb) => {
            const xoathongbao = {
              onClick: (e) => {
                e.stopPropagation();
                ModalXoaThongBao(tb);
              },
            };

            return (
              <div
                className="notification-title"
                onClick={() => XemThongBao(tb)}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "end",
                    gap: "5px",
                  }}
                >
                  <span
                    className="name"
                    style={{
                      color: tb.isDaXem === false ? "#0469b9" : "#545454",
                    }}
                  >
                    {tb.title}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <span
                    className="date"
                    style={{
                      color: tb.isDaXem === false ? "#0469b9" : "#545454",
                    }}
                  >
                    {tb.body}
                  </span>
                  <a
                    {...xoathongbao}
                    className="xoa-title"
                    title="Xóa thông báo"
                    style={{ fontSize: "15px" }}
                  >
                    <DeleteOutlined />
                  </a>
                </div>
                <span
                  style={{
                    textAlign: "right",
                    fontSize: "13px",
                  }}
                >
                  {tb.thoiGian}
                </span>
              </div>
            );
          })
        ) : (
          <Empty description={false} />
        )}
      </Drawer>
    </Header>
  );
};

export default Topbar;
