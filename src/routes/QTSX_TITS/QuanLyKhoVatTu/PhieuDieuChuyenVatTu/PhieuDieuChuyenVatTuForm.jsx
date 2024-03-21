import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  RollbackOutlined,
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
  ModalDeleteConfirm,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_DIEUCHUYEN_THANHLY } from "src/constants/Config";
import { getLocalStorage, getTokenInfo, reDataForTable } from "src/util/Common";
import ModalThemVatTu from "./ModalThemVatTu";
import ModalTuChoi from "./ModalTuChoi";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const PhieuDieuChuyenVatTuForm = ({ history, match, permission }) => {
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
  const [ActiveModalThemVatTu, setActiveModalThemVatTu] = useState(null);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);

  useEffect(() => {
    const load = () => {
      getListKho();
      getUserDuyet();
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getUserLap();
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

  const getListKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&&isThanhPham=false`,
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

  const getUserLap = (nguoiTao_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/${nguoiTao_Id ? nguoiTao_Id : INFO.user_Id}`,
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
            nguoiTao_Id: res.data.id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      }
    });
  };

  const getUserDuyet = () => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
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
        const newData = res.data.map((dt) => {
          return {
            ...dt,
            user: `${dt.maNhanVien} - ${dt.fullName}`,
          };
        });
        setListUserDuyet(newData);
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
          setKhoVatTuDi(res.data.tits_qtsx_CauTrucKhoBegin_Id);
          getUserLap(res.data.nguoiTao_Id);

          const chiTiet =
            res.data.list_ChiTiets && JSON.parse(res.data.list_ChiTiets);

          const newData =
            chiTiet &&
            chiTiet.map((data) => {
              const lstViTri =
                data.list_ViTriLuuKhos &&
                data.list_ViTriLuuKhos.map((vt) => {
                  const vitri = `${vt.maKe ? `${vt.maKe}` : ""}${
                    vt.maTang ? ` - ${vt.maTang}` : ""
                  }${vt.maNgan ? ` - ${vt.maNgan}` : ""}`;
                  return {
                    ...vt,
                    viTri: vitri ? vitri : null,
                  };
                });
              return {
                ...data,
                list_ViTriLuuKhos: lstViTri && lstViTri,
              };
            });
          setListVatTu(newData && newData);
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
      (data) =>
        item.tits_qtsx_VatPham_Id.toLowerCase() !==
        data.tits_qtsx_VatPham_Id.toLowerCase()
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

  const renderLstViTri = (record) => {
    return (
      <div>
        {record.list_ViTriLuuKhos &&
          record.list_ViTriLuuKhos.map((vt, index) => {
            if (!vt.viTri) {
              if (index === 0) {
                return (
                  <Tag
                    key={index}
                    color={"blue"}
                    style={{
                      marginRight: 5,
                      marginBottom: 3,
                      fontSize: 14,
                    }}
                  >
                    {`${vt.tenKho} (SL: ${vt.soLuongDieuChuyen})`}
                  </Tag>
                );
              } else {
                return null;
              }
            } else {
              return (
                <Tag
                  key={index}
                  color={"blue"}
                  style={{
                    marginRight: 5,
                    marginBottom: 3,
                    fontSize: 14,
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {`${vt.viTri} (SL: ${vt.soLuongDieuChuyen})`}
                </Tag>
              );
            }
          })}
      </div>
    );
  };

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
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
      width: 100,
    },
    {
      title: "SL điều chuyển",
      dataIndex: "soLuongDieuChuyen",
      key: "soLuongDieuChuyen",
      align: "center",
      width: 100,
    },
    {
      title: "Vị trí",
      key: "list_ViTriLuuKhos",
      align: "center",
      render: (record) => renderLstViTri(record),
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
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
          Helpers.alertError("Danh sách vật tư không được rỗng");
        } else {
          saveData(values.phieudieuchuyenvattu, value);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (phieudieuchuyenvattu, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...phieudieuchuyenvattu,
        ngay: phieudieuchuyenvattu.ngay.format("DD/MM/YYYY HH:mm"),
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
              setKhoVatTuDi(null);
              getListKho();
              getUserLap();
              getUserDuyet();
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...phieudieuchuyenvattu,
        id: id,
        ngay: phieudieuchuyenvattu.ngay.format("DD/MM/YYYY HH:mm"),
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

  const handleThemVatTu = () => {
    setActiveModalThemVatTu(true);
  };

  const handleThemVatPham = (data) => {
    const newListVatTu = [...ListVatTu, ...data];
    setListVatTu(newListVatTu);
    setFieldTouch(true);
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
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin phiếu điều chuyển vật tư"}
      >
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
                  optionsvalue={["id", "fullName"]}
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
                label="Kho nhận"
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
                  optionsvalue={["user_Id", "user"]}
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
                  optionsvalue={["user_Id", "user"]}
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
      </Card>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Danh sách vật tư"}
      >
        {type === "new" || type === "edit" ? (
          <Row justify={"end"} style={{ padding: "0px 20px 10px 20px" }}>
            <Button
              icon={<PlusCircleOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={handleThemVatTu}
              disabled={KhoVatTuDi === null ? true : false}
            >
              Thêm vật tư
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
        info.nguoiPTBoPhan_Id === INFO.user_Id && <Divider />}
      {type === "xacnhan" &&
      info.tinhTrang === "Chưa duyệt" &&
      info.nguoiPTBoPhan_Id === INFO.user_Id ? (
        <>
          <Divider />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            <Button
              icon={<RollbackOutlined />}
              className="th-margin-bottom-0"
              type="default"
              onClick={goBack}
            >
              Quay lại
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={modalXK}
            >
              Xác nhận
            </Button>
            <Button
              icon={<CloseCircleOutlined />}
              className="th-margin-bottom-0"
              type="danger"
              onClick={() => setActiveModalTuChoi(true)}
            >
              Từ chối
            </Button>
          </div>
        </>
      ) : null}
      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={onFinish}
          saveAndClose={saveAndClose}
          disabled={fieldTouch && ListVatTu.length !== 0}
        />
      ) : null}
      <ModalThemVatTu
        openModal={ActiveModalThemVatTu}
        openModalFS={setActiveModalThemVatTu}
        itemData={{
          tits_qtsx_CauTrucKhoBegin_Id: KhoVatTuDi,
          ListVatPham: ListVatTu && ListVatTu,
        }}
        DataThemVatPham={handleThemVatPham}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
};

export default PhieuDieuChuyenVatTuForm;
