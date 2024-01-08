import { PlusCircleOutlined } from "@ant-design/icons";
import { Card, Form, Input, Row, Col, DatePicker, Tag, Divider } from "antd";
import { includes } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_170PX, SMRM_BANGIAO } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";

const FormItem = Form.Item;
const PhuKienVatTuGoc = [
  {
    key: "Tổng quan",
    value: null,
    soLuong: null,
    dieuKien: null,
    tinhTrang: null,
    soSeri: null,
    moTa: null,
  },
  {
    key: "Mâm - ốp(Bộ)",
    value: null,
    soLuong: null,
    dieuKien: null,
    tinhTrang: null,
    soSeri: null,
    moTa: null,
  },
  {
    key: "Bình điện",
    value: null,
    soLuong: null,
    dieuKien: null,
    tinhTrang: null,
    soSeri: null,
    moTa: null,
  },
  {
    key: "Máy lạnh",
    value: null,
    soLuong: null,
    dieuKien: null,
    tinhTrang: null,
    soSeri: null,
    moTa: null,
  },
  {
    key: "Radio, Mp3",
    value: null,
    soLuong: null,
    dieuKien: null,
    tinhTrang: null,
    soSeri: null,
    moTa: null,
  },
  {
    key: "Sổ bảo hành",
    value: null,
    soLuong: null,
    dieuKien: null,
    tinhTrang: null,
    soSeri: null,
    moTa: null,
  },
  {
    key: "Bộ đồ nghề tiêu chuẩn",
    value: null,
    soLuong: null,
    dieuKien: null,
    tinhTrang: null,
    soSeri: null,
    moTa: null,
  },
  {
    key: "Ticket",
    value: null,
    soLuong: null,
    dieuKien: null,
    tinhTrang: null,
    soSeri: null,
    moTa: null,
  },
  {
    key: "Kính, gương",
    value: null,
    soLuong: null,
    dieuKien: null,
    tinhTrang: null,
    soSeri: null,
    moTa: null,
  },
  {
    key: "Đèn, lái",
    value: null,
    soLuong: null,
    dieuKien: null,
    tinhTrang: null,
    soSeri: null,
    moTa: null,
  },
  {
    key: "Khác",
    value: null,
    soLuong: null,
    dieuKien: null,
    tinhTrang: null,
    soSeri: null,
    moTa: null,
  },
];

