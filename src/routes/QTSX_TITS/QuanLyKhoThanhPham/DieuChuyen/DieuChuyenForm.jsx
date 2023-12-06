import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Card, Form, Input, Row, Col, DatePicker, Button, Tag } from "antd";
import { includes, isEmpty, map } from "lodash";
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
  ModalDeleteConfirm,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_DIEUCHUYEN_THANHLY } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalChonVatTu from "./ModalChonSanPham";
import ModalTuChoi from "./ModalTuChoi";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const DieuChuyenForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListKhoVatTuDi, setListKhoVatTuDi] = useState([]);
  const [KhoVatTuDi, setKhoVatTuDi] = useState(null);
  const [ListKhoVatTuDen, setListKhoVatTuDen] = useState([]);
  const [ListUserDuyet, setListUserDuyet] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ActiveModalChonVatTu, setActiveModalChonVatTu] = useState(null);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getData();
        if (permission && permission.add) {
          setType("new");
          setFieldsValue({
            phieudieuchuyenvattu: {
              ngay: moment(
                moment().format("DD/MM/YYYY HH:mm"),
                "DD/MM/YYYY HH:mm"
              ),
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
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getData = () => {
    getUserLap(INFO, null);
    getListKho();
    getUserDuyet(INFO);
  };

  const getListKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-vat-tu-tree`,
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
          setListKhoVatTuDi(res.data);
          setListKhoVatTuDen(res.data);
        } else {
          setListKhoVatTuDi([]);
          setListKhoVatTuDen([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getUserLap = (info, nguoiTao_Id) => {
    const params = convertObjectToUrlParams({
      id: nguoiTao_Id ? nguoiTao_Id : info.user_Id,
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${nguoiTao_Id ? nguoiTao_Id : info.user_Id}?${params}`,
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
          phieudieuchuyenvattu: {
            nguoiTao_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      }
    });
  };

  const getUserDuyet = (info) => {
    const params = convertObjectToUrlParams({
      donviId: info.donVi_Id,
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
        setListUserDuyet(res.data);
      } else {
        setListUserDuyet([]);
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
          `tits_qtsx_PhieuDieuChuyen/${id}`,
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
          setFieldsValue({
            phieudieuchuyenvattu: {
              ...res.data,
              ngay: moment(res.data.ngay, "DD/MM/YYYY HH:mm"),
            },
          });
          getListKho();
          getUserDuyet(INFO);
          setKhoVatTuDi(res.data.tits_qtsx_CauTrucKhoBegin_Id);
          getUserLap(INFO, res.data.nguoiTao_Id);

          const newData =
            res.data.list_ChiTiets &&
            JSON.parse(res.data.list_ChiTiets).map((data) => {
              const vitri = `${data.maKe ? `${data.maKe}` : ""}${
                data.maTang ? ` - ${data.maTang}` : ""
              }${data.maNgan ? ` - ${data.maNgan}` : ""}`;
              return {
                ...data,
                tits_qtsx_ChiTietKhoBegin_Id:
                  data.tits_qtsx_ChiTietKhoBegin_Id &&
                  data.tits_qtsx_ChiTietKhoBegin_Id.toLowerCase(),
                viTri: vitri,
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

  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatPham, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = ListVatTu.filter(
      (d) =>
        d.tits_qtsx_ChiTietKhoBegin_Id !== item.tits_qtsx_ChiTietKhoBegin_Id
    );
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

  const handleInputChange = (val, item) => {
    const soLuongDieuChuyen = val.target.value;
    if (isEmpty(soLuongDieuChuyen) || soLuongDieuChuyen === "0") {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (soLuongDieuChuyen > item.soLuongTonKho) {
      setFieldTouch(false);
      item.message = `Số lượng không được lớn hơn ${item.soLuongTonKho}`;
      setEditingRecord([...editingRecord, item]);
    } else {
      const newData = editingRecord.filter(
        (d) =>
          d.tits_qtsx_ChiTietKhoBegin_Id !== item.tits_qtsx_ChiTietKhoBegin_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListVatTu];
    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoBegin_Id === item.tits_qtsx_ChiTietKhoBegin_Id
      ) {
        ct.soLuong = soLuongDieuChuyen;
      }
    });
    setListVatTu(newData);
  };

  const renderSoLuongDieuChuyen = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (
        ct.tits_qtsx_ChiTietKhoBegin_Id === item.tits_qtsx_ChiTietKhoBegin_Id
      ) {
        isEditing = true;
        message = ct.message;
      }
    });
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
            borderColor: isEditing ? "red" : "",
          }}
          className={`input-item`}
          type="number"
          value={item.soLuong}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  const renderMoTa = (item) => {
    return (
      <Input
        style={{
          textAlign: "center",
          width: "100%",
        }}
        disabled={type === "new" || type === "edit" ? false : true}
        className={`input-item`}
        value={item.moTa}
        onChange={(val) => handleMoTa(val, item)}
      />
    );
  };

  const handleMoTa = (value, record) => {
    const ghichu = value.target.value;
    setFieldTouch(true);
    const newData = [...ListVatTu];
    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoBegin_Id === record.tits_qtsx_ChiTietKhoBegin_Id
      ) {
        ct.moTa = ghichu;
      }
    });
    setListVatTu(newData);
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatPham",
      key: "maVatPham",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatPham",
      key: "tenVatPham",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Vị trí",
      dataIndex: "viTri",
      key: "viTri",
      align: "center",
    },
    {
      title: "SL điều chuyển",
      key: "soLuong",
      align: "center",
      render: (record) => renderSoLuongDieuChuyen(record),
    },
    {
      title: "Mô tả",
      key: "moTa",
      align: "center",
      render: (record) => renderMoTa(record),
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

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.phieudieuchuyenvattu);
  };

  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        if (ListVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.phieudieuchuyenvattu, value);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (data, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...data,
        ngay: data.ngay.format("DD/MM/YYYY HH:mm"),
        isVatTu: true,
        list_ChiTiets: ListVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuDieuChuyen`,
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
              setFieldsValue({
                phieudieuchuyenvattu: {
                  ngay: moment(
                    moment().format("DD/MM/YYYY HH:mm"),
                    "DD/MM/YYYY HH:mm"
                  ),
                },
              });
              setListVatTu([]);
              getData();
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...data,
        id: id,
        ngay: data.ngay.format("DD/MM/YYYY HH:mm"),
        list_ChiTiets: ListVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuDieuChuyen/${id}`,
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
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuDieuChuyen/duyet/${id}`,
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
          getInfo(id);
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận phiếu điều chuyển vật tư",
    onOk: handleXacNhan,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const saveTuChoi = (data) => {
    const newData = {
      id: id,
      lyDoTuChoi: data,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuDieuChuyen/duyet/${id}`,
          "PUT",
          newData,
          "TUCHOI",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) getInfo(id);
      })
      .catch((error) => console.error(error));
  };

  const handleChonVatTu = () => {
    setActiveModalChonVatTu(true);
  };

  const handleThemVatTu = (data) => {
    const newListVatTu = [...ListVatTu, ...data];
    setListVatTu(newListVatTu);
    if (type === "edit") {
      setFieldTouch(true);
    }
  };

  const handleSelectKhoDi = (value) => {
    setKhoVatTuDi(value);
    setFieldsValue({
      phieudieuchuyenvattu: {
        tits_qtsx_CauTrucKhoEnd_Id: null,
      },
    });
    const newData = ListKhoVatTuDi.filter((d) => d.id !== value);
    setListKhoVatTuDen(newData);
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu điều chuyển vật tư "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu điều chuyển vật tư"
    ) : (
      <span>
        Chi tiết phiếu điều chuyển vật tư -{" "}
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
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
          style={{
            fontSize: "14px",
          }}
        >
          {info.tinhTrang}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_DIEUCHUYEN_THANHLY}
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
                name={["phieudieuchuyenvattu", "nguoiTao_Id"]}
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
                name={["phieudieuchuyenvattu", "tenPhongBan"]}
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
                label="Kho điều chuyển"
                name={["phieudieuchuyenvattu", "tits_qtsx_CauTrucKhoBegin_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhoVatTuDi ? ListKhoVatTuDi : []}
                  optionsvalue={["id", "tenCauTrucKho"]}
                  style={{ width: "100%" }}
                  placeholder="Kho điều chuyển"
                  showSearch
                  optionFilterProp={"name"}
                  onSelect={handleSelectKhoDi}
                  disabled={ListVatTu && ListVatTu.length === 0 ? false : true}
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
                label="Kho đến"
                name={["phieudieuchuyenvattu", "tits_qtsx_CauTrucKhoEnd_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhoVatTuDen ? ListKhoVatTuDen : []}
                  optionsvalue={["id", "tenCauTrucKho"]}
                  style={{ width: "100%" }}
                  placeholder="Kho nhận"
                  showSearch
                  optionFilterProp={"name"}
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
                name={["phieudieuchuyenvattu", "ngay"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY HH:mm"}
                  allowClear={false}
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
                label="Nội dung"
                name={["phieudieuchuyenvattu", "noiDung"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nội dung điều chuyển"
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
                label="Người nhận"
                name={["phieudieuchuyenvattu", "nguoiNhan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserDuyet}
                  placeholder="Chọn người nhận"
                  optionsvalue={["user_Id", "fullName"]}
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
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="PT bộ phận"
                name={["phieudieuchuyenvattu", "nguoiPTBoPhan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserDuyet}
                  placeholder="Chọn phụ trách bộ phận"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            {info.tinhTrang === "Đã từ chối" && (
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
                  label="Lý do từ chối"
                  name={["phieudieuchuyenvattu", "lyDoNguoiPTBoPhanTuChoi"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" disabled={true} />
                </FormItem>
              </Col>
            )}
          </Row>
        </Form>
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Danh sách vật tư"}
          headStyle={{
            textAlign: "center",
            backgroundColor: "#0469B9",
            color: "#fff",
          }}
        >
          {type === "new" || type === "edit" ? (
            <Row justify={"end"} style={{ padding: "0px 20px 10px 20px" }}>
              <Button
                icon={<PlusCircleOutlined />}
                className="th-margin-bottom-0"
                type="primary"
                onClick={handleChonVatTu}
                disabled={KhoVatTuDi === null ? true : false}
              >
                Chọn vật tư
              </Button>
            </Row>
          ) : null}
          <Table
            bordered
            columns={columns}
            scroll={{ x: 1300, y: "55vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(ListVatTu)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
            // loading={loading}
          />
        </Card>
        {type === "xacnhan" &&
        info.tinhTrang === "Chưa duyệt" &&
        info.nguoiPTBoPhan_Id === INFO.user_Id ? (
          <Row justify={"end"} style={{ marginTop: 15 }}>
            <Col style={{ marginRight: 15 }}>
              <Button type="primary" onClick={modalXK}>
                Xác nhận
              </Button>
            </Col>
            <Col style={{ marginRight: 15 }}>
              <Button type="danger" onClick={() => setActiveModalTuChoi(true)}>
                Từ chối
              </Button>
            </Col>
          </Row>
        ) : null}
        {type === "new" || type === "edit" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={onFinish}
            saveAndClose={saveAndClose}
            disabled={fieldTouch && ListVatTu.length !== 0}
          />
        ) : null}
      </Card>
      <ModalChonVatTu
        openModal={ActiveModalChonVatTu}
        openModalFS={setActiveModalChonVatTu}
        itemData={{
          tits_qtsx_CauTrucKhoBegin_Id: KhoVatTuDi,
          dataListVatPham: ListVatTu && ListVatTu,
        }}
        DataThemVatTu={handleThemVatTu}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
};

export default DieuChuyenForm;