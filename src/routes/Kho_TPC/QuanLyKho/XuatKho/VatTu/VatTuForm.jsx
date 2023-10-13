import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Button,
  Divider,
  Tag,
  Radio,
} from "antd";
import { includes, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState, useRef, useContext } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  EditableTableRow,
  ModalDeleteConfirm,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_DENGHI_CVT } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import { useLocation, useHistory } from "react-router-dom";
// import AddVatTuModal from "./AddVatTuModal";
// import ModalTuChoi from "./ModalTuChoi";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const VatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [ListXuong, setListXuong] = useState([]);
  const [Xuong, setXuong] = useState([]);
  const [ListPhieuDeNghiCVT, setListPhieuDeNghiCVT] = useState([]);
  const [listVatTu, setListVatTu] = useState([]);
  const [ListVatTuKhac, setListVatTuKhac] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [value, setValue] = useState(1);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [ActiveModal, setActiveModal] = useState(false);
  const [NgayXuatKho, setNgayXuatKho] = useState(
    moment(getDateNow(), "DD/MM/YYYY")
  );
  const [PhieuDeNghiCVT, setPhieuDeNghiCVT] = useState([]);

  const { validateFields, resetFields, setFieldsValue, getFieldValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getData();
        if (location.state) {
          const newData = location.state.itemData;
          setType("taophieuxuat");
          getPhieuDeNghiCVT(newData.id);
        } else {
          if (permission && permission.add) {
            setType("new");
            setFieldsValue({
              phieuxuatkhovattu: {
                ngayXuatKho: moment(getDateNow(), "DD/MM/YYYY"),
              },
            });
          } else if (permission && !permission.add) {
            history.push("/home");
          }
        }
      } else if (includes(match.url, "chinh-sua")) {
        if (permission && permission.edit) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.edit) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = () => {
    getUserKy(INFO);
    getUserLap(INFO, null, value);
    getXuong();
  };

  const getPhieuDeNghiCVT = (id) => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiCapVatTu/${id}?${params}`,
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
          setPhieuDeNghiCVT(res.data);
          setListVatTu(
            res.data.lst_ChiTietPhieuDeNghiCapVatTu &&
              JSON.parse(res.data.lst_ChiTietPhieuDeNghiCapVatTu)
          );
          if (location.state) {
            getListPhieuDeNghiCVT(
              res.data.xuongSanXuat_Id,
              res.data.ngayYeuCau
            );
            setFieldsValue({
              phieuxuatkhovattu: {
                phieuDeNghiCapVatTu_Id: res.data.id,
                xuongSanXuat_Id: res.data.xuongSanXuat_Id,
                ngayXuatKho: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
              },
            });
          }
        }
      })
      .catch((error) => console.error(error));
  };

  const getXuong = () => {
    const params = convertObjectToUrlParams({
      page: -1,
      donviid: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?${params}`,
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
        const xuong = [];
        res.data.forEach((x) => {
          if (x.tenPhongBan.toLowerCase().includes("xưởng")) {
            xuong.push(x);
          }
        });
        setListXuong(xuong);
      } else {
        setListXuong([]);
      }
    });
  };

  const getListPhieuDeNghiCVT = (phongBan_Id, ngayYeuCau) => {
    const params = convertObjectToUrlParams({
      phongBan_Id,
      ngayYeuCau,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuXuatKhoVatTu/list-phieu-de-nghi-cap-vat-tu-by-xuong-san-xuat?${params}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data.length > 0) {
        setListPhieuDeNghiCVT(res.data);
      } else {
        setListPhieuDeNghiCVT([]);
      }
    });
  };

  const getListVatTu = (phongBan_Id, lot) => {
    const dataForm =
      getFieldValue("phieuxuatkhovattu").ngaySanXuat._i.split("/");
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
      phongBan_Id,
      lot,
      ngay: dataForm[0],
      thang: dataForm[1],
      nam: dataForm[2],
      loaiKeHoach_Id: "27267ddf-652a-49a8-9570-73bb176d2e65",
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/list-san-pham-kh-theo-bom?${params}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data.length > 0) {
        const data = res.data[0].bom && JSON.parse(res.data[0].bom);
        const newData = [];
        data &&
          data.map((dt) => {
            dt.chiTietBOM &&
              dt.chiTietBOM.map((bom) => {
                newData.push({
                  lkn_DinhMucVatTu_Id: dt.id,
                  tenSanPham: dt.tenSanPham,
                  lkn_ChiTiet_Id: dt.chiTiet_Id,
                  tenChiTiet: dt.tenChiTiet,
                  soLuongKH: dt.soLuongKH,
                  soLuongChiTiet: dt.soLuongChiTiet,
                  vatTu_Id: bom.vatTu_Id,
                  maVatTu: bom.maVatTu,
                  tenVatTu: bom.tenVatTu,
                  soLuong: dt.soLuongKH * dt.soLuongChiTiet * bom.dinhMuc,
                  dinhMuc: bom.dinhMuc,
                  tenDonViTinh: bom.tenDonViTinh,
                  tenNhomVatTu: bom.tenNhomVatTu,
                  ghiChu: bom.ghiChu,
                });
              });
          });
        setListVatTu(newData);
      } else {
        setListVatTu([]);
      }
    });
  };

  const getUserLap = (info, nguoiLap_Id, value) => {
    const params = convertObjectToUrlParams({
      id: nguoiLap_Id ? nguoiLap_Id : info.user_Id,
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${info.user_Id}?${params}`,
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
        if (value === 1) {
          setFieldsValue({
            phieuxuatkhovattu: {
              userLapPhieu_Id: res.data.Id,
              tenPhongBan: res.data.tenPhongBan,
            },
          });
        } else {
          setFieldsValue({
            capvattukhac: {
              userLapPhieu_Id: res.data.Id,
              tenPhongBan: res.data.tenPhongBan,
            },
          });
        }
      } else {
      }
    });
  };

  const getUserKy = (info) => {
    const params = convertObjectToUrlParams({
      donviId: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${params}`,
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
        setListUserKy(res.data.datalist);
      } else {
        setListUserKy([]);
      }
    });
  };

  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiCapVatTu/${id}?${params}`,
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
          getXuong();
          getUserLap(INFO, res.data.userLapPhieu_Id, 1);
          setFieldsValue({
            phieuxuatkhovattu: {
              xuongSanXuat_Id: res.data.xuongSanXuat_Id,
              lot_Id: res.data.lot_Id,
              ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
              ngaySanXuat: moment(res.data.ngaySanXuat, "DD/MM/YYYY"),
              userNhan_Id: res.data.userNhan_Id,
              userDuyet_Id: res.data.userDuyet_Id,
              userKiemTra_Id: res.data.userKiemTra_Id,
            },
          });
          getListPhieuDeNghiCVT(res.data.xuongSanXuat_Id, res.data.ngaySanXuat);
          const chiTiet =
            res.data.lst_ChiTietPhieuDeNghiCapVatTu &&
            JSON.parse(res.data.lst_ChiTietPhieuDeNghiCapVatTu);
          const newData =
            chiTiet &&
            chiTiet.map((data) => {
              return {
                ...data,
                soLuongKH: data.soLuongKeHoach,
                dinhMuc: data.soLuongChiTiet,
              };
            });
          setListVatTu(newData);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Quay lại trang bộ phận
   *
   */
  const goBack = () => {
    if (type === "taophieuxuat") {
      history.push({
        pathname: `/quan-ly-kho-tpc/phieu-de-nghi-cap-vat-tu`,
      });
    } else {
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
    }
  };
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = listVatTu.filter((d) => d.maVatTu !== item.maVatTu);
    setListVatTu(newData);
    setFieldTouch(true);
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal =
      permission && permission.del && (type === "new" || type === "edit")
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "center",
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Số lượng vật tư",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
  ];

  let colValuesCapVatTuKhac = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },

    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Nhóm vật tư",
      dataIndex: "tenNhomVatTu",
      key: "tenNhomVatTu",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },

    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(
    PhieuDeNghiCVT.lot_Id !== null ? colValues : colValuesCapVatTuKhac,
    (col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          info: col.info,
        }),
      };
    }
  );

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    if (value === 1) {
      saveData(values.phieuxuatkhovattu);
    }
    if (value === 2) {
      saveData(values.capvattukhac);
    }
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        if (value === 1) {
          if (listVatTu.length === 0) {
            Helpers.alertError("Danh sách vật tư rỗng");
          } else {
            saveData(values.phieuxuatkhovattu, true);
          }
        }
        if (value === 2) {
          if (ListVatTuKhac.length === 0) {
            Helpers.alertError("Danh sách vật tư rỗng");
          } else {
            saveData(values.capvattukhac, true);
          }
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (data, saveQuit = false) => {
    if (type === "new" || type === "taophieuxuat") {
      const newData =
        value === 1
          ? {
              ...data,
              ngaySanXuat: data.ngaySanXuat._i,
              ngayYeuCau: data.ngayYeuCau._i,
              isLoaiPhieu: true,
              chiTiet_PhieuDeNghiCapVatTus: listVatTu,
            }
          : {
              ...data,
              ngayYeuCau: data.ngayYeuCau._i,
              isLoaiPhieu: false,
              chiTiet_PhieuDeNghiCapVatTus: ListVatTuKhac,
            };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDeNghiCapVatTu`,
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
              setFieldTouch(false);
              setListVatTu([]);
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData =
        value === 1
          ? {
              ...data,
              id: id,
              ngaySanXuat: data.ngaySanXuat._i,
              ngayYeuCau: data.ngayYeuCau._i,
              isLoaiPhieu: true,
              chiTiet_PhieuDeNghiCapVatTus: listVatTu,
            }
          : {
              ...data,
              id: id,
              ngayYeuCau: data.ngayYeuCau._i,
              isLoaiPhieu: false,
              chiTiet_PhieuDeNghiCapVatTus: ListVatTuKhac,
            };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDeNghiCapVatTu/${id}`,
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

  const handleXacNhan = () => {
    const newData = {
      id: id,
      isXacNhan: true,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiCapVatTu/xac-nhan/${id}`,
          "PUT",
          newData,
          "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          goBack();
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận phiếu đề nghị cấp vật tư",
    onOk: handleXacNhan,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const hanldeTuChoi = () => {
    setActiveModalTuChoi(true);
  };

  const formTitle =
    type === "new" || type === "taophieuxuat" ? (
      "Tạo phiếu xuất kho vật tư "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu xuất kho vật tư"
    ) : (
      <span>
        Chi tiết phiếu xuất kho vật tư -{" "}
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.maPhieu}
        </Tag>
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.tinhTrang}
        </Tag>
      </span>
    );

  const handleRefeshModal = () => {
    goBack();
  };

  const handleSelectXuong = (val) => {
    setXuong(val);
    setFieldsValue({
      phieuxuatkhovattu: {
        phieuDeNghiCapVatTu_Id: null,
      },
    });
    setListVatTu([]);
    getListPhieuDeNghiCVT(val, NgayXuatKho._i);
  };
  const handleSelectListVatTu = (val) => {
    getPhieuDeNghiCVT(val);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_DENGHI_CVT}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Row>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Người lập"
                name={["phieuxuatkhovattu", "userLapPhieu_Id"]}
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
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Ban/Phòng"
                name={["phieuxuatkhovattu", "tenPhongBan"]}
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
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Xưởng sản xuất"
                name={["phieuxuatkhovattu", "xuongSanXuat_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  placeholder="Xưởng sản xuất"
                  className="heading-select slt-search th-select-heading"
                  data={ListXuong ? ListXuong : []}
                  optionsvalue={["id", "tenPhongBan"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                  onSelect={handleSelectXuong}
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Ngày xuất kho"
                name={["phieuxuatkhovattu", "ngayXuatKho"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  onChange={(date, dateString) => {
                    getListPhieuDeNghiCVT(Xuong, dateString);
                    setNgayXuatKho(moment(dateString, "DD/MM/YYYY"));
                    setListVatTu([]);
                    setFieldsValue({
                      phieuxuatkhovattu: {
                        phieuDeNghiCapVatTu_Id: null,
                      },
                    });
                  }}
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Phiếu đề nghị CVT"
                name={["phieuxuatkhovattu", "phieuDeNghiCapVatTu_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListPhieuDeNghiCVT ? ListPhieuDeNghiCVT : []}
                  optionsvalue={["id", "maPhieuDeNghiCapVatTu"]}
                  style={{ width: "100%" }}
                  placeholder="Phiếu đề nghị cấp vật tư"
                  showSearch
                  optionFilterProp={"name"}
                  onSelect={handleSelectListVatTu}
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Kho xuất"
                name={["phieuxuatkhovattu", "kho_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListPhieuDeNghiCVT ? ListPhieuDeNghiCVT : []}
                  optionsvalue={["lot_Id", "soLot"]}
                  style={{ width: "100%" }}
                  placeholder="Kho xuất"
                  showSearch
                  optionFilterProp={"name"}
                  disabled={
                    type === "taophieuxuat" || type === "new" || type === "edit"
                      ? false
                      : true
                  }
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Lý do xuất"
                name={["phieuxuatkhovattu", "lyDoXuat"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập lý do xuất"
                  disabled={
                    type === "taophieuxuat" || type === "new" || type === "edit"
                      ? false
                      : true
                  }
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Người nhận"
                name={["phieuxuatkhovattu", "userNhan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy}
                  placeholder="Chọn người nhận"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={
                    type === "taophieuxuat" || type === "new" || type === "edit"
                      ? false
                      : true
                  }
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Người duyệt"
                name={["phieuxuatkhovattu", "userDuyet_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy}
                  placeholder="Chọn người duyệt"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={
                    type === "taophieuxuat" || type === "new" || type === "edit"
                      ? false
                      : true
                  }
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="PT Bộ phận"
                name={["phieuxuatkhovattu", "userPhuTrachBoPhan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy}
                  placeholder="Chọn người PT Bộ phận"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={
                    type === "taophieuxuat" || type === "new" || type === "edit"
                      ? false
                      : true
                  }
                />
              </FormItem>
            </Col>
            {info.lyDoHuy ? (
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem label="Lý do hủy">
                  <Input
                    className="input-item"
                    disabled={true}
                    value={info.lyDoHuy}
                  />
                </FormItem>
              </Col>
            ) : null}
          </Row>
        </Form>
        {listVatTu.length !== 0 ? (
          <Table
            bordered
            columns={columns}
            scroll={{ x: 900, y: "55vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(listVatTu)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
            // loading={loading}
          />
        ) : null}
        {type === "new" || type === "edit" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={onFinish}
            saveAndClose={saveAndClose}
            disabled={fieldTouch && listVatTu.length !== 0}
          />
        ) : null}
        {type === "xacnhan" && (
          <Row justify={"end"} style={{ marginTop: 15 }}>
            <Col style={{ marginRight: 15 }}>
              <Button type="primary" onClick={modalXK}>
                Xác nhận
              </Button>
            </Col>
            <Col style={{ marginRight: 15 }}>
              <Button danger onClick={hanldeTuChoi}>
                Từ chối
              </Button>
            </Col>
          </Row>
        )}
      </Card>
      {/* <AddVatTuModal
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        addVatTu={addVatTu}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        itemData={info}
        refesh={handleRefeshModal}
      /> */}
    </div>
  );
};

export default VatTuForm;