const BienBanBanGiaoXe = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListUser, setListUser] = useState([]);
  const [ListDonHang, setListDonHang] = useState([]);
  const [ListGiaoHang, setListGiaoHang] = useState([]);
  const [ListKhachHang, setListKhachHang] = useState([]);
  const [ListDaiDien, setListDaiDien] = useState([]);
  const [ListSoLo, setListSoLo] = useState([]);
  const [SoLo, setSoLo] = useState(null);
  const [VatTuKhac, setVatTuKhac] = useState(null);
  const [PhuKienVatTu, setPhuKienVatTu] = useState(PhuKienVatTuGoc);
  const [NoiDungBanGiao, setNoiDungBanGiao] = useState(true);
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});

  useEffect(() => {
    getListDonHang();
    getListKhachHang();
    getListDaiDien();
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getUserLap();
        setFieldsValue({
          bienbanbangiaoxe: {
            ngay: moment(getDateNow(), "DD/MM/YYYY"),
          },
        });
      } else if (permission && !permission.add) {
        history.push("/home");
      }
    } else if (includes(match.url, "chinh-sua")) {
      if (permission && permission.edit) {
        setType("edit");
        const { id } = match.params;
        setId(id);
        getInfo(id);
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    } else if (includes(match.url, "chi-tiet")) {
      if (permission && permission.edit) {
        setType("detail");
        const { id } = match.params;
        setId(id);
        getInfo(id);
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    } else if (includes(match.url, "xac-nhan")) {
      if (permission && permission.edit) {
        setType("xacnhan");
        const { id } = match.params;
        setId(id);
        getInfo(id);
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserLap = (nguoiTao_Id) => {
    const params = convertObjectToUrlParams({
      id: nguoiTao_Id ? nguoiTao_Id : INFO.user_Id,
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${nguoiTao_Id ? nguoiTao_Id : INFO.user_Id}?${params}`,
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
        setListUser([res.data]);
        setFieldsValue({
          bienbanbangiaoxe: {
            nguoiTao_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      } else {
      }
    });
  };

  const getListDonHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_DonHang?page=-1`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListDonHang(res.data);
        } else {
          setListDonHang([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListKhachHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KhachHang?page=-1`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListKhachHang(res.data);
          res.data.forEach((dt) => {
            if (dt.id === SMRM_BANGIAO) {
              setListGiaoHang([dt]);
              setFieldsValue({
                bienbanbangiaoxe: {
                  tits_qtsx_KhachHangBenGiao_Id: dt.id,
                  diaChi: dt.diaChi,
                },
              });
            }
          });
        } else {
          setListKhachHang([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDaiDien = () => {
    const params = convertObjectToUrlParams({
      donviId: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${params}&key=1`,
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
        setListDaiDien(res.data);
      } else {
        setListDaiDien([]);
      }
    });
  };

  const getListSoLo = (tits_qtsx_DonHang_Id) => {
    const param = convertObjectToUrlParams({ tits_qtsx_DonHang_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BienBanBanGiaoXe/list-ma-noi-bo-ban-giao-xe?${param}`,
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
        const newData =
          res.data &&
          res.data.map((dt) => {
            return {
              ...dt,
              soKhung: `${dt.tenSoLo} (${dt.maNoiBo})`,
            };
          });
        setListSoLo(newData);
      } else {
        setListSoLo([]);
      }
    });
  };

  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuNhapKhoThanhPham/${id}?donVi_Id=${INFO.donVi_Id}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setInfo(res.data);
          const newData =
            res.data.tits_qtsx_PhieuNhapKhoThanhPhamChiTiets &&
            JSON.parse(res.data.tits_qtsx_PhieuNhapKhoThanhPhamChiTiets).map(
              (data) => {
                return {
                  ...data,
                  soLuongChuaNhap: data.soLuongChuaNhap
                    ? data.soLuongChuaNhap
                    : 0,
                  thanhPham: `${data.tenThanhPham}${
                    data.tenMauSac ? ` (${data.tenMauSac})` : ""
                  }`,
                };
              }
            );
          setListSoLo(newData);
          getUserLap(res.data.nguoiTao_Id);

          setFieldsValue({
            bienbanbangiaoxe: {
              ...res.data,
              ngay: res.data.ngay ? moment(res.data.ngay, "DD/MM/YYYY") : null,
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new"
          ? "/them-moi"
          : type === "edit"
          ? `/${id}/chinh-sua`
          : type === "detail"
          ? `/${id}/chi-tiet`
          : `/${id}/xac-nhan`,
        ""
      )}`
    );
  };

  const onFinish = (values) => {
    saveData(values.bienbanbangiaoxe);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        saveData(values.bienbanbangiaoxe, val);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (bienbanbangiaoxe, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...bienbanbangiaoxe,
        tits_qtsx_DonHangChiTiet_Id: SoLo.tits_qtsx_DonHangChiTiet_Id,
        ngay: bienbanbangiaoxe.ngay.format("DD/MM/YYYY"),
        thongTinTaiXes: {
          taiXeVanChuyen: bienbanbangiaoxe.taiXeVanChuyen,
          bangLaiXe: bienbanbangiaoxe.bangLaiXe,
          soCCCD: bienbanbangiaoxe.soCCCD,
          noiCap: bienbanbangiaoxe.noiCap,
          ngayCap: bienbanbangiaoxe.ngayCap.format("DD/MM/YYYY"),
        },
        thongTinNguoiNhanTrucTieps: {
          nguoiNhanTrucTiep: bienbanbangiaoxe.nguoiNhanTrucTiep,
          chucVu: bienbanbangiaoxe.chucVu,
          sDT: bienbanbangiaoxe.sDT,
          diaChiNhanTrucTiep: bienbanbangiaoxe.diaChiNhanTrucTiep,
        },
        thongTinVatTuPhuKiens: PhuKienVatTu,
        thongTinVatTuPhuKienKhac: VatTuKhac,
      };
      console.log(newData);
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_BienBanBanGiaoXe`,
            "POST",
            newData,
            "ADD",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              getListDonHang();
              getListKhachHang();
              getListDaiDien();
              getListSoLo();
              setPhuKienVatTu(PhuKienVatTuGoc);
              setVatTuKhac([]);
              setFieldsValue({
                bienbanbangiaoxe: {
                  ngay: moment(getDateNow(), "DD/MM/YYYY"),
                },
              });
              setFieldTouch(false);
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...bienbanbangiaoxe,
        id: id,
        ngay: bienbanbangiaoxe.ngay.format("DD/MM/YYYY"),
        tits_qtsx_PhieuNhapKhoThanhPhamChiTiets: ListSoLo,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuNhapKhoThanhPham/${id}`,
            "PUT",
            newData,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (saveQuit) {
            if (res.status !== 409) goBack();
          } else {
            getInfo(id);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleChangeValue = (val, phukienvattu, key) => {
    if (key !== "khac") {
      const newData = [...PhuKienVatTu];
      newData.forEach((ct, index) => {
        if (ct.key === phukienvattu.key) {
          ct[key] = val.target.value;
        }
      });
      setPhuKienVatTu(newData);
    } else {
      setVatTuKhac(val.target.value);
    }
  };

  const handleSelectDonHang = (value) => {
    getListSoLo(value);
  };

  const handleSelectSoLo = (value) => {
    const solo = ListSoLo.forEach((sl) => sl.tits_qtsx_SoLo_Id === value);
    setSoLo(solo);
  };

  const formTitle =
    type === "new" ? (
      "Tạo biên bản bàn giao xe"
    ) : type === "edit" ? (
      "Chỉnh sửa biên bản bàn giao xe"
    ) : (
      <span>
        Chi tiết biên bản bàn giao xe -{" "}
        <Tag color={"blue"} style={{ fontSize: 15 }}>
          {info.maPhieu}
        </Tag>
        <Tag
          color={
            info.tinhTrang === "Chưa duyệt"
              ? "orange"
              : info.tinhTrang === "Đã duyệt"
              ? "blue"
              : "red"
          }
          style={{ fontSize: 15 }}
        >
          {info.tinhTrang}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin biên bản bàn giao xe"}
      >
        <Form
          {...DEFAULT_FORM_170PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Row>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Người nhập"
                name={["bienbanbangiaoxe", "nguoiTao_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUser ? ListUser : []}
                  optionsvalue={["Id", "fullName"]}
                  style={{ width: "100%" }}
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Ban/Phòng"
                name={["bienbanbangiaoxe", "tenPhongBan"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input className="input-item" disabled={true} />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Số yêu cầu giao xe"
                name={["bienbanbangiaoxe", "canCuYeuCauGiaoXe"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập căn cứ yêu cầu giao xe số"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Số"
                name={["bienbanbangiaoxe", "so"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Ngày nhập"
                name={["bienbanbangiaoxe", "ngay"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  disabled={true}
                  allowClear={false}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Đơn hàng"
                name={["bienbanbangiaoxe", "tits_qtsx_DonHang_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListDonHang}
                  placeholder="Chọn đơn hàng"
                  optionsvalue={["id", "tenDonHang"]}
                  style={{ width: "100%" }}
                  showSearch
                  onSelect={handleSelectDonHang}
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
          </Row>
          <Divider
            orientation="left"
            backgroundColor="none"
            style={{
              background: "none",
              fontWeight: "bold",
              marginTop: "0px",
              marginBottom: "15px",
            }}
          >
            BÊN GIAO
          </Divider>
          <Row>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="I. Bên giao"
                name={["bienbanbangiaoxe", "tits_qtsx_KhachHangBenGiao_Id"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListGiaoHang}
                  placeholder="Chọn bên giao"
                  optionsvalue={["id", "tenKhachHang"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Địa chỉ"
                name={["bienbanbangiaoxe", "diaChi"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input placeholder="Địa chỉ bên giao" disabled={true} />
              </FormItem>
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Đại diện"
                name={["bienbanbangiaoxe", "daiDienBenGiao_Id"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListDaiDien}
                  placeholder="Chọn đại diện bên giao"
                  optionsvalue={["id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Chức vụ"
                name={["bienbanbangiaoxe", "daiDienBenGiao_Id"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListDaiDien}
                  placeholder="Chức vụ đại diện bên giao"
                  optionsvalue={["id", "tenChucVu"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="SĐT"
                name={["bienbanbangiaoxe", "daiDienBenGiao_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListDaiDien}
                  placeholder="Số điện thoại đại diện bên giao"
                  optionsvalue={["id", "phoneNumber"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={true}
                />
              </FormItem>
            </Col>
          </Row>
          <Divider
            orientation="left"
            backgroundColor="none"
            style={{
              background: "none",
              fontWeight: "bold",
              marginTop: "0px",
              marginBottom: "15px",
            }}
          >
            BÊN VẬN CHUYỂN
          </Divider>
          <Row>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="II. Bên vận chuyển"
                name={[
                  "bienbanbangiaoxe",
                  "tits_qtsx_KhachHangBenVanChuyen_Id",
                ]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhachHang}
                  placeholder="Chọn bên vận chuyển"
                  optionsvalue={["id", "tenKhachHang"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Địa chỉ"
                name={[
                  "bienbanbangiaoxe",
                  "tits_qtsx_KhachHangBenVanChuyen_Id",
                ]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhachHang}
                  placeholder="Chọn bên vận chuyển"
                  optionsvalue={["id", "diaChi"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Đại diện"
                name={[
                  "bienbanbangiaoxe",
                  "tits_qtsx_KhachHangBenVanChuyen_Id",
                ]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhachHang}
                  placeholder="Người liên hệ bên vận chuyển"
                  optionsvalue={["id", "nguoiLienHe"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="SĐT"
                name={[
                  "bienbanbangiaoxe",
                  "tits_qtsx_KhachHangBenVanChuyen_Id",
                ]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhachHang}
                  placeholder="Số điện thoại bên vận chuyển"
                  optionsvalue={["id", "sDT"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Tài xế vận chuyển"
                name={["bienbanbangiaoxe", "taiXeVanChuyen"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập tên tài xế vận chuyển"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Bằng lái xe"
                name={["bienbanbangiaoxe", "bangLaiXe"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số bằng lái xe"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Ngày cấp"
                name={["bienbanbangiaoxe", "ngayCap"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  disabled={type === "new" || type === "edit" ? false : true}
                  allowClear={false}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="CCCD/CMND"
                name={["bienbanbangiaoxe", "soCCCD"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số CCCD/CMND"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Nơi cấp"
                name={["bienbanbangiaoxe", "noiCap"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập nơi cấp CCCD/CMND"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
          </Row>
          <Divider
            orientation="left"
            backgroundColor="none"
            style={{
              background: "none",
              fontWeight: "bold",
              marginTop: "0px",
              marginBottom: "15px",
            }}
          >
            BÊN NHẬN
          </Divider>
          <Row>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="III. Bên nhận"
                name={["bienbanbangiaoxe", "tits_qtsx_KhachHangBenNhan_Id"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhachHang}
                  placeholder="Chọn bên nhận"
                  optionsvalue={["id", "tenKhachHang"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Địa chỉ"
                name={["bienbanbangiaoxe", "tits_qtsx_KhachHangBenNhan_Id"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhachHang}
                  placeholder="Chọn bên vận chuyển"
                  optionsvalue={["id", "diaChi"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Đại diện"
                name={["bienbanbangiaoxe", "tits_qtsx_KhachHangBenNhan_Id"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhachHang}
                  placeholder="Người liên hệ bên vận chuyển"
                  optionsvalue={["id", "nguoiLienHe"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="SĐT"
                name={["bienbanbangiaoxe", "tits_qtsx_KhachHangBenNhan_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhachHang}
                  placeholder="Số điện thoại bên vận chuyển"
                  optionsvalue={["id", "sDT"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Người nhận"
                name={["bienbanbangiaoxe", "nguoiNhanTrucTiep"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập tên người nhận trực tiếp"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Chức vụ"
                name={["bienbanbangiaoxe", "chucVu"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập chức vụ"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="SĐT"
                name={["bienbanbangiaoxe", "sDT"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Địa chỉ nhận"
                name={["bienbanbangiaoxe", "diaChiNhanTrucTiep"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập địa chỉ nhận trực tiếp"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
          </Row>
          <Divider
            orientation="left"
            backgroundColor="none"
            style={{
              background: "none",
              fontWeight: "bold",
              marginTop: "0px",
              marginBottom: "15px",
            }}
          >
            NỘI DUNG BÀN GIAO
          </Divider>
          <Row>
            <Col
              xxl={12}
              xl={12}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <span style={{ width: "200px", fontWeight: "bold" }}>
                IV. Nội dung bàn giao:{" "}
              </span>
              <PlusCircleOutlined
                onClick={() => setNoiDungBanGiao(!NoiDungBanGiao)}
                style={{
                  fontSize: "16px",
                  color: NoiDungBanGiao ? "#0469B9" : "",
                  transition: "color 0.1s ease-in-out",
                }}
              />
            </Col>
          </Row>

          {NoiDungBanGiao && (
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              title={"Nội dung bàn giao"}
            >
              <Row>
                <Col
                  xxl={12}
                  xl={12}
                  lg={12}
                  md={12}
                  sm={24}
                  xs={24}
                  style={{ marginBottom: 8 }}
                >
                  <FormItem
                    label="Số khung"
                    name={["bienbanbangiaoxe", "tits_qtsx_SoLoChiTiet_Id"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn số lô xe"
                      className="heading-select slt-search th-select-heading"
                      data={ListSoLo ? ListSoLo : []}
                      optionsvalue={["tits_qtsx_SoLoChiTiet_Id", "soKhung"]}
                      showSearch
                      onSelect={handleSelectSoLo}
                      optionFilterProp="name"
                      style={{ width: "100%" }}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
                <Col
                  xxl={12}
                  xl={12}
                  lg={12}
                  md={12}
                  sm={24}
                  xs={24}
                  style={{ marginBottom: 8 }}
                >
                  <FormItem
                    label="Màu"
                    name={["bienbanbangiaoxe", "tits_qtsx_SoLoChiTiet_Id"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Màu sắc xe"
                      className="heading-select slt-search th-select-heading"
                      data={ListSoLo ? ListSoLo : []}
                      optionsvalue={["tits_qtsx_SoLoChiTiet_Id", "tenMauSac"]}
                      style={{ width: "100%" }}
                      disabled={true}
                    />
                  </FormItem>
                </Col>
                <Col
                  xxl={12}
                  xl={12}
                  lg={12}
                  md={12}
                  sm={24}
                  xs={24}
                  style={{ marginBottom: 8 }}
                >
                  <FormItem
                    label="Số máy"
                    name={["bienbanbangiaoxe", "soMay"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập số máy"
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
                <Col
                  xxl={12}
                  xl={12}
                  lg={12}
                  md={12}
                  sm={24}
                  xs={24}
                  style={{ marginBottom: 8 }}
                >
                  <FormItem
                    label="Thùng"
                    name={["bienbanbangiaoxe", "thung"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập thùng"
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
                <Col
                  xxl={12}
                  xl={12}
                  lg={12}
                  md={12}
                  sm={24}
                  xs={24}
                  style={{ marginBottom: 8 }}
                >
                  <FormItem
                    label="Số seri"
                    name={["bienbanbangiaoxe", "soSeri"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập số seri"
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
                <Col
                  xxl={12}
                  xl={12}
                  lg={12}
                  md={12}
                  sm={24}
                  xs={24}
                  style={{ marginBottom: 8 }}
                >
                  <FormItem
                    label="Tình trạng giao"
                    name={["bienbanbangiaoxe", "tinhTrang"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập tình trạng"
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
                <Col
                  xxl={12}
                  xl={12}
                  lg={12}
                  md={12}
                  sm={24}
                  xs={24}
                  style={{ marginBottom: 8 }}
                >
                  <FormItem
                    label="Vận chuyển"
                    name={["bienbanbangiaoxe", "phuongThucVanChuyen"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập phương thức vận chuyển"
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
              </Row>
              {PhuKienVatTu.length &&
                PhuKienVatTu.map((phukienvattu, index) => {
                  if (phukienvattu.key !== "Khác") {
                    return (
                      <Row>
                        <Col
                          xxl={6}
                          xl={6}
                          lg={8}
                          md={8}
                          sm={12}
                          xs={12}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "15px",
                          }}
                        >
                          <span style={{ width: "130px" }}>
                            {phukienvattu.key}
                          </span>
                          <Input
                            value={phukienvattu.value}
                            style={{ width: "calc(100% - 130px)" }}
                            onChange={(value) =>
                              handleChangeValue(value, phukienvattu, "value")
                            }
                          />
                        </Col>
                        <Col
                          xxl={3}
                          xl={3}
                          lg={3}
                          md={8}
                          sm={8}
                          xs={8}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "15px",
                          }}
                        >
                          <span style={{ width: "30px" }}>SL</span>
                          <Input
                            type="number"
                            value={phukienvattu.soLuong}
                            style={{ width: "calc(100% - 30px)" }}
                            onChange={(value) =>
                              handleChangeValue(value, phukienvattu, "soLuong")
                            }
                          />
                        </Col>
                        <Col
                          xxl={3}
                          xl={3}
                          lg={3}
                          md={8}
                          sm={8}
                          xs={8}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "15px",
                          }}
                        >
                          <span style={{ width: "40px" }}>D/K</span>
                          <Input
                            value={phukienvattu.dieuKien}
                            style={{ width: "calc(100% - 40px)" }}
                            onChange={(value) =>
                              handleChangeValue(value, phukienvattu, "dieuKien")
                            }
                          />
                        </Col>
                        <Col
                          xxl={4}
                          xl={4}
                          lg={6}
                          md={6}
                          sm={8}
                          xs={8}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "15px",
                          }}
                        >
                          <span style={{ width: "80px" }}>Tình trạng</span>
                          <Input
                            value={phukienvattu.tinhTrang}
                            style={{ width: "calc(100% - 80px)" }}
                            onChange={(value) =>
                              handleChangeValue(
                                value,
                                phukienvattu,
                                "tinhTrang"
                              )
                            }
                          />
                        </Col>
                        <Col
                          xxl={4}
                          xl={4}
                          lg={6}
                          md={6}
                          sm={8}
                          xs={8}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "15px",
                          }}
                        >
                          <span style={{ width: "60px" }}>Số seri</span>
                          <Input
                            value={phukienvattu.soSeri}
                            style={{ width: "calc(100% - 60px)" }}
                            onChange={(value) =>
                              handleChangeValue(value, phukienvattu, "soSeri")
                            }
                          />
                        </Col>
                        <Col
                          xxl={4}
                          xl={4}
                          lg={6}
                          md={6}
                          sm={8}
                          xs={8}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "15px",
                          }}
                        >
                          <span style={{ width: "70px" }}>Ghi chú</span>
                          <Input
                            value={phukienvattu.moTa}
                            style={{ width: "calc(100% - 70px)" }}
                            onChange={(value) =>
                              handleChangeValue(value, phukienvattu, "moTa")
                            }
                          />
                        </Col>
                      </Row>
                    );
                  } else {
                    return (
                      <Col
                        span={24}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "15px",
                        }}
                      >
                        <span style={{ width: "120px" }}>Các vật tư khác:</span>
                        <Input
                          value={VatTuKhac}
                          style={{ width: "calc(100% - 120px)" }}
                          onChange={(value) =>
                            handleChangeValue(value, null, "khac")
                          }
                        />
                      </Col>
                    );
                  }
                })}
            </Card>
          )}
        </Form>
      </Card>
      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={saveAndClose}
          saveAndClose={saveAndClose}
          disabled={fieldTouch}
        />
      ) : null}
    </div>
  );
};

export default BienBanBanGiaoXe;
