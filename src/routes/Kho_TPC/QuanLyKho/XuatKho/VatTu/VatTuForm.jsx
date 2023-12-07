import {
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  RollbackOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Button,
  Tag,
  Divider,
} from "antd";
import { includes, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  EditableTableRow,
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
import { useLocation } from "react-router-dom";
import ModalChonViTri from "./ModalChonViTri";
import ModalTuChoi from "./ModalTuChoi";

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
  const [listVatTu, setListVatTu] = useState([]);
  const [VatTu, setVatTu] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ActiveModalChonViTri, setActiveModalChonViTri] = useState(false);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [NgayYeuCau, setNgayYeuCau] = useState(
    moment(getDateNow(), "DD/MM/YYYY")
  );
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState([]);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getData();
        if (location.state) {
          const newData =
            location.state.phieuDNCVT && location.state.phieuDNCVT[0];
          setType("taophieuxuat");
          getPhieuDeNghiCVT(newData.length !== 0 && newData.id);
        } else {
          if (permission && permission.add) {
            setType("new");
            setFieldsValue({
              phieuxuatkhovattu: {
                ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
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
        if (permission && permission.view) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.view) {
          history.push("/home");
        }
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.cof) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.cof) {
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
    getUserLap(INFO, null);
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
          if (location.state) {
            setFieldsValue({
              phieuxuatkhovattu: {
                phieuDeNghiCapVatTu_Id: res.data.id,
                phongBan_Id: res.data.phongBan_Id,
                ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
                tenSanPham: res.data.tenSanPham,
              },
            });
          } else {
            setFieldsValue({
              phieuxuatkhovattu: {
                tenSanPham: res.data.tenSanPham,
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

  const getUserLap = (info, nguoiLap_Id) => {
    const params = convertObjectToUrlParams({
      id: nguoiLap_Id ? nguoiLap_Id : info.user_Id,
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${nguoiLap_Id ? nguoiLap_Id : info.user_Id}?${params}`,
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
          phieuxuatkhovattu: {
            userLapPhieu_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      }
    });
  };

  const getUserKy = (info) => {
    const params = convertObjectToUrlParams({
      donviId: info.donVi_Id,
      key: 1,
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
        setListUserKy(res.data);
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
          `lkn_PhieuXuatKhoVatTu/${id}?${params}`,
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
          getUserLap(
            INFO,
            res.data.userLapPhieu_Id && res.data.userLapPhieu_Id,
            1
          );
          res.data.tinhTrang !== "Chưa duyệt" &&
            !includes(match.url, "chi-tiet") &&
            setType("xacnhan");
          setFieldsValue({
            phieuxuatkhovattu: {
              ...res.data,
              ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
              ngayXuatKho: moment(res.data.ngayXuatKho, "DD/MM/YYYY"),
            },
          });
          const chiTiet =
            res.data.list_VatTus && JSON.parse(res.data.list_VatTus);

          const newData =
            chiTiet &&
            chiTiet.map((data) => {
              const lstViTri = data.list_ChiTietLuuKhos.map((vt) => ({
                ...vt,
                viTri: vt.tenNgan ? vt.tenNgan : vt.ke ? vt.ke : vt.tenKho,
              }));
              return {
                ...data,
                kho_Id: data.kho_Id,
                soLuongThucXuat: data.soLuongThucXuat,
                chiTiet_LuuVatTus: lstViTri,
              };
            });
          setListVatTu(newData.length > 0 && newData);
        }
      })
      .catch((error) => console.error(error));
  };

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
            ? `/${id}/xac-nhan`
            : type === "detail"
            ? `/${id}/chi-tiet`
            : `/${id}/xac-nhan`,
          ""
        )}`
      );
    }
  };

  // const deleteItemFunc = (item) => {
  //   const title = "vật tư";
  //   ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  // };

  // const deleteItemAction = (item) => {
  //   const newData = listVatTu.filter((d) => d.maVatTu !== item.maVatTu);
  //   setListVatTu(newData);
  //   setFieldTouch(true);
  // };

  // const actionContent = (item) => {
  //   const deleteItemVal =
  //     permission && permission.del && type === "new"
  //       ? { onClick: () => deleteItemFunc(item) }
  //       : { disabled: true };
  //   return (
  //     <div>
  //       <React.Fragment>
  //         <a {...deleteItemVal} title="Xóa">
  //           <DeleteOutlined />
  //         </a>
  //       </React.Fragment>
  //     </div>
  //   );
  // };

  const HandleChonViTri = (record, check) => {
    setActiveModalChonViTri(true);
    setVatTu({
      ...record,
      isCheck: check,
    });
  };

  const ThemViTri = (data) => {
    const newData = listVatTu.map((listvattu) => {
      if (listvattu.vatTu_Id.toLowerCase() === data.vatTu_Id.toLowerCase()) {
        if (data.soLuongThucXuat <= listvattu.soLuong) {
          return {
            ...listvattu,
            ...data,
          };
        } else {
          Helpers.alertError(
            `Số lượng xuất không được lớn hơn ${listvattu.soLuong}`
          );
        }
      }
      return listvattu;
    });
    setListVatTu(newData);
    setFieldTouch(true);
  };

  const renderLstViTri = (record) => {
    return (
      <div>
        {record.chiTiet_LuuVatTus.length > 0 ? (
          <div>
            {record.chiTiet_LuuVatTus.length !== 0 && (
              <div>
                {record.chiTiet_LuuVatTus.map((vt, index) => {
                  if (vt.viTri === "Kho vật tư XS") {
                    if (index === 0) {
                      return (
                        <Tag
                          key={index}
                          style={{ marginRight: 5, color: "#0469B9" }}
                        >
                          {vt.viTri} : {vt.SoLuong}
                        </Tag>
                      );
                    } else {
                      return null;
                    }
                  } else {
                    return (
                      <Tag
                        key={index}
                        style={{
                          marginRight: 5,
                          color: "#0469B9",
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {vt.viTri} : {vt.SoLuong}
                      </Tag>
                    );
                  }
                })}
              </div>
            )}
          </div>
        ) : (
          <Button
            icon={<CheckCircleOutlined />}
            className="th-margin-bottom-0"
            type="primary"
            onClick={() => HandleChonViTri(record, false)}
            disabled={record.kho_Id === null}
          >
            Chọn vị trí
          </Button>
        )}
      </div>
    );
  };

  const renderListKho = (record) => {
    return <span>{record.tenKho}</span>;
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
      title: "SL vật tư",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },

    {
      title: "Vị trí trong kho",
      key: "viTri",
      align: "center",
      render: (record) => renderLstViTri(record),
      width: 250,
    },
    {
      title: "Tổng SL kho xuất",
      dataIndex: "soLuongThucXuat",
      key: "soLuongThucXuat",
      align: "center",
    },
    // {
    //   title: "Ghi chú",
    //   dataIndex: "ghiChu",
    //   key: "ghiChu",
    //   align: "center",
    // },
    // {
    //   title: "Chức năng",
    //   key: "action",
    //   align: "center",
    //   width: 80,
    // render: (value) => actionContent(value),
    // },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
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
  });

  const onFinish = (values) => {
    saveData(values.phieuxuatkhovattu);
  };

  const saveAndClose = (value, isDuyet) => {
    if (isDuyet) {
      validateFields()
        .then((values) => {
          if (listVatTu.length === 0) {
            Helpers.alertError("Danh sách vật tư rỗng");
          } else {
            saveData(values.phieuxuatkhovattu, value);
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    } else {
      saveData(form.getFieldValue("phieuxuatkhovattu"), value, isDuyet);
    }
  };

  const saveData = (data, saveQuit = false, isDuyet = true) => {
    if (type === "edit") {
      const newData = {
        ...data,
        id: id,
        list_VatTus: listVatTu,
        lyDoTuChoi: !isDuyet ? "Từ chối" : undefined,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuXuatKhoVatTu/duyet/${id}`,
            "PUT",
            newData,
            !isDuyet ? "TUCHOI" : "XACNHAN",
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
            setType("xacnhan");
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận duyệt phiếu xuất kho",
    onOk: () => {
      saveAndClose(false, true);
    },
  };
  const modalDuyet = () => {
    Modal(prop);
  };
  const prop1 = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận từ chối phiếu xuất kho",
    onOk: () => {
      saveAndClose(false, false);
    },
  };
  const modalTuChoi = () => {
    Modal(prop1);
  };

  const handleRefeshModal = () => {
    goBack();
  };

  const formTitle =
    type === "edit" ? (
      <span>
        Xác nhận phiếu xuất kho vật tư -{" "}
        <Tag
          color={
            info.tinhTrang === "Chưa duyệt"
              ? "blue"
              : info.tinhTrang === "Đã bị từ chối"
              ? "red"
              : "success"
          }
          style={{ fontSize: "14px" }}
        >
          {info.maPhieuXuatKhoVatTu}
        </Tag>
        <Tag
          color={
            info.tinhTrang === "Chưa duyệt"
              ? "blue"
              : info.tinhTrang === "Đã bị từ chối"
              ? "red"
              : "success"
          }
          style={{ fontSize: "14px" }}
        >
          {info.tinhTrang}
        </Tag>
      </span>
    ) : (
      <span>
        Chi tiết phiếu xuất kho vật tư -{" "}
        <Tag
          color={
            info.tinhTrang === "Chưa duyệt"
              ? "blue"
              : info.tinhTrang === "Đã bị từ chối"
              ? "red"
              : "success"
          }
          style={{ fontSize: "14px" }}
        >
          {info.maPhieuXuatKhoVatTu}
        </Tag>
        <Tag
          color={
            info.tinhTrang === "Chưa duyệt"
              ? "blue"
              : info.tinhTrang === "Đã bị từ chối"
              ? "red"
              : "success"
          }
          style={{ fontSize: "14px" }}
        >
          {info.tinhTrang}
        </Tag>
      </span>
    );

  const handleSelectXuong = (val) => {
    setXuong(val);
    setFieldsValue({
      phieuxuatkhovattu: {
        phieuDeNghiCapVatTu_Id: null,
      },
    });
    setListVatTu([]);
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
                name={["phieuxuatkhovattu", "phongBan_Id"]}
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
                  disabled={type === "new" ? false : true}
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
                label="Ngày yêu cầu"
                name={["phieuxuatkhovattu", "ngayYeuCau"]}
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
                    setNgayYeuCau(moment(dateString, "DD/MM/YYYY"));
                    setListVatTu([]);
                    setFieldsValue({
                      phieuxuatkhovattu: {
                        phieuDeNghiCapVatTu_Id: null,
                      },
                    });
                  }}
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
                label="Phiếu đề nghị CVT"
                name={["phieuxuatkhovattu", "maPhieuDeNghiCapVatTu"]}
                rules={[
                  {
                    type: "string",
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
                label="Kho xuất"
                name={["phieuxuatkhovattu", "tenKho"]}
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
          </Row>
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
                  disabled={type === "edit" ? false : true}
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
                  disabled={type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            {/* <Col
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
                  disabled={type === "edit" ? false : true}
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
                  disabled={type === "edit" ? false : true}
                />
              </FormItem>
            </Col> */}
          </Row>
        </Form>
        {listVatTu.length !== 0 ? (
          <Table
            bordered
            columns={columns}
            scroll={{ x: 1300, y: "55vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(listVatTu)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
            // loading={loading}
          />
        ) : null}
        {type === "edit" ? (
          <>
            <Divider />
            <Row style={{ marginTop: 20 }}>
              <Col style={{ marginBottom: 8, textAlign: "center" }} span={24}>
                <Button
                  className="th-btn-margin-bottom-0"
                  icon={<RollbackOutlined />}
                  onClick={goBack}
                  style={{ marginTop: 10 }}
                >
                  Quay lại
                </Button>
                <Button
                  disabled={!fieldTouch}
                  className="th-btn-margin-bottom-0"
                  type="primary"
                  onClick={() => modalDuyet()}
                  icon={<SaveOutlined />}
                  style={{ marginTop: 10 }}
                >
                  Duyệt
                </Button>
                <Button
                  className="th-btn-margin-bottom-0"
                  icon={<CloseOutlined />}
                  style={{ marginTop: 10 }}
                  onClick={() => modalTuChoi()}
                >
                  Từ chối
                </Button>
              </Col>
            </Row>
          </>
        ) : null}
      </Card>
      <ModalChonViTri
        openModal={ActiveModalChonViTri}
        openModalFS={setActiveModalChonViTri}
        itemData={VatTu}
        ThemViTri={ThemViTri}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        itemData={info}
        refesh={handleRefeshModal}
      />
    </div>
  );
};

export default VatTuForm;
