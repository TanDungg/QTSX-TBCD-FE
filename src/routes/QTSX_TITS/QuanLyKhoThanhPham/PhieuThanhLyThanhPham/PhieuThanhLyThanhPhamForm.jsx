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
  Image,
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
import {
  BASE_URL_API,
  DEFAULT_FORM_DIEUCHUYEN_THANHLY,
} from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTimeNow,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalThemVatPham from "./ModalThemVatPham";
import ModalTuChoi from "./ModalTuChoi";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const ThanhLyThanhPhamForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});
  const [ListKhoThanhPham, setListKhoThanhPham] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListVatPham, setListVatPham] = useState([]);
  const [KhoThanhPham, setKhoThanhPham] = useState(null);
  const [ActiveModalThemVatPham, setActiveModalThemVatPham] = useState(null);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getUserLap(null);
        getUserKy();
        getListKho();
        if (permission && permission.add) {
          setType("new");
          setFieldsValue({
            phieuthanhly: {
              ngay: moment(
                getDateNow() + " " + getTimeNow(),
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

  const getUserKy = () => {
    const params = convertObjectToUrlParams({
      donviId: INFO.donVi_Id,
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
  const getListKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&isThanhPham=true`,
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
          setListKhoThanhPham(res.data);
        } else {
          setListKhoThanhPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getUserLap = (nguoiLap_Id) => {
    const params = convertObjectToUrlParams({
      id: nguoiLap_Id ? nguoiLap_Id : INFO.user_Id,
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${nguoiLap_Id ? nguoiLap_Id : INFO.user_Id}?${params}`,
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
          phieuthanhly: {
            userLap_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      }
    });
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuThanhLy/${id}?isVatTu=false`,
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
          getUserKy();
          getUserLap(res.data.userLap_Id, 1);
          getListKho();
          setKhoThanhPham(res.data.tits_qtsx_CauTrucKho_Id);
          setFieldsValue({
            phieuthanhly: {
              ...res.data,
              ngay: moment(res.data.ngay, "DD/MM/YYYY HH:mm"),
              tits_qtsx_CauTrucKho_Id: res.data.tits_qtsx_CauTrucKho_Id,
            },
          });

          const newData =
            res.data.tits_qtsx_PhieuThanhLyChiTiets &&
            JSON.parse(res.data.tits_qtsx_PhieuThanhLyChiTiets).map((data) => {
              return {
                ...data,
                thanhPham: `${data.tenVatPham}${
                  data.tenMauSac ? ` (${data.tenMauSac})` : ""
                }`,
              };
            });
          setListVatPham(newData);
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

  const deleteItemFunc = (item) => {
    const title = "thành phẩm";
    ModalDeleteConfirm(deleteItemAction, item, item.thanhPham, title);
  };

  const deleteItemAction = (item) => {
    const newData = ListVatPham.filter((d) => d.thanhPham !== item.thanhPham);
    setListVatPham(newData);
    setFieldTouch(true);
  };

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
        {record.list_ViTriLuuKhos.map((vt, index) => {
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
                  {`${vt.tenKho} (SL: ${vt.soLuongThanhLy})`}
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
                {`${vt.viTri} (SL: ${vt.soLuongThanhLy})`}
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
      title: "Mã thành phẩm",
      dataIndex: "maVatPham",
      key: "maVatPham",
      align: "center",
    },
    {
      title: "Tên thành phẩm",
      dataIndex: "tenVatPham",
      key: "tenVatPham",
      align: "center",
    },
    {
      title: "Màu sắc",
      dataIndex: "tenMauSac",
      key: "tenMauSac",
      align: "center",
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      width: 100,
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ maxWidth: 70, maxHeight: 70 }}
            />
          </span>
        ),
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 100,
    },
    {
      title: "SL thanh lý",
      dataIndex: "soLuongThanhLy",
      key: "soLuongThanhLy",
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
      title: "Đề xuất",
      dataIndex: "deXuat",
      key: "deXuat",
      align: "center",
    },
    {
      title: "Nguyên nhân",
      dataIndex: "nguyenNhan",
      key: "nguyenNhan",
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

  const onFinish = (values) => {
    saveData(values.phieuthanhly);
  };

  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        if (ListVatPham.length === 0) {
          Helpers.alertError("Danh sách thành phẩm không được rỗng");
        } else {
          saveData(values.phieuthanhly, value);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (phieuthanhly, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...phieuthanhly,
        ngay: phieuthanhly.ngay.format("DD/MM/YYYY HH:mm"),
        isVatTu: false,
        tits_qtsx_PhieuThanhLyChiTiets: ListVatPham,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuThanhLy`,
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
              setListVatPham([]);
              getUserLap();
              getUserKy();
              getListKho();
              setFieldsValue({
                phieuthanhly: {
                  ngay: moment(
                    getDateNow() + " " + getTimeNow(),
                    "DD/MM/YYYY HH:mm"
                  ),
                },
              });
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...phieuthanhly,
        id: id,
        ngay: phieuthanhly.ngay.format("DD/MM/YYYY HH:mm"),
        isVatTu: false,
        tits_qtsx_PhieuThanhLyChiTiets: ListVatPham,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuThanhLy/${id}`,
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
          if (res && res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              setFieldTouch(false);
              getInfo(id);
            }
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const handleXacNhan = () => {
    const newData = {
      id: id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuThanhLy/xac-nhan/${id}`,
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
    title: "Xác nhận phiếu thanh lý thành phẩm",
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
          `tits_qtsx_PhieuThanhLy/xac-nhan/${id}`,
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
    setActiveModalThemVatPham(true);
  };

  const DataThemVatPham = (data) => {
    const newListVatPham = [...ListVatPham, ...data];
    setListVatPham(newListVatPham);
    setFieldTouch(true);
  };

  const handleSelectKhoThanhLy = (value) => {
    setKhoThanhPham(value);
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu thanh lý thành phẩm "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu thanh lý thành phẩm"
    ) : (
      <span>
        Chi tiết phiếu thanh lý thành phẩm -{" "}
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.maPhieu}
        </Tag>
        <Tag
          color={
            info.tinhTrang === "Chưa xác nhận"
              ? "orange"
              : info.tinhTrang === "Đã xác nhận"
              ? "blue"
              : "red"
          }
          style={{ fontSize: "14px" }}
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
        title={"Thông tin phiếu thanh lý thành phẩm"}
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
                name={["phieuthanhly", "userLap_Id"]}
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
                name={["phieuthanhly", "tenPhongBan"]}
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
                label="Kho thanh lý"
                name={["phieuthanhly", "tits_qtsx_CauTrucKho_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhoThanhPham ? ListKhoThanhPham : []}
                  optionsvalue={["id", "tenCauTrucKho"]}
                  style={{ width: "100%" }}
                  placeholder="Kho thanh lý"
                  showSearch
                  optionFilterProp={"name"}
                  onSelect={handleSelectKhoThanhLy}
                  disabled={
                    ListVatPham &&
                    ListVatPham.length === 0 &&
                    (type === "new" || type === "edit")
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
                label="Ngày thanh lý"
                name={["phieuthanhly", "ngay"]}
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
                name={["phieuthanhly", "noiDung"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input
                  placeholder="Nhập nội dung thanh lý"
                  disabled={type === "new" || type === "edit" ? false : true}
                ></Input>
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
                label="Trưởng bộ phận"
                name={["phieuthanhly", "nguoiTruongBoPhan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy ? ListUserKy : []}
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  placeholder="Trưởng bộ phận"
                  showSearch
                  optionFilterProp={"name"}
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
                label="Duyệt BP kế toán"
                name={["phieuthanhly", "nguoiBPKeToanDuyet_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy ? ListUserKy : []}
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  placeholder="Duyệt BP kế toán"
                  showSearch
                  optionFilterProp={"name"}
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
                label="Phòng R&D"
                name={["phieuthanhly", "nguoiPhongRD_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy ? ListUserKy : []}
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  placeholder="Phòng R&D"
                  showSearch
                  optionFilterProp={"name"}
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
                label="Duyệt"
                name={["phieuthanhly", "nguoiDuyet_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy ? ListUserKy : []}
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  placeholder="Duyệt"
                  showSearch
                  optionFilterProp={"name"}
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Danh sách thành phẩm"}
      >
        {type === "new" || type === "edit" ? (
          <Row justify={"end"} style={{ padding: "0px 20px 10px 20px" }}>
            <Button
              icon={<PlusCircleOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={handleChonVatTu}
              disabled={KhoThanhPham === null ? true : false}
            >
              Chọn sản phẩm
            </Button>
          </Row>
        ) : null}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListVatPham)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
      </Card>
      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={onFinish}
          saveAndClose={saveAndClose}
          disabled={type === "new" ? fieldTouch && ListVatPham : fieldTouch}
        />
      ) : null}
      {type === "xacnhan" && info.tinhTrang === "Chưa xác nhận" ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button icon={<RollbackOutlined />} type="default" onClick={goBack}>
            Quay lại
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            type="primary"
            onClick={modalXK}
          >
            Xác nhận
          </Button>
          <Button
            icon={<CloseCircleOutlined />}
            type="danger"
            onClick={() => setActiveModalTuChoi(true)}
          >
            Từ chối
          </Button>
        </div>
      ) : null}
      <ModalThemVatPham
        openModal={ActiveModalThemVatPham}
        openModalFS={setActiveModalThemVatPham}
        itemData={{
          tits_qtsx_CauTrucKho_Id: KhoThanhPham,
          ListVatPham: ListVatPham,
        }}
        DataThemVatPham={DataThemVatPham}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
};

export default ThanhLyThanhPhamForm;
