import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
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
  Divider,
  Tag,
  Upload,
  Image,
} from "antd";
import { includes, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState, useRef, useContext } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { BASE_URL_API } from "src/constants/Config";
import {
  FormSubmit,
  Select,
  Table,
  ModalDeleteConfirm,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_TWO_COL } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
  renderPDF,
} from "src/util/Common";
import ModalTuChoi from "./ModalTuChoi";
import AddSanPham from "./AddSanPham";
import ImportSanPham from "./ImportSanPham";
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

const DonHangSanXuatForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("");
  const [typeSanPham, setTypeSanPham] = useState("");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListKhachHang, setListKhachHang] = useState([]);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [File, setFile] = useState([]);
  const [disableUpload, setDisableUpload] = useState(false);
  const [FileChat, setFileChat] = useState("");
  const [openImage, setOpenImage] = useState(false);
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  const [infoSanPham, setInfoSanPham] = useState({});
  const [ActiveModal, setActiveModal] = useState(false);
  const [ActiveModalImport, setActiveModalImport] = useState(false);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getKhachHang();
          setFieldsValue({
            dondathang: {
              ngayDatHang: moment(getDateNow(), "DD/MM/YYYY"),
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
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id, true);
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
  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Donhang/${id}`,
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
          getKhachHang();

          if (res.data.file) {
            setFile(res.data.file);
            setDisableUpload(true);
          }
          setListSanPham(
            JSON.parse(res.data.chiTiet_DonHangs).map((sp) => {
              return {
                ...sp,
                tits_qtsx_LoaiSanPham_Id:
                  sp.tits_qtsx_LoaiSanPham_Id.toLowerCase(),
                tits_qtsx_MauSac_Id: sp.tits_qtsx_MauSac_Id.toLowerCase(),
                tits_qtsx_SanPham_Id: sp.tits_qtsx_SanPham_Id.toLowerCase(),
              };
            })
          );
          setFieldsValue({
            dondathang: {
              ...res.data,
              ngayDatHang: moment(res.data.ngayDatHang, "DD/MM/YYYY"),
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const getKhachHang = () => {
    const params = convertObjectToUrlParams({
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KhachHang?${params}`,
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
        if (res && res.data.length > 0) {
          setListKhachHang(res.data);
        } else {
          setListKhachHang([]);
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
          : type === "detail" || type === "UploadFile"
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
    const title = "sản phẩm";
    ModalDeleteConfirm(deleteItemAction, item, item.tenSanPham, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = ListSanPham.filter(
      (d) => d.tits_qtsx_ChiTiet !== item.tits_qtsx_ChiTiet
    );
    setListSanPham(newData);
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const editItemVal =
      type === "new" || type === "edit"
        ? {
            onClick: () => {
              setActiveModal(true);
              setInfoSanPham(item);
              setTypeSanPham("edit");
            },
          }
        : { disabled: true };
    const deleteItemVal =
      type === "new" || type === "edit"
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          <a {...editItemVal} title="Xóa">
            <EditOutlined />
          </a>
          <Divider type="vertical" />
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
      title: "Loại sản phẩm",
      dataIndex: "tenLoaiSanPham",
      key: "tenLoaiSanPham",
      align: "center",
    },
    {
      title: "Loại lốp",
      dataIndex: "maLoaiLop",
      key: "maLoaiLop",
      align: "center",
    },
    {
      title: "Màu sắc",
      dataIndex: "tenMauSac",
      key: "tenMauSac",
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
      title: "Đơn giá/ chiếc(VND)",
      dataIndex: "donGia",
      key: "donGia",
      align: "center",
    },
    {
      title: "Vận chuyển/ chiếc(VND)",
      dataIndex: "phiVanChuyen",
      key: "phiVanChuyen",
      align: "center",
    },
    {
      title: "Ngày bàn giao",
      dataIndex: "ngay",
      key: "ngay",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
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
  const handleViewFile = (file) => {
    if (file.type === "application/pdf") {
      renderPDF(file);
    } else {
      setOpenImage(true);
    }
  };
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    // saveData(values.dondathang);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListSanPham.length === 0) {
          Helpers.alertError("Danh sách sản phẩm rỗng");
        } else {
          if (type === "new") {
            hanldeXacNhanTaiFile(values.dondathang, val);
          } else if (type === "edit" && File.name) {
            hanldeXacNhanTaiFile(values.dondathang, val);
          } else {
            values.dondathang.file = info.file;
            saveData(values.dondathang, val);
          }
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (dondathang, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...dondathang,
        ngayDatHang: dondathang.ngayDatHang._i,
        chiTiet_DonHangs: ListSanPham,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_Donhang`,
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
              setDisableUpload(false);
              setListSanPham([]);
              setFieldsValue({
                dondathang: {
                  ngayDatHang: moment(getDateNow(), "DD/MM/YYYY"),
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
        id: id,
        ...dondathang,
        ngayDatHang: dondathang.ngayDatHang._i,
        chiTiet_DonHangs: ListSanPham.map((sp) => {
          return {
            ...sp,
            tits_qtsx_DonHang_Id: id,
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_Donhang/${id}`,
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
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Donhang/xac-nhan/${id}`,
          "PUT",
          null,
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
  const propXacNhan = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận đơn hàng",
    onOk: hanldeXacNhan,
  };
  const modalXK = () => {
    Modal(propXacNhan);
  };
  const hanldeXacNhanTaiFile = (dondathang, val) => {
    const formData = new FormData();
    formData.append("file", File);
    const url = info.fileXacNhan
      ? `${BASE_URL_API}/api/Upload?stringPath=${info.file}`
      : `${BASE_URL_API}/api/Upload`;
    fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: "Bearer ".concat(INFO.token),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        dondathang.file = data.path;
        saveData(dondathang, val);
      })
      .catch(() => {
        console.log("upload failed.");
      });
  };
  const prop1 = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận tải file đã ký",
    onOk: hanldeXacNhanTaiFile,
  };
  const modalUploadFile = () => {
    Modal(prop1);
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
          `lkn_Phieudondathang/xac-nhan/${id}`,
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
  const ThemSanPham = (data, type) => {
    setFieldTouch(true);
    if (type === "new") {
      let check = false;
      ListSanPham.forEach((sp) => {
        if (
          sp.tits_qtsx_SanPham_Id === data.tits_qtsx_SanPham_Id &&
          sp.tits_qtsx_MauSac_Id === data.tits_qtsx_MauSac_Id
        ) {
          check = true;
          Helpers.alertWarning(
            `Sản phẩm ${data.tenSanPham} có màu ${data.tenMauSac} đã được thêm!`
          );
        }
      });
      if (!check) {
        setListSanPham([...ListSanPham, data]);
        setActiveModal(false);
      }
    } else {
      if (infoSanPham.tits_qtsx_SanPham_Id === data.tits_qtsx_SanPham_Id) {
        const newData = ListSanPham.map((sp) => {
          if (sp.tits_qtsx_ChiTiet === infoSanPham.tits_qtsx_ChiTiet) {
            return data;
          } else {
            return sp;
          }
        });
        setListSanPham([...newData]);
      } else {
        const newData = ListSanPham.filter(
          (d) => d.tits_qtsx_ChiTiet !== infoSanPham.tits_qtsx_ChiTiet
        );
        setListSanPham([data, ...newData]);
      }
      setActiveModal(false);
    }
  };

  const formTitle =
    type === "new" ? (
      "Tạo đơn hàng "
    ) : type === "edit" ? (
      "Chỉnh sửa đơn hàng"
    ) : (
      <span>
        Chi tiết đơn hàng -{" "}
        <Tag
          color={
            info.isXacNhan === null
              ? "orange"
              : info.isXacNhan === true
              ? "blue"
              : "red"
          }
          style={{ fontSize: 14 }}
        >
          {info.maPhieu}
        </Tag>
        <Tag color={info.isXacNhan ? "blue" : "red"} style={{ fontSize: 14 }}>
          {info.trangThai}
        </Tag>
      </span>
    );

  const props = {
    accept: ".pdf, .png, .jpg, .jpeg",
    beforeUpload: (file) => {
      const isPNG =
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "application/pdf";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh hoặc file pdf`);
      } else {
        setFile(file);
        setDisableUpload(true);
        const reader = new FileReader();
        reader.onload = (e) => setFileChat(e.target.result);
        reader.readAsDataURL(file);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const addSanPhamImport = (data) => {
    setListSanPham([...data, ...ListSanPham]);
    setFieldTouch(true);
  };
  const handleOnSelectKhachHang = (val) => {
    ListKhachHang.forEach((kh) => {
      if (kh.id === val) {
        setFieldsValue({
          dondathang: {
            sDT: kh.sDT,
            email: kh.email,
            nguoiLienHe: kh.nguoiLienHe,
          },
        });
      }
    });
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin đơn hàng"}
      >
        <Form
          {...DEFAULT_FORM_TWO_COL}
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
                label="Tên đơn hàng"
                name={["dondathang", "tenDonHang"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input
                  placeholder="Tên đơn hàng"
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
                label="Khách hàng"
                name={["dondathang", "tits_qtsx_KhachHang_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhachHang}
                  placeholder="Chọn khách hàng"
                  optionsvalue={["id", "tenKhachHang"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                  onSelect={handleOnSelectKhachHang}
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
                label="Số điện thoại"
                name={["dondathang", "sDT"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input placeholder="Số điện thoại" disabled={true} />
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
                label="Email"
                name={["dondathang", "email"]}
                rules={[
                  {
                    type: "email",
                  },
                ]}
              >
                <Input placeholder="Email" disabled={true} />
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
                label="Người liên hệ"
                name={["dondathang", "nguoiLienHe"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input placeholder="Người liên hệ" disabled={true} />
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
                label="Ngày đặt hàng"
                name={["dondathang", "ngayDatHang"]}
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
                      dondathang: {
                        ngayDatHang: moment(dateString, "DD/MM/YYYY"),
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
                label="File dính kèm"
                name={["dondathang", "file"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                {!disableUpload ? (
                  <Upload {...props}>
                    <Button
                      style={{
                        marginBottom: 0,
                        height: 25,
                        lineHeight: "25px",
                      }}
                      icon={<UploadOutlined />}
                      disabled={type === "xacnhan" || type === "detail"}
                    >
                      Tải file
                    </Button>
                  </Upload>
                ) : File.name ? (
                  <span>
                    <span
                      style={{
                        color: "#0469B9",
                        cursor: "pointer",
                        whiteSpace: "break-spaces",
                      }}
                      onClick={() => handleViewFile(File)}
                    >
                      {File.name}
                    </span>
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      onClick={() => {
                        setFile();
                        setDisableUpload(false);
                        setFieldsValue({
                          phieunhanhang: {
                            file: undefined,
                          },
                        });
                      }}
                    />
                    <Image
                      width={100}
                      src={FileChat}
                      alt="preview"
                      style={{
                        display: "none",
                      }}
                      preview={{
                        visible: openImage,
                        scaleStep: 0.5,
                        src: FileChat,
                        onVisibleChange: (value) => {
                          setOpenImage(value);
                        },
                      }}
                    />
                  </span>
                ) : (
                  <span>
                    <a
                      target="_blank"
                      href={BASE_URL_API + File}
                      rel="noopener noreferrer"
                      style={{
                        whiteSpace: "break-spaces",
                        wordBreak: "break-all",
                      }}
                    >
                      {File.split("/")[5]}{" "}
                    </a>
                    {!info.isXacNhan && type === "edit" && (
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setFile();
                          setDisableUpload(false);
                        }}
                      />
                    )}
                  </span>
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card title="Thông tin sản phẩm">
        {type === "new" || type === "edit" ? (
          <Row>
            <Col span={24} align="end" style={{ marginTop: 8 }}>
              <Button
                icon={<PlusOutlined />}
                onClick={() => {
                  setActiveModal(true);
                  setTypeSanPham("new");
                }}
                type="primary"
              >
                Thêm sản phẩm
              </Button>
              <Button
                icon={<UploadOutlined />}
                onClick={() => setActiveModalImport(true)}
                type="primary"
              >
                Import
              </Button>
            </Col>
          </Row>
        ) : null}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListSanPham)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
      </Card>
      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={saveAndClose}
          saveAndClose={saveAndClose}
          disabled={fieldTouch && ListSanPham.length !== 0}
        />
      ) : null}
      {type === "xacnhan" && info.isXacNhan === null && (
        <Row justify={"end"} style={{ marginTop: 15 }}>
          <Col style={{ marginRight: 15 }}>
            <Button
              type="primary"
              onClick={modalXK}
              disabled={info.fileXacNhan === null}
            >
              Xác nhận
            </Button>
          </Col>
          <Col style={{ marginRight: 15 }}>
            <Button
              danger
              onClick={hanldeTuChoi}
              disabled={info.fileXacNhan === null}
            >
              Từ chối
            </Button>
          </Col>
        </Row>
      )}
      {type === "UploadFile" &&
        (!info.isXacNhan || info.isXacNhan !== true) && (
          <Row justify={"end"} style={{ marginTop: 15 }}>
            <Col style={{ marginRight: 15 }}>
              <Button
                type="primary"
                onClick={modalUploadFile}
                disabled={!disableUpload || !File.name}
              >
                Hoàn thành
              </Button>
            </Col>
          </Row>
        )}
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
      <AddSanPham
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        addSanPham={ThemSanPham}
        info={infoSanPham}
        type={typeSanPham}
      />
      <ImportSanPham
        openModal={ActiveModalImport}
        openModalFS={setActiveModalImport}
        addSanPham={addSanPhamImport}
        listSanPham={ListSanPham}
      />
    </div>
  );
};

export default DonHangSanXuatForm;
