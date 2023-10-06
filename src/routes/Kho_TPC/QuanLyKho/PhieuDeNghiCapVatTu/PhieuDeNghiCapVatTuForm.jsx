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

const PhieuDeNghiCapVatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [listVatTu, setListVatTu] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListSoLot, setListSoLot] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [value, setValue] = useState(1);

  const [SanPham_Id, setSanPham_Id] = useState();
  const [SoLuong, setSoLuong] = useState();
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [ActiveModal, setActiveModal] = useState(false);

  const { validateFields, resetFields, setFieldsValue, getFieldValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getData();
          setFieldsValue({
            capvattusanxuat: {
              ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
              ngaySanXuat: moment(getDateNow(-1, true), "DD/MM/YYYY"),
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

  const getData = () => {
    getSanPham();
    getSoLot();
    getUserKy(INFO);
    getUserLap(INFO);
    getXuong();
  };
  const getSoLot = () => {
    const params = convertObjectToUrlParams({
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Lot?${params}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    }).then((res) => {
      if (res && res.data) {
        setListSoLot(res.data);
      } else {
        setListSoLot([]);
      }
    });
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
          capvattusanxuat: {
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
          const chiTiet = JSON.parse(res.data.chiTietVatTu);
          chiTiet &&
            chiTiet.forEach((ct, index) => {
              chiTiet[index].id = ct.vatTu_Id + "_" + ct.sanPham_Id;
            });
          setListVatTu(chiTiet ? chiTiet : []);
          getUserLap(INFO, res.data.userYeuCau_Id);
          setInfo(res.data);
          getSanPham(res.data.sanPham_Id);
          setFieldsValue({
            capvattusanxuat: {
              sanPham_Id: res.data.sanPham_Id,
              ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
              ngaySanXuat: moment(res.data.ngaySanXuat, "DD/MM/YYYY"),
              userDuyet_Id: res.data.userDuyet_Id,
              userKeToan_Id: res.data.userKeToan_Id,
              userKiemTra_Id: res.data.userKiemTra_Id,
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
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
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
      title: "Số lượng sản phẩm",
      dataIndex: "soLuongSanPham",
      key: "soLuongSanPham",
      align: "center",
    },
    {
      title: "Số lượng theo định mức",
      dataIndex: "soLuongTheoDinhMuc",
      key: "soLuongTheoDinhMuc",
      align: "center",
    },
    {
      title: "Tồn kho",
      dataIndex: "soLuongTonKho",
      key: "soLuongTonKho",
      align: "center",
    },
    {
      title: "Số lượng yêu cầu",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
      editable: type === "new" || type === "edit" ? true : false,
    },
    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
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
      editable:
        type === "new" || type === "edit" || type === "xacnhan" ? true : false,
    },
    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
      align: "center",
      editable:
        type === "new" || type === "edit" || type === "xacnhan" ? true : false,
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
      editable:
        type === "new" || type === "edit" || type === "xacnhan" ? true : false,
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
    });
    setListVatTu(newData);
  };
  const columns = map(
    value === 1 ? colValues : colValuesCapVatTuKhac,
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
          handleSave: handleSave,
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
    saveData(values.capvattusanxuat);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (listVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.capvattusanxuat, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (capvattusanxuat, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...capvattusanxuat,
        chiTiet_phieumuahangs: listVatTu,
        ngaySanXuat: capvattusanxuat.ngaySanXuat._i,
        ngayYeuCau: capvattusanxuat.ngayYeuCau._i,
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
        ...capvattusanxuat,
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
        ngaySanXuat: capvattusanxuat.ngaySanXuat._i,
        ngayYeuCau: capvattusanxuat.ngayYeuCau._i,
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
  const hanldeTuChoi = () => {
    setActiveModalTuChoi(true);
  };
  const saveTuChoi = (val) => {
    const newData = {
      id: id,
      isXacNhan: false,
      lyDoTuChoi: val,
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
      "Tạo phiếu đề nghị cấp vật tư "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu đề nghị cấp vật tư"
    ) : (
      <span>
        Chi tiết phiếu đề nghị cấp vật tư -{" "}
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

  const onChange = (e) => {
    setValue(e.target.value);
    const data = getFieldValue("capvattusanxuat");
    setFieldsValue({
      capvattukhac: {
        ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
        userYeuCau_Id: data.userYeuCau_Id,
        tenPhongBan: data.tenPhongBan,
      },
    });
  };
  const addVatTu = (data) => {
    let check = false;
    listVatTu.forEach((dl) => {
      if (dl.vatTu_Id.toLowerCase() === data.vatTu_Id) {
        check = true;
        Helpers.alertError(`Vật tư đã được thêm`);
      }
    });
    !check && listVatTu.length > 0 && setListVatTu([...listVatTu, data]);
    !check && listVatTu.length === 0 && setListVatTu([data]);
    !check && setFieldTouch(true);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Row style={{ marginBottom: 15 }} justify={"center"}>
          <Radio.Group
            onChange={onChange}
            value={value}
            style={{ width: "100%", display: "flex" }}
          >
            <Col span={12} align="center">
              <Radio value={1}>Phiếu đề nghị cấp vật tư sản xuất</Radio>
            </Col>
            <Col span={12} align="center">
              <Radio value={2}>Yêu cầu cấp vật tư khác</Radio>
            </Col>
          </Radio.Group>
        </Row>
        <Divider style={{ marginBottom: 10 }} />
        {value === 1 ? (
          <>
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
                    label="Người lập"
                    name={["capvattusanxuat", "userYeuCau_Id"]}
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
                    name={["capvattusanxuat", "tenPhongBan"]}
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
                    label="Xưởng sản xuất"
                    name={["capvattusanxuat", "xuong_Id"]}
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
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label="Ngày yêu cầu"
                    name={["capvattusanxuat", "ngayYeuCau"]}
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <DatePicker
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      format={"DD/MM/YYYY"}
                      allowClear={false}
                      onChange={(date, dateString) => {
                        setFieldsValue({
                          capvattusanxuat: {
                            ngayYeuCau: moment(dateString, "DD/MM/YYYY"),
                          },
                        });
                      }}
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label="Số Lot"
                    name={["capvattusanxuat", "soLot_Id"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      data={ListSoLot ? ListSoLot : []}
                      optionsvalue={["id", "soLot"]}
                      style={{ width: "100%" }}
                      placeholder="Nhập số Lot"
                      showSearch
                      optionFilterProp={"name"}
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label="Ngày sản xuất"
                    name={["capvattusanxuat", "ngaySanXuat"]}
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
                          capvattusanxuat: {
                            ngaySanXuat: moment(dateString, "DD/MM/YYYY"),
                          },
                        });
                      }}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label="Bộ phận duyệt"
                    name={["capvattusanxuat", "userKiemTra_Id"]}
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
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label="Kế toán duyệt"
                    name={["capvattusanxuat", "userKeToan_Id"]}
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
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label="Duyệt"
                    name={["capvattusanxuat", "userDuyet_Id"]}
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
                      placeholder="Chọn người duỵet"
                      optionsvalue={["user_Id", "fullName"]}
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp="name"
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
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
          </>
        ) : (
          <>
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
                    label="Người lập"
                    name={["capvattukhac", "userYeuCau_Id"]}
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
                    name={["capvattukhac", "tenPhongBan"]}
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
                    label="Xưởng sản xuất"
                    name={["capvattukhac", "xuong_Id"]}
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
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label="Ngày yêu cầu"
                    name={["capvattukhac", "ngayYeuCau"]}
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <DatePicker
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      format={"DD/MM/YYYY"}
                      allowClear={false}
                      onChange={(date, dateString) => {
                        setFieldsValue({
                          capvattukhac: {
                            ngayYeuCau: moment(dateString, "DD/MM/YYYY"),
                          },
                        });
                      }}
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label="Bộ phận duyệt"
                    name={["capvattukhac", "userKiemTra_Id"]}
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
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label="Kế toán duyệt"
                    name={["capvattukhac", "userKeToan_Id"]}
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
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label="Duyệt"
                    name={["capvattukhac", "userDuyet_Id"]}
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
                      placeholder="Chọn người duỵet"
                      optionsvalue={["user_Id", "fullName"]}
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp="name"
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
                <Col span={12} align="center">
                  <Button
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={() => setActiveModal(true)}
                  >
                    Thêm vật tư
                  </Button>
                </Col>
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
          </>
        )}
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
              <Button danger onClick={hanldeTuChoi}>
                Từ chối
              </Button>
            </Col>
          </Row>
        )}
      </Card>
      <AddVatTuModal
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        addVatTu={addVatTu}
      />
    </div>
  );
};

export default PhieuDeNghiCapVatTuForm;