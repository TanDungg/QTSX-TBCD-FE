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
  ModalDeleteConfirm,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
// import Modal from "./Modal";
import AddVatTuModal from "./AddVatTuModal";
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={
          title === "SL cần mua"
            ? [
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Số lượng không hợp lệ!",
                },
              ]
            : null
        }
      >
        <Input
          style={{
            margin: 0,
            width: "100%",
            textAlign: "center",
          }}
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

const FormItem = Form.Item;

const VatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [listVatTu, setListVatTu] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [SanPham_Id, setSanPham_Id] = useState();
  const [SoLuong, setSoLuong] = useState();
  const [ActiveModal, setActiveModal] = useState(false);

  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getUserLap(INFO);
          setType("new");
          getSanPham();
          getUserKy(INFO);
          setFieldsValue({
            dinhmucvattu: {
              ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
              ngayHoanThanhDukien: moment(getDateNow(), "DD/MM/YYYY"),
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
          dinhmucvattu: {
            userYeuCau_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
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
  const getSanPham = (id) => {
    if (id) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `SanPham/${id}`,
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
          setListSanPham([res.data]);
        } else {
          setListSanPham([]);
        }
      });
    } else {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `SanPham?page=-1`,
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
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      });
    }
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
          `lkn_PhieuDeNghiMuaHang/${id}?${params}`,
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
          setListVatTu(JSON.parse(res.data.chiTietVatTu));
          getUserLap(INFO, res.data.userYeuCau_Id);
          setInfo(res.data);
          getSanPham(res.data.sanPham_Id);
          setFieldsValue({
            dinhmucvattu: {
              sanPham_Id: res.data.sanPham_Id,
              ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
              ngayHoanThanhDukien: moment(
                res.data.ngayHoanThanhDukien,
                "DD/MM/YYYY"
              ),
              userDuyet_Id: res.data.userDuyet_Id,
              userKeToan_Id: res.data.userKeToan_Id,
              userKiemTra_Id: res.data.userKiemTra_Id,
              isCKD: res.data.isCKD ? "true" : "false",
            },
          });
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
    const newData = listVatTu.filter((d) => d.id !== item.id);
    setListVatTu(newData);
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
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
      editable: type === "new" || type === "edit" ? true : false,
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
      editable: type === "new" || type === "edit" ? true : false,
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
  const handleSave = (row) => {
    const newData = [...listVatTu];
    const index = newData.findIndex((item) => row.vatTu_Id === item.vatTu_Id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
      soLuongTheoDinhMuc: row.soLuong * row.dinhMuc,
    });
    // setDisableSave(true);
    setListVatTu(newData);
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
        handleSave: handleSave,
      }),
    };
  });
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.dinhmucvattu);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (listVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.dinhmucvattu, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (deNghiMuaHang, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...deNghiMuaHang,
        chiTiet_phieumuahangs: listVatTu,
        ngayHoanThanhDukien: deNghiMuaHang.ngayHoanThanhDukien._i,
        ngayYeuCau: deNghiMuaHang.ngayYeuCau._i,
        isCKD: deNghiMuaHang.isCKD === "true",
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDeNghiMuaHang`,
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
      const newData = {
        id: id,
        ...deNghiMuaHang,
        chiTiet_phieumuahangs: listVatTu.map((vt) => {
          return {
            vatTu_Id: vt.vatTu_Id,
            lkn_PhieuMuaHang_Id: id,
            bom_Id: vt.bom_Id,
            soLuong: vt.soLuong,
            soLuongTonKho: 0,
            ghiChu: vt.ghiChu,
            hangMucSuDung: vt.hangMucSuDung,
          };
        }),
        ngayHoanThanhDukien: deNghiMuaHang.ngayHoanThanhDukien._i,
        isCKD: deNghiMuaHang.isCKD === "true",
        ngayYeuCau: deNghiMuaHang.ngayYeuCau._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDeNghiMuaHang/${id}`,
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

  const hanldeXacNhan = () => {
    const newData = {
      id: id,
      isXacNhan: true,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiMuaHang/xac-nhan/${id}`,
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
        if (res.status !== 409) goBack();
      })
      .catch((error) => console.error(error));
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận phiếu đề nghị mua hàng",
    onOk: hanldeXacNhan,
  };
  const modalXK = () => {
    Modal(prop);
  };
  const hanlde = () => {
    setActiveModal(true);
  };
  const save = (val) => {
    const newData = {
      id: id,
      isXacNhan: false,
      lyDo: val,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiMuaHang/xac-nhan/${id}`,
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
        if (res.status !== 409) goBack();
      })
      .catch((error) => console.error(error));
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu nhập kho vật tư "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu nhập kho vật tư"
    ) : (
      <span>
        Chi tiết phiếu nhập kho vật tư -{" "}
        <Tag
          color={
            info.isKiemTraXacNhan === null
              ? "processing"
              : info.isKeToanXacNhan === null
              ? "volcano"
              : info.isXacNhan === null
              ? "success"
              : "error"
          }
        >
          {info.maPhieuYeuCau}
        </Tag>
      </span>
    );
  const hanldeThem = () => {
    const params = convertObjectToUrlParams({ sanPham_Id: SanPham_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/bom-by-sanpham?${params}`,
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
          const newData =
            res.data.chiTietBOM &&
            JSON.parse(res.data.chiTietBOM).map((ct) => {
              return {
                id: ct.vatTu_Id + "_" + res.data.id,
                vatTu_Id: ct.vatTu_Id,
                tenVatTu: ct.tenVatTu,
                dinhMuc: ct.dinhMuc,
                soLuongTheoDinhMuc: ct.dinhMuc * SoLuong,
                ghiChu: "",
                hangMucSuDung: "",
                soLuong: SoLuong,
                tenDonViTinh: ct.tenDonViTinh,
                tenNhomVatTu: ct.tenNhomVatTu,
                tenSanPham: res.data.tenSanPham,
                bom_Id: res.data.id,
              };
            });
          if (newData) {
            if (listVatTu !== null) {
              listVatTu.forEach((vt) => {
                newData.forEach((ct, index) => {
                  if (vt.id === ct.id) {
                    newData.splice(index, 1);
                  }
                });
              });
              setListVatTu([...listVatTu, ...newData]);
            } else {
              setListVatTu(newData);
            }
            setFieldsValue({
              sanPham: {
                sanPham_Id: "",
                soLuong: "",
              },
            });
            setSanPham_Id();
            setSoLuong();
          } else {
            Helpers.alertWarning("Không tìm thấy BOM của sản phẩm");
          }
        }
      })
      .catch((error) => console.error(error));
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Row>
            <Col span={12}>
              <FormItem
                label="Người nhập"
                name={["dinhmucvattu", "userYeuCau_Id"]}
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
            <Col span={12}>
              <FormItem
                label="Ban/Phòng"
                name={["dinhmucvattu", "tenPhongBan"]}
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
            <Col span={12}>
              <FormItem
                label="Ngày nhập"
                name={["dinhmucvattu", "ngayYeuCau"]}
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
                    setFieldsValue({
                      dinhmucvattu: {
                        ngayYeuCau: moment(dateString, "DD/MM/YYYY"),
                      },
                    });
                  }}
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Phiếu nhận hàng"
                name={["dinhmucvattu", "isCKD"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
                initialValue={"true"}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={[
                    { id: "true", name: "Phiếu đề nghị mua hàng CKD" },
                    { id: "false", name: "Phiếu đề nghị mua hàng" },
                  ]}
                  placeholder="Chọn phiếu mua hàng"
                  optionsvalue={["id", "name"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" ? false : true}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Số hóa đơn"
                name={["dinhmucvattu", "userKiemTra_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input placeholder="Số hóa đơn" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Ngày hóa đơn"
                name={["dinhmucvattu", "ngayHoanThanhDukien"]}
                rules={[]}
              >
                <DatePicker
                  disabled={type === "new" || type === "edit" ? false : true}
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      dinhmucvattu: {
                        ngayHoanThanhDukien: moment(dateString, "DD/MM/YYYY"),
                      },
                    });
                  }}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Nhà cung cấp"
                name={["dinhmucvattu", "userKiemTra_Id"]}
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
                  placeholder="Chọn kiểm tra"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Nội dung nhập"
                name={["dinhmucvattu", "userKiemTra_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input placeholder="Nội dụng nhập vật tư" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Kho nhập"
                name={["dinhmucvattu", "userKeToan_Id"]}
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
                  placeholder="Chọn kế toán duyệt"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            {type === "new" || type === "edit" ? (
              <Col span={12} align="center">
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() => setActiveModal(true)}
                >
                  Nhập vật tư
                </Button>
              </Col>
            ) : null}
          </Row>
        </Form>
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
        {type === "new" || type === "edit" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={saveAndClose}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
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
              <Button danger onClick={hanlde}>
                Từ chối
              </Button>
            </Col>
          </Row>
        )}
      </Card>
      {/* <Modal
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        save={save}
      /> */}
      <AddVatTuModal openModal={ActiveModal} openModalFS={setActiveModal} />
    </div>
  );
};

export default VatTuForm;
