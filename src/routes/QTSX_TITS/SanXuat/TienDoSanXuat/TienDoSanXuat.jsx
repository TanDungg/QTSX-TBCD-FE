import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Col,
  Row,
  Input,
  List,
  Upload,
  Image,
  Tag,
  Divider,
} from "antd";
import {
  ReloadOutlined,
  SelectOutlined,
  SendOutlined,
  QrcodeOutlined,
  FileTextOutlined,
  SaveFilled,
  CheckSquareOutlined,
  ToolOutlined,
  PlusOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Select, Toolbar } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  setLocalStorage,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import ModalKiemSoatVatTuLapRap from "./ModalKiemSoatVatTuLapRap";
import ModalKiemSoatChatLuong from "./ModalKiemSoatChatLuong";
import { isEmpty } from "lodash";
import ModalHoSoChatLuong from "./ModalHoSoChatLuong";
import Helpers from "src/helpers";
import ModalSuaChuaLai from "./ModalSuaChuaLai";
import ModalAddSoVIN from "./ModalAddSoVIN";
const optionsDate = {
  weekday: "long", // Thứ
  year: "numeric", // Năm
  month: "numeric", // Tháng
  day: "numeric", // Ngày
};

const optionsTime = {
  hour: "numeric", // Giờ
  minute: "numeric", // Phút
  second: "numeric", // Giây
  hour12: false, // 24 giờ
};
function TienDoSanXuat({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [ListXuong, setListXuong] = useState([]);
  const [ListChuyen, setListChuyen] = useState([]);
  const [ListTram, setListTram] = useState([]);
  const [Xuong, setXuong] = useState(null);
  const [Chuyen, setChuyen] = useState(null);
  const [Tram, setTram] = useState(null);
  const [SoLo, setSoLo] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [Message, setMessage] = useState();
  const [InfoSanPham, setInfoSanPham] = useState({});
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [ListSoKhungNoiBo, setListSoKhungNoiBo] = useState([]);
  const [ActiveModalKiemSoatVatTu, setActiveModalKiemSoatVatTu] =
    useState(false);
  const [ActiveSuaChuaLai, setActiveSuaChuaLai] = useState(false);
  const [ActiveAddSoVIN, setActiveAddSoVIN] = useState(false);

  const [ActiveModalHoSoChatLuong, setActiveModalHoSoChatLuong] =
    useState(false);
  const [ActiveKiemSoatChatLuong, setActiveKiemSoatChatLuong] = useState(false);
  const [FileHinhAnh, setFileHinhAnh] = useState(null);
  const [FileAnh, setFileAnh] = useState(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formattedDateTime = new Intl.DateTimeFormat(
    "vi-VN",
    optionsDate
  ).format(currentDateTime);
  const formattedTime = new Intl.DateTimeFormat("vi-VN", optionsTime).format(
    currentDateTime
  );
  useEffect(() => {
    if (permission && permission.view) {
      getXuongChuyenTram(undefined, "xuong");
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get list xưởng
   */
  const getXuongChuyenTram = (val, tenXuongChuyenTram) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_XuongChuyenTram_Id: val,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Mobile/get-list-phan-quyen-tram-theo-quyen-nguoi-dung?${params}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          if (tenXuongChuyenTram === "xuong") {
            setListXuong(res.data);
          } else if (tenXuongChuyenTram === "chuyen") {
            setListChuyen(res.data);
          } else if (tenXuongChuyenTram === "tram") {
            setListTram(res.data);
          }
        } else {
          if (tenXuongChuyenTram === "xuong") {
            setListXuong();
          } else if (tenXuongChuyenTram === "chuyen") {
            setListChuyen();
          } else if (tenXuongChuyenTram === "tram") {
            setListTram();
          }
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Xưởng Id
   * Get list chuyền
   * @param {*} chuyen_Id
   */
  const getChuyen = (xuong_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Chuyen?page=-1&&xuong_Id=${xuong_Id}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListChuyen(res.data);
        } else {
          setListChuyen([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Chuyền Id
   * Get list trạm
   * @param {*} chuyen_Id
   */
  const getTram = (chuyen_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Tram?page=-1&&chuyen_Id=${chuyen_Id}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListTram(res.data);
        } else {
          setListTram([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Trạm Id
   * Get list số khung nội bộ
   * @param {*} tram_Id
   * @param {*} keyword
   */
  const getSoKhunNoiBo = (tits_qtsx_Tram_Id, keyword) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Tram_Id,
      keyword,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/chuan-bi-vao-tram?${param}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListSoKhungNoiBo(res.data);
        } else {
          setListSoKhungNoiBo([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getInfoSanPham = (tits_qtsx_SoLoChiTiet_Id, tits_qtsx_Tram_Id) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Tram_Id,
      tits_qtsx_SoLoChiTiet_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/thong-tin-vao-tram?${param}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          ListTram.forEach((t) => {
            if (t.id === Tram) {
              res.data.tenTram = t.tenTram;
            }
          });
          setInfoSanPham(res.data);
        } else {
          setInfoSanPham({});
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Tìm kiếm người dùng
   */
  const onSearchSoKhung = () => {
    getSoKhunNoiBo(Tram, keyword);
  };
  /**
   * Thay đổi keyword
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getSoKhunNoiBo(Tram, val.target.value);
    }
  };
  const onChangeMessage = (val) => {
    setMessage(val.target.value);
  };
  const ClickVaoTram = () => {
    const param = convertObjectToUrlParams({
      tits_qtsx_TienDoSanXuat_Id: InfoSanPham.tits_qtsx_TienDoSanXuat_Id,
      tits_qtsx_CongDoan_Id: InfoSanPham.tits_qtsx_CongDoan_Id,
      tits_qtsx_SanPham_Id: InfoSanPham.tits_qtsx_SanPham_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/vao-tram?${param}`,
          "PUT",
          null,
          "VAOTRAM",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status === 200) {
          Helpers.alertSuccessMessage("Vào trạm thành công!!");
          getInfoSanPham(InfoSanPham.tits_qtsx_SoLoChiTiet_Id, Tram);
        } else {
        }
      })
      .catch((error) => console.error(error));
  };
  const ClickRaTram = () => {
    const param = convertObjectToUrlParams({
      tits_qtsx_TienDoSanXuat_Id: InfoSanPham.tits_qtsx_TienDoSanXuat_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/ra-tram?${param}`,
          "PUT",
          null,
          "VAOTRAM",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status === 200) {
          Helpers.alertSuccessMessage("Hoàn thành ra trạm thành công!!");
          getSoKhunNoiBo(Tram);
          setInfoSanPham({});
        }
      })
      .catch((error) => console.error(error));
  };
  const modalXacNhan = (ham, title) => {
    Modal({
      type: "confirm",
      okText: "Xác nhận",
      cancelText: "Hủy",
      title: `Xác nhận ${title}`,
      onOk: ham,
    });
  };

  const handleOnSelectXuong = (value) => {
    if (Xuong !== value) {
      setXuong(value);
      setChuyen(null);
      setTram(null);
      setInfoSanPham({});
      setListSoKhungNoiBo([]);
      getXuongChuyenTram(value, "chuyen");
    }
  };
  const handleOnSelectChuyen = (value) => {
    if (Chuyen !== value) {
      setChuyen(value);
      setTram(null);
      setInfoSanPham({});
      setListSoKhungNoiBo([]);
      getXuongChuyenTram(value, "tram");
    }
  };
  const handleOnSelectTram = (value) => {
    if (Tram !== value) {
      setTram(value);
      getSoKhunNoiBo(value);
    }
  };
  const handleClearXuong = () => {
    setXuong(null);
    setChuyen(null);
    setTram(null);
    setInfoSanPham({});
    setListSoKhungNoiBo([]);
  };
  const handleClearChuyen = () => {
    setChuyen(null);
    setTram(null);
    setInfoSanPham({});
    setListSoKhungNoiBo([]);
  };
  const handleClearTram = () => {
    setTram(null);
    setInfoSanPham({});
    setListSoKhungNoiBo([]);
  };
  const UploadHinhAnh = () => {
    if (FileHinhAnh) {
      const formData = new FormData();
      formData.append("file", FileHinhAnh);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          GuiGhiChu(data.path);
        })
        .catch(() => {
          console.log("upload failed.");
        });
    } else {
      GuiGhiChu();
    }
  };
  const GuiGhiChu = (path) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/post-chat-tdsx`,
          "POST",
          {
            tits_qtsx_TienDoSanXuat_Id: InfoSanPham.tits_qtsx_TienDoSanXuat_Id,
            noiDung: Message,
            hinhAnh: path && path,
          },
          "",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status === 200) {
          Helpers.alertSuccessMessage("Gửi ghi chú thành công!!");
          getInfoSanPham(SoLo, Tram);
          setMessage();
          setFileAnh();
          setFileHinhAnh();
        }
      })
      .catch((error) => console.error(error));
  };
  const props = {
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      setFileHinhAnh(file);
      const reader = new FileReader();
      reader.onload = (e) => setFileAnh(e.target.result);
      reader.readAsDataURL(file);
      return false;
    },
    showUploadList: false,
    maxCount: 1,
  };
  const uploadButton = (
    <div
      style={{
        cursor: "pointer",
        borderRadius: "10%",
        border: "1px dashed #d9d9d9",
        width: 100,
        height: 50,
        textAlign: "center",
      }}
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
          fontSize: 11,
        }}
      >
        Upload
      </div>
    </div>
  );
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={
          <>
            <p style={{ display: "inline" }}>Nhập tiến độ sản xuất</p>
            <a
              style={{
                cursor: "none",
                display: "inline",
                position: "absolute",
                right: 0,
                bottom: 0,
                fontSize: 15,
              }}
            >
              {formattedDateTime},{"  "} {formattedTime}
            </a>
          </>
        }
        description="Nhập tiến độ sản xuất"
      />
      <Card className="th-card-margin-bottom">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Xưởng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong ? ListXuong : []}
              placeholder="Chọn xưởng"
              optionsvalue={["tits_qtsx_XuongChuyenTram_Id", "ten"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectXuong}
              optionFilterProp="name"
              allowClear
              onClear={handleClearXuong}
              value={Xuong}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Chuyền:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListChuyen ? ListChuyen : []}
              placeholder="Chọn chuyền"
              optionsvalue={["tits_qtsx_XuongChuyenTram_Id", "ten"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectChuyen}
              optionFilterProp="name"
              allowClear
              onClear={handleClearChuyen}
              value={Chuyen}
              disabled={!Xuong}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Trạm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListTram ? ListTram : []}
              placeholder="Chọn trạm"
              optionsvalue={["tits_qtsx_XuongChuyenTram_Id", "ten"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectTram}
              optionFilterProp="name"
              allowClear
              onClear={handleClearTram}
              value={Tram}
              disabled={!Chuyen}
            />
          </Col>
          {/* <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
            align="center"
          >
            <br />
            <br />
            <a style={{ cursor: "none" }}>
              {formattedDateTime},{"  "} {formattedTime}
            </a>
          </Col> */}
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              style={{ minHeight: 390 }}
            >
              <h5 style={{ fontWeight: "bold", color: "#0469b9" }}>
                Xe chuẩn bị vào trạm:&nbsp;&nbsp;&nbsp;
                <a disabled={!Tram}>
                  <ReloadOutlined />
                </a>
              </h5>
              <Toolbar
                count={1}
                search={{
                  title: "Tìm kiếm",
                  loading,
                  value: keyword,
                  onChange: onChangeKeyword,
                  onPressEnter: onSearchSoKhung,
                  onSearch: onSearchSoKhung,
                  placeholder: "Nhập số khung nội bộ",
                  allowClear: true,
                  disabled: !Tram,
                }}
              />
              <List
                size="small"
                style={{ marginTop: 5, height: 280, overflow: "auto" }}
                bordered
                dataSource={ListSoKhungNoiBo}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      background:
                        InfoSanPham.maNoiBo === item.maNoiBo
                          ? "#e6f4ff"
                          : "#FFF",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (SoLo !== item.tits_qtsx_SoLoChiTiet_Id) {
                        setSoLo(item.tits_qtsx_SoLoChiTiet_Id);
                        getInfoSanPham(item.tits_qtsx_SoLoChiTiet_Id, Tram);
                      }
                    }}
                  >
                    <a>{item.maNoiBo}</a>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              style={{ minHeight: 390 }}
            >
              {/* <Empty /> */}
              <Row>
                <Col span={24} style={{ display: "flex", marginBottom: 8 }}>
                  <h5>Sản phẩm:</h5>
                  <h5 style={{ fontWeight: "bold", marginLeft: 20 }}>
                    {InfoSanPham.tenSanPham ? InfoSanPham.tenSanPham : ""}
                  </h5>
                </Col>
                <Col span={24} style={{ display: "flex", marginBottom: 8 }}>
                  <h5>Số khung nội bộ:</h5>
                  <h5 style={{ fontWeight: "bold", marginLeft: 20 }}>
                    {InfoSanPham.maNoiBo ? InfoSanPham.maNoiBo : ""}
                  </h5>
                </Col>
                <Col span={24} style={{ display: "flex", marginBottom: 8 }}>
                  <h5>Màu sơn:</h5>
                  <h5 style={{ fontWeight: "bold", marginLeft: 20 }}>
                    {InfoSanPham.tenMauSac ? InfoSanPham.tenMauSac : ""}
                  </h5>
                </Col>
                {InfoSanPham.thoiGianVaoTram && (
                  <Col span={24} style={{ display: "flex", marginBottom: 8 }}>
                    <h5>Thời gian vào trạm:</h5>
                    <h5 style={{ fontWeight: "bold", marginLeft: 20 }}>
                      {InfoSanPham.thoiGianVaoTram
                        ? InfoSanPham.thoiGianVaoTram
                        : ""}
                    </h5>
                  </Col>
                )}
              </Row>
            </Card>
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
            align="center"
          >
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              style={{ minHeight: 390 }}
            >
              {InfoSanPham.thoiGianVaoTram === "" ||
              !InfoSanPham.thoiGianVaoTram ? (
                <Button
                  icon={<SelectOutlined />}
                  type="primary"
                  style={{ width: "80%" }}
                  disabled={!InfoSanPham.maNoiBo}
                  onClick={() => modalXacNhan(ClickVaoTram, "vào trạm")}
                >
                  Vào trạm
                </Button>
              ) : (
                <>
                  <Button
                    icon={<PlusOutlined />}
                    type="primary"
                    style={{ width: "80%" }}
                    onClick={() => {
                      setActiveAddSoVIN(true);
                    }}
                  >
                    Thêm số VIN
                  </Button>
                  {/* <Button
                    icon={<SyncOutlined />}
                    type="primary"
                    style={{ width: "80%" }}
                    // disabled={DisableVaoTram}
                  >
                    Chuyển sửa chữa lại
                  </Button> */}
                  <Button
                    icon={<QrcodeOutlined />}
                    type="primary"
                    style={{ width: "80%" }}
                    onClick={() => {
                      setLocalStorage("inMa", [InfoSanPham]);
                      window.open(`${match.url}/in-ma-Qrcode`, "_blank");
                    }}
                  >
                    In Barcode
                  </Button>
                  {InfoSanPham && InfoSanPham.isCheckVatTu ? (
                    <Button
                      icon={<CheckSquareOutlined />}
                      type="primary"
                      style={{ width: "80%" }}
                      onClick={() => setActiveModalKiemSoatVatTu(true)}
                    >
                      Kiểm soát vật tư lắp ráp
                    </Button>
                  ) : null}
                  <Button
                    icon={<FileTextOutlined />}
                    type="primary"
                    style={{ width: "80%" }}
                    onClick={() => setActiveModalHoSoChatLuong(true)}
                  >
                    Xem hồ sơ chất lượng
                  </Button>
                  <Button
                    icon={<ToolOutlined />}
                    type="primary"
                    style={{ width: "80%" }}
                    disabled={
                      InfoSanPham.isSCL === null || InfoSanPham.isDaSCL
                        ? true
                        : false
                    }
                    onClick={() => setActiveSuaChuaLai(true)}
                  >
                    {InfoSanPham.isDaSCL === false
                      ? "Xác nhận sửa chữa lại"
                      : "Sửa chữa lại"}
                  </Button>
                  <Button
                    icon={<CheckSquareOutlined />}
                    type="primary"
                    style={{ width: "80%" }}
                    disabled={InfoSanPham.isKiemSoatChatLuong}
                    onClick={() => setActiveKiemSoatChatLuong(true)}
                  >
                    Kiểm soát chất lượng
                  </Button>
                  <Button
                    icon={<SaveFilled />}
                    type="primary"
                    style={{ width: "50%", margin: 0 }}
                    // disabled={DisableVaoTram}
                    onClick={() => modalXacNhan(ClickRaTram, "ra trạm")}
                  >
                    Hoàn tất
                  </Button>
                </>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row align="middle">
          <Col xxl={14} xl={14} lg={14} md={12} sm={24} xs={24}>
            <Input
              disabled={InfoSanPham.thoiGianVaoTram ? false : true}
              placeholder="Ghi chú"
              onChange={onChangeMessage}
              value={Message}
            ></Input>
          </Col>
          <Col xxl={2} xl={2} lg={2} md={2} sm={2} xs={2}>
            <Upload
              disabled={InfoSanPham.thoiGianVaoTram ? false : true}
              listType="picture-circle"
              {...props}
            >
              {FileAnh ? null : uploadButton}
            </Upload>
            {FileAnh && (
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    right: 0,
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                  onClick={() => {
                    setFileAnh();
                    setFileHinhAnh();
                  }}
                >
                  <CloseOutlined style={{ color: "blue" }} />
                </span>
                <Image width={100} height={50} src={FileAnh} />
              </div>
            )}
          </Col>

          <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
            <Button
              disabled={
                InfoSanPham.thoiGianVaoTram && (Message || FileHinhAnh)
                  ? false
                  : true
              }
              icon={<SendOutlined />}
              type="primary"
              onClick={UploadHinhAnh}
            >
              Gửi
            </Button>
          </Col>
        </Row>
        {InfoSanPham.list_tits_qtsx_TDSXChat &&
          InfoSanPham.list_tits_qtsx_TDSXChat.length > 0 && (
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              style={{
                marginTop: 10,
                overflow: "auto",
                maxHeight: 300,
              }}
            >
              {InfoSanPham.list_tits_qtsx_TDSXChat &&
                InfoSanPham.list_tits_qtsx_TDSXChat.map((chat) => {
                  return (
                    <Row
                      style={{
                        margin: "5px 10px",
                      }}
                      // justify={TOKENINFO.fullName === nd.nguoiPhanHoi ? "end" : "start"}
                    >
                      <Col
                        md={12}
                        sm={18}
                        xs={22}
                        style={{
                          marginBottom: 10,
                          wordWrap: "break-word",
                          backgroundColor: "#fff",
                          border: "1px solid #0469B9",
                          padding: 10,
                          borderRadius: 15,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            // justifyContent:
                            //   TOKENINFO.fullName === nd.nguoiPhanHoi ? "end" : "start",
                          }}
                        >
                          <Tag color={"blue"} style={{ marginBottom: 0 }}>
                            {chat.tenNguoiTao}
                          </Tag>
                          - {chat.tenTram} - {chat.ngayTao}
                        </div>
                        <Divider style={{ margin: "10px 0" }} />
                        <p style={{ marginBottom: 0 }}>{chat.noiDung}</p>
                        {chat.hinhAnh && (
                          <Image
                            width={200}
                            height={100}
                            src={`${BASE_URL_API}${chat.hinhAnh}`}
                          />
                        )}
                      </Col>
                    </Row>
                  );
                })}
            </Card>
          )}
      </Card>
      <ModalKiemSoatVatTuLapRap
        openModal={ActiveModalKiemSoatVatTu}
        openModalFS={setActiveModalKiemSoatVatTu}
        info={InfoSanPham}
        tits_qtsx_Tram_Id={Tram}
        refesh={() => getInfoSanPham(SoLo, Tram)}
      />
      <ModalHoSoChatLuong
        openModal={ActiveModalHoSoChatLuong}
        openModalFS={setActiveModalHoSoChatLuong}
        info={InfoSanPham}
      />
      <ModalKiemSoatChatLuong
        openModal={ActiveKiemSoatChatLuong}
        openModalFS={setActiveKiemSoatChatLuong}
        info={InfoSanPham}
        refesh={() => getInfoSanPham(SoLo, Tram)}
      />
      <ModalSuaChuaLai
        openModal={ActiveSuaChuaLai}
        openModalFS={setActiveSuaChuaLai}
        info={InfoSanPham}
        refesh={() => getInfoSanPham(SoLo, Tram)}
      />
      <ModalAddSoVIN
        openModal={ActiveAddSoVIN}
        openModalFS={setActiveAddSoVIN}
        refesh={() => getInfoSanPham(SoLo, Tram)}
        tits_qtsx_SoLo_Id={InfoSanPham.tits_qtsx_SoLo_Id}
        tits_qtsx_SoLoChiTiet_Id={InfoSanPham.tits_qtsx_SoLoChiTiet_Id}
        soVIN={
          InfoSanPham.maSoVin && InfoSanPham.tits_qtsx_SoVin_Id
            ? {
                maSoVin: InfoSanPham.maSoVin,
                tits_qtsx_SoVin_Id: InfoSanPham.tits_qtsx_SoVin_Id,
              }
            : null
        }
      />
    </div>
  );
}

export default TienDoSanXuat;
