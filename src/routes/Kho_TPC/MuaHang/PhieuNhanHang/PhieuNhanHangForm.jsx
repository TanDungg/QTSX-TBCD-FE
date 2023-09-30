import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Button,
  Tag,
  Upload,
  Image,
} from "antd";
import { includes, map, set } from "lodash";
import Helper from "src/helpers";
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
import { BASE_URL_API, DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
  renderPDF,
} from "src/util/Common";
// import AddVatTuModal from "./AddVatTuModal";
// import ModalTuChoi from "./ModalTuChoi";

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
          title === "Số lượng"
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

const PhieuNhanHangForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [listVatTu, setListVatTu] = useState([]);
  const [ListUserYeuCau, setListUserYeuCau] = useState([]);
  const [ListPhieuMuaHang, setListPhieuMuaHang] = useState([]);
  const [ListBanPhong, setListBanPhong] = useState([]);
  const [ListCVThuMua, setListCVThuMua] = useState([]);
  const [File, setFile] = useState("");
  const [disableUpload, setDisableUpload] = useState(false);
  const [FileChat, setFileChat] = useState("");
  const [openImage, setOpenImage] = useState(false);

  const [ActiveModal, setActiveModal] = useState(false);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);

  const { validateFields, resetFields, setFieldsValue, getFieldValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getBanPhong(INFO);
          setType("new");
          getCVThuMua(INFO);
          setFieldsValue({
            phieunhanhang: {
              ngayHangVe: moment(getDateNow(), "DD/MM/YYYY"),
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
          getCVThuMua(INFO);
          getBanPhong(INFO);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getCVThuMua(INFO);
          getBanPhong(INFO);
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

  const getBanPhong = (info) => {
    const params = convertObjectToUrlParams({
      donviid: info.donVi_Id,
      page: -1,
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
        setListBanPhong(res.data);
      } else {
        setListBanPhong([]);
      }
    });
  };
  const getCVThuMua = (info) => {
    const params = convertObjectToUrlParams({
      donVi_Id: info.donVi_Id,
      phanMem_Id: info.phanMem_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhanHang/list-user-thu-mua?${params}`,
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
        setListCVThuMua(res.data);
      } else {
        setListCVThuMua([]);
      }
    });
  };
  const getPhieuMuaHang = (info, phongBanId, loaiPhieu, id) => {
    const params = convertObjectToUrlParams({
      donVi_Id: info.donVi_Id,
      phongBanId,
      loaiPhieu,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhanHang/list-phieu-mua-hang-theo-loai?${params}`,
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
        setListPhieuMuaHang(res.data);
        if (id) {
          res.data.forEach((p) => {
            if (id === p.id) {
              setListUserYeuCau([
                {
                  id: p.userYeuCau_Id,
                  fullName: p.tenNguoiYeuCau,
                },
              ]);
              setFieldsValue({
                phieunhanhang: {
                  userYeuCau_Id: p.userYeuCau_Id,
                },
              });
            }
          });
        }
      } else {
        setListPhieuMuaHang([]);
      }
    });
  };
  const getChiTietPhieuMuaHang = (info, id) => {
    const params = convertObjectToUrlParams({
      donVi_Id: info.donVi_Id,
      id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhanHang/list-vat-tu-by-phieu-mua?${params}`,
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
        setListVatTu(res.data);
      } else {
        setListVatTu([]);
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
          `lkn_PhieuNhanHang/${id}?donVi_Id=${INFO.donVi_Id}`,
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
          const data = res.data;
          setListVatTu(
            JSON.parse(data.chiTietVatTu) ? JSON.parse(data.chiTietVatTu) : []
          );
          if (res.data.fileDinhKem) {
            setDisableUpload(true);
            setFile(res.data.fileDinhKem);
          }
          setListPhieuMuaHang([
            {
              id: res.data.phieuMuaHang_Id,
              maPhieuYeuCau: res.data.maPhieuYeuCau,
            },
          ]);
          setListUserYeuCau([
            {
              id: res.data.userYeuCau_Id,
              fullName: res.data.tenNguoiYeuCau,
            },
          ]);
          setInfo(data);
          setFieldsValue({
            phieunhanhang: {
              ...data,
              ngayHangVe: moment(data.ngayHangVe, "DD/MM/YYYY"),
              phongBanId: data.phongBan_Id,
              loaiPhieu: data.loaiPhieu.toString(),
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
    const newData = listVatTu.filter((d) => d.vatTu_Id !== item.vatTu_Id);
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
      title: "Số lượng mua",
      dataIndex: "soLuongMua",
      key: "soLuongMua",
      align: "center",
    },
    {
      title: "Số lượng nhận",
      dataIndex: "soLuongNhan",
      key: "soLuongNhan",
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
    // setDisableSave(true);
    setFieldTouch(true);
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
    uploadFile(values.phieunhanhang);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (listVatTu.length === 0) {
          Helper.alertError("Danh sách vật tư rỗng");
        } else {
          uploadFile(values.phieunhanhang, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  const uploadFile = (phieunhanhang, saveQuit) => {
    if (type === "new" && phieunhanhang.fileDinhKem) {
      const formData = new FormData();
      formData.append("file", phieunhanhang.fileDinhKem.file);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          phieunhanhang.fileDinhKem = data.path;
          saveData(phieunhanhang, saveQuit);
        })
        .catch(() => {
          console.log("upload failed.");
        });
    } else if (type === "edit" && phieunhanhang.fileDinhKem) {
      const formData = new FormData();
      formData.append("file", phieunhanhang.fileDinhKem.file);
      fetch(`${BASE_URL_API}/api/Upload?stringPath=${info.fileDinhKem}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          phieunhanhang.fileDinhKem = data.path;
          saveData(phieunhanhang, saveQuit);
        })
        .catch(() => {
          console.log("upload failed.");
        });
    } else {
      saveData(phieunhanhang, saveQuit);
    }
  };

  const saveData = (phieunhanhang, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...phieunhanhang,
        ngayHangVe: phieunhanhang.ngayHangVe._i,
        chiTiet_PhieuNhanHang: listVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhanHang`,
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
      listVatTu.forEach((vt, index) => {
        listVatTu[index].lkn_PhieuNhanHang_Id = id;
      });
      const newData = {
        ...phieunhanhang,
        ngayHangVe: phieunhanhang.ngayHangVe._i,
        phieuMuaHang_Id: id,
        chiTiet_phieunhanhang: listVatTu,
        id: id,
        maPhieuNhanHang: info.maPhieuNhanHang,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhanHang/${id}`,
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
          `lkn_phieuphieunhanhang/xac-nhan/${id}`,
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
    title: "Xác nhận phiếu đặt hàng nội bộ",
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
          `lkn_phieuphieunhanhang/xac-nhan/${id}`,
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
      "Tạo phiếu nhận hàng "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu nhận hàng"
    ) : (
      <span>
        Chi tiết phiếu nhận hàng -{" "}
        <Tag
          color={
            info.isXacNhan === null
              ? "processing"
              : info.isXacNhan
              ? "success"
              : "error"
          }
        >
          {info.maPhieuYeuCau}
        </Tag>
      </span>
    );
  const handleGetListPhieu = (val) => {
    const record = getFieldValue("phieunhanhang");
    if (record.loaiPhieu && record.phongBanId) {
      getPhieuMuaHang(
        INFO,
        record.phongBanId,
        record.loaiPhieu.toLowerCase() === "true"
      );
      setListVatTu([]);
      setFieldsValue({
        phieunhanhang: {
          phieuMuaHang_Id: undefined,
          userYeuCau_Id: undefined,
        },
      });
    }
  };
  const hanldeSelectPhieu = (val) => {
    ListPhieuMuaHang.forEach((p) => {
      if (val === p.id) {
        setListUserYeuCau([
          {
            id: p.userYeuCau_Id,
            fullName: p.tenNguoiYeuCau,
          },
        ]);
        getChiTietPhieuMuaHang(INFO, val);
        setFieldsValue({
          phieunhanhang: {
            userYeuCau_Id: p.userYeuCau_Id,
          },
        });
      }
    });
  };
  const props = {
    beforeUpload: (file) => {
      const isPNG =
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "application/pdf";
      if (!isPNG) {
        Helper.alertError(`${file.name} không phải hình ảnh hoặc file pdf`);
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
  const handleViewFile = (file) => {
    if (file.type === "application/pdf") {
      renderPDF(file);
    } else {
      setOpenImage(true);
    }
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
          <FormItem
            label="Ban/Phòng"
            name={["phieunhanhang", "phongBanId"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListBanPhong}
              placeholder="Chọn Ban/Phòng"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleGetListPhieu}
              disabled={type === "new" ? false : true}
            />
          </FormItem>

          <FormItem
            label="Loại phiếu"
            name={["phieunhanhang", "loaiPhieu"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={[
                { id: "true", name: "Phiếu đề nghị mua hàng" },
                { id: "false", name: "Phiếu đặt hàng nội bộ" },
              ]}
              placeholder="Chọn loại phiếu"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleGetListPhieu}
              disabled={type === "new" ? false : true}
            />
          </FormItem>
          <FormItem
            label="Mã phiếu mua hàng"
            name={["phieunhanhang", "phieuMuaHang_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListPhieuMuaHang}
              placeholder="Chọn mã phiếu mua hàng"
              optionsvalue={["id", "maPhieuYeuCau"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={hanldeSelectPhieu}
              optionFilterProp="name"
              disabled={type === "new" ? false : true}
            />
          </FormItem>
          <FormItem
            label="Người yêu cầu"
            name={["phieunhanhang", "userYeuCau_Id"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListUserYeuCau}
              placeholder="Người yêu cầu"
              optionsvalue={["id", "fullName"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              disabled={true}
            />
          </FormItem>
          <FormItem
            label="Ngày hàng về"
            name={["phieunhanhang", "ngayHangVe"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <DatePicker
              format={"DD/MM/YYYY"}
              style={{ width: "100%" }}
              allowClear={false}
              disabled={type === "new" || type === "edit" ? false : true}
              onChange={(date, dateString) => {
                setFieldsValue({
                  phieunhanhang: {
                    ngayHangVe: moment(dateString, "DD/MM/YYYY"),
                  },
                });
              }}
            />
          </FormItem>
          <FormItem
            label="CV thu mua"
            name={["phieunhanhang", "userThuMua_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListCVThuMua}
              placeholder="Chọn cv thu mua"
              optionsvalue={["user_Id", "fullName"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              disabled={type === "new" || type === "edit" ? false : true}
            />
          </FormItem>
          <FormItem
            label="File đính kèm"
            name={["phieunhanhang", "fileDinhKem"]}
            rules={[
              {
                type: "file",
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
                >
                  Tải file
                </Button>
              </Upload>
            ) : File.name ? (
              <span>
                <span
                  style={{ color: "#0469B9", cursor: "pointer" }}
                  onClick={() => handleViewFile(File)}
                >
                  {File.name.length > 20
                    ? File.name.substring(0, 20) + "..."
                    : File.name}{" "}
                </span>
                <DeleteOutlined
                  style={{ cursor: "pointer", color: "red" }}
                  disabled={type === "new" || type === "edit" ? false : true}
                  onClick={() => {
                    setFile();
                    setDisableUpload(false);
                    setFieldsValue({
                      phieunhanhang: {
                        fileDinhKem: undefined,
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
                <a target="_blank" href={BASE_URL_API + File}>
                  {File.split("/")[5]}{" "}
                </a>
                <DeleteOutlined
                  style={{ cursor: "pointer", color: "red" }}
                  disabled={type === "new" || type === "edit" ? false : true}
                  onClick={() => {
                    setFile();
                    setDisableUpload(false);
                    setFieldsValue({
                      phieunhanhang: {
                        fileDinhKem: undefined,
                      },
                    });
                  }}
                />
              </span>
            )}
          </FormItem>
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
        saveTuChoi={saveTuChoi}
      /> */}
    </div>
  );
};

export default PhieuNhanHangForm;
