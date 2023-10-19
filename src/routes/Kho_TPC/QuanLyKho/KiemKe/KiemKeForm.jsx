import {
  DeleteOutlined,
  PlusCircleOutlined,
  UploadOutlined,
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
  Upload,
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
  FileName,
  convertObjectToUrlParams,
  createGuid,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalChonVatTu from "./ModalChonVatTu";
import ModalTuChoi from "./ModalTuChoi";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const TraNhaCungCapForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});
  const [ListXuong, setListXuong] = useState(null);
  const [Xuong, setXuong] = useState(null);
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListKhoVatTu, setListKhoVatTu] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListUserDuyet, setListUserDuyet] = useState([]);
  const [ActiveModalChonVatTu, setActiveModalChonVatTu] = useState(null);
  const [SoLuongKiemKe, setSoLuongKiemKe] = useState([]);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getData();
        if (permission && permission.add) {
          setType("new");
          setFieldsValue({
            tranhacungcap: {
              ngayKiemKe: moment(getDateNow(), "DD/MM/YYYY"),
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
    getXuong();
    getListKho();
    getUserDuyet(INFO);
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

  const getListKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&isThanhPham=false`,
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
          setListKhoVatTu(res.data);
        } else {
          setListKhoVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getUserLap = (info, nguoiLap_Id) => {
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
        setFieldsValue({
          tranhacungcap: {
            userLap_Id: res.data.Id,
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
        setListUserDuyet(res.data.datalist);
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
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuTraHangNCC/${id}?${params}`,
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
          getUserDuyet(INFO);
          getListKho();
          getUserLap(INFO, res.data.userLap_Id);
          setFieldsValue({
            tranhacungcap: {
              ngayKiemKe: moment(res.data.ngayKiemKe, "DD/MM/YYYY"),
              phongBan_Id: res.data.phongBan_Id,
              benVanChuyen_Id: res.data.benVanChuyen_Id,
              userDuyet_Id: res.data.userDuyet_Id,
              fileDanhGiaChatLuong: res.data.fileDanhGiaChatLuong,
            },
          });

          const newData =
            res.data.chiTietVatTu &&
            JSON.parse(res.data.chiTietVatTu).map((data) => {
              const vitri = `${data.tenKe ? `${data.tenKe}` : ""}${
                data.tenTang ? ` - ${data.tenTang}` : ""
              }${data.tenNgan ? ` - ${data.tenNgan}` : ""}`;

              return {
                ...data,
                soLuongKiemKe: data.soLuong,
                lkn_ChiTietKhoVatTu_Id: data.lkn_ChiTietKhoVatTu_Id
                  ? data.lkn_ChiTietKhoVatTu_Id.toLowerCase()
                  : createGuid(),
                vatTu: `${data.maVatTu} - ${data.tenVatTu}${
                  vitri ? ` (${vitri})` : ""
                }`,
              };
            });
          setListVatTu(newData);

          const newSoLuong = {};
          newData.forEach((data) => {
            newSoLuong[data.lkn_ChiTietKhoVatTu_Id] = data.soLuongKiemKe || 0;
          });
          setSoLuongKiemKe(newSoLuong);
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
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = ListVatTu.filter((d) => d.maVatTu !== item.maVatTu);
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

  const renderSoLuongKiemKe = (record) => {
    if (record) {
      return type === "detail" || type === "xacnhan" ? (
        SoLuongKiemKe[record.lkn_ChiTietKhoVatTu_Id]
      ) : (
        <div>
          <Input
            min={0}
            style={{
              textAlign: "center",
              width: "100%",
            }}
            className={`input-item`}
            value={
              SoLuongKiemKe && SoLuongKiemKe[record.lkn_ChiTietKhoVatTu_Id]
            }
            type="number"
            onChange={(val) => handleInputChange(val, record)}
          />
        </div>
      );
    }
    return null;
  };

  const handleInputChange = (val, record) => {
    const sl = val.target.value;
    setSoLuongKiemKe((prevSoLuongKiemKe) => ({
      ...prevSoLuongKiemKe,
      [record.lkn_ChiTietKhoVatTu_Id]: sl,
    }));
    setListVatTu((prevListVatTu) => {
      return prevListVatTu.map((item) => {
        if (record.lkn_ChiTietKhoVatTu_Id === item.lkn_ChiTietKhoVatTu_Id) {
          return {
            ...item,
            soLuongKiemKe: sl ? parseFloat(sl) : 0,
          };
        }
        return item;
      });
    });
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
      title: "Tên nhóm vật tư",
      dataIndex: "tenNhomVatTu",
      key: "tenNhomVatTu",
      align: "center",
    },
    {
      title: "SL trong kho",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "SL điều chuyển",
      key: "soLuongKiemKe",
      align: "center",
      render: (record) => renderSoLuongKiemKe(record),
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
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
    saveData(values.tranhacungcap);
  };

  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        saveData(values.tranhacungcap, value);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (data, saveQuit = false) => {
    if (type === "new") {
      if (ListVatTu.length === 0) {
        Helpers.alertError("Danh sách vật tư rỗng");
      } else {
        const newData = {
          ...data,
          ngayKiemKe: data.ngayKiemKe.format("DD/MM/YYYY"),
          chiTiet_traHangNCCs: ListVatTu,
        };
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `lkn_PhieuTraHangNCC`,
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
                getData();
                setFieldsValue({
                  tranhacungcap: {
                    ngayKiemKe: moment(getDateNow(), "DD/MM/YYYY"),
                  },
                });
                setListVatTu([]);
              }
            } else {
              setFieldTouch(false);
            }
          })
          .catch((error) => console.error(error));
      }
    }
    if (type === "edit") {
      const newData = {
        ...data,
        id: id,
        ngayKiemKe: data.ngayKiemKe.format("DD/MM/YYYY"),
        chiTiet_traHangNCCs: ListVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuTraHangNCC/${id}`,
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
          `lkn_PhieuTraHangNCC/xac-nhan/${id}`,
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
    title: "Xác nhận phiếu kiểm kê vật tư",
    onOk: handleXacNhan,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const hanldeTuChoi = () => {
    setActiveModalTuChoi(true);
  };

  const handleRefeshModal = () => {
    goBack();
  };

  const handleChonVatTu = () => {
    setActiveModalChonVatTu(true);
  };

  const handleThemVatTu = (data) => {
    const newListVatTu = [...ListVatTu, ...data];
    const newSoLuong = {};
    newListVatTu.forEach((dt) => {
      newSoLuong[dt.vatTu_Id] = dt.soLuong;
    });
    setSoLuongKiemKe(newSoLuong);
    setListVatTu(newListVatTu);
    if (type === "edit") {
      setFieldTouch(true);
    }
  };

  const handleSelectXuong = (value) => {
    setXuong(value);
    setListVatTu([]);
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu kiểm kê vật tư"
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu kiểm kê vật tư"
    ) : (
      <span>
        Chi tiết phiếu kiểm kê vật tư -{" "}
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.maPhieuTraHangNCC}
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
                name={["tranhacungcap", "userLap_Id"]}
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
                name={["tranhacungcap", "tenPhongBan"]}
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
                label="Ban/Phòng"
                name={["tranhacungcap", "phongBan_Id"]}
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
                  disabled={ListVatTu.length !== 0 ? true : false}
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
                label="Ngày kiểm kê"
                name={["tranhacungcap", "ngayKiemKe"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
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
                label="Người duyệt 1"
                name={["tranhacungcap", "userDuyet2_Id"]}
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
                  placeholder="Chọn người duyệt"
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
                label="Người duyệt 2"
                name={["tranhacungcap", "userDuyet3_Id"]}
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
                  placeholder="Chọn người duyệt"
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
                label="Người duyệt 3"
                name={["tranhacungcap", "userDuyet4_Id"]}
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
                  placeholder="Chọn người duyệt"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Divider style={{ marginBottom: 15 }} />
        <Row justify={"center"}>
          <h2 style={{ color: "#0469B9" }}>
            <strong>DANH SÁCH VẬT TƯ</strong>
          </h2>
        </Row>
        {type === "xacnhan" || type === "detail" ? null : (
          <Row justify={"end"} style={{ padding: "0px 20px 10px 20px" }}>
            <Button
              icon={<PlusCircleOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={handleChonVatTu}
              disabled={!Xuong}
            >
              Chọn vật tư
            </Button>
          </Row>
        )}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={
            type === "new"
              ? reDataForTable(ListVatTu)
              : reDataForTable(
                  ListVatTu.map((list) => {
                    const Kho = ListKhoVatTu.filter(
                      (d) =>
                        d.id.toLowerCase() === list.cauTrucKho_Id.toLowerCase()
                    );
                    return {
                      ...list,
                      tenCTKho: Kho.length !== 0 && Kho[0].tenCTKho,
                    };
                  })
                )
          }
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
        {type === "xacnhan" || type === "detail" ? null : (
          <FormSubmit
            goBack={goBack}
            handleSave={onFinish}
            saveAndClose={saveAndClose}
            disabled={fieldTouch && ListVatTu.length !== 0}
          />
        )}
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
      <ModalChonVatTu
        openModal={ActiveModalChonVatTu}
        openModalFS={setActiveModalChonVatTu}
        itemData={{ xuong: Xuong }}
        ThemVatTu={handleThemVatTu}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        itemData={{
          xuong: Xuong,
          listVatTu: ListVatTu.length !== 0 && ListVatTu,
        }}
        refesh={handleRefeshModal}
      />
    </div>
  );
};

export default TraNhaCungCapForm;
