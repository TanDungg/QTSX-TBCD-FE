import {
  DeleteOutlined,
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
  Tag,
  Upload,
  Image,
  Divider,
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
import { DEFAULT_FORM_TWO_COL, LOAI_NCC_NOI_BO } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
  renderPDF,
} from "src/util/Common";
import AddVatTuModal from "./AddVatTuModal";
import ModalTuChoi from "./ModalTuChoi";
import { BASE_URL_API } from "src/constants/Config";
import Helper from "src/helpers";
import dayjs from "dayjs";
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

const DatHangNoiBoForm = ({ history, match, permission }) => {
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
  const [ListNhaCungCap, setListNhaCungCap] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [disableUpload, setDisableUpload] = useState(false);
  const [FileChat, setFileChat] = useState("");
  const [File, setFile] = useState("");
  const [openImage, setOpenImage] = useState(false);
  const [ActiveModal, setActiveModal] = useState(false);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getUserLap(INFO);
          getUserKy(INFO);
          getNhaCungCap();
          setFieldsValue({
            dathangnoibo: {
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
          getUserKy(INFO);
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
          dathangnoibo: {
            userYeuCau_Id: res.data.Id,
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

  const getNhaCungCap = (id) => {
    if (id) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `NhaCungCap/${id}`,
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
          setListNhaCungCap([res.data]);
        } else {
          setListNhaCungCap([]);
        }
      });
    } else {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `NhaCungCap?page=-1&&loaiNhaCungCap_Id=${LOAI_NCC_NOI_BO}`,
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
          setListNhaCungCap(res.data);
        } else {
          setListNhaCungCap([]);
        }
      });
    }
  };
  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id, check) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_phieudathangnoibo/${id}?donVi_Id=${INFO.donVi_Id}`,
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
            JSON.parse(res.data.chiTietVatTu)
              ? JSON.parse(res.data.chiTietVatTu)
              : []
          );
          getUserLap(INFO, res.data.userYeuCau_Id);
          res.data.userYeuCau_Id === INFO.user_Id &&
            check &&
            setType("UploadFile");
          if (res.data.fileXacNhan) {
            setFile(res.data.fileXacNhan);
            setDisableUpload(true);
          }
          setInfo(res.data);
          getNhaCungCap(res.data.userNhan_Id);
          setFieldsValue({
            dathangnoibo: {
              ...res.data,
              ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
              ngayHoanThanhDukien: moment(
                res.data.ngayHoanThanhDukien,
                "DD/MM/YYYY"
              ),
            },
          });
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
          : type === "detail" || type === "UploadFile"
          ? `/${id}/chi-tiet`
          : `/${id}/xac-nhan`,
        ""
      )}`
    );
  };
  const getDetailVatTu = (data) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `VatTu/${data.vatTu_Id}`,
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
          res.data.ghiChu = data.ghiChu;
          res.data.dinhMuc = data.dinhMuc;
          res.data.vatTu_Id = res.data.id;
          setListVatTu([...listVatTu, res.data]);
        }
      })
      .catch((error) => console.error(error));
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

  const renderSoLuong = (record) => {
    if (record) {
      const isEditing =
        editingRecord && editingRecord.vatTu_Id === record.vatTu_Id;
      return (
        <div>
          <Input
            min={0}
            style={{
              textAlign: "center",
              width: "100%",
              borderColor: isEditing && hasError ? "red" : "",
            }}
            className={`input-item ${
              isEditing && hasError ? "input-error" : ""
            }`}
            value={record.soLuong}
            type="number"
            onChange={(val) => handleInputChange(val, record)}
            disabled={type !== "new"}
          />
          {isEditing && hasError && (
            <div style={{ color: "red" }}>{errorMessage}</div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleInputChange = (val, record) => {
    const sl = val.target.value;
    if (sl === null || sl === "") {
      setHasError(true);
      setErrorMessage("Vui lòng nhập số lượng hợp lệ");
      setFieldTouch(false);
    } else {
      if (sl <= 0) {
        setHasError(true);
        setErrorMessage("Số lượng xuất phải lớn hơn 0");
        setFieldTouch(false);
      } else {
        setFieldTouch(true);
        setHasError(false);
        setErrorMessage(null);
      }
    }
    setEditingRecord(record);

    setListVatTu((prevListVatTu) => {
      return prevListVatTu.map((item) => {
        if (record.vatTu_Id === item.vatTu_Id) {
          return {
            ...item,
            soLuong: sl ? parseFloat(sl) : 0,
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
      key: "soLuong",
      align: "center",
      render: (record) => renderSoLuong(record),
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
    saveData(values.dathangnoibo);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (listVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.dathangnoibo, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (dathangnoibo, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...dathangnoibo,
        ngayYeuCau: dathangnoibo.ngayYeuCau._i,
        ngayHoanThanhDukien: dathangnoibo.ngayHoanThanhDukien._i,
        chiTiet_DatHangNoiBos: listVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDatHangNoiBo`,
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
              getUserLap(INFO);
              getUserKy(INFO);
              getNhaCungCap();
              setFieldsValue({
                dathangnoibo: {
                  ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
                  ngayHoanThanhDukien: moment(getDateNow(), "DD/MM/YYYY"),
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
      listVatTu.forEach((vt, index) => {
        listVatTu[index].lkn_PhieuMuaHang_Id = id;
      });
      const newData = {
        ...dathangnoibo,
        ngayYeuCau: dathangnoibo.ngayYeuCau._i,
        ngayHoanThanhDukien: dathangnoibo.ngayHoanThanhDukien._i,
        chiTiet_DatHangNoiBos: listVatTu,
        id: id,
        maDonHang: info.maPhieuYeuCau,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDatHangNoiBo/${id}`,
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
  const hanldeXacNhan = () => {
    const newData = {
      id: id,
      isXacNhan: true,
      chiTiet_phieumuahangs: listVatTu.map((vt) => {
        return {
          ...vt,
          lkn_PhieuMuaHang_Id: id,
        };
      }),
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_phieudathangnoibo/xac-nhan/${id}`,
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
    title: "Xác nhận phiếu đặt hàng nội bộ",
    onOk: hanldeXacNhan,
  };
  const modalXK = () => {
    Modal(prop);
  };
  const hanldeXacNhanTaiFile = () => {
    const formData = new FormData();
    formData.append("file", File);
    const url = info.fileXacNhan
      ? `${BASE_URL_API}/api/Upload?stringPath=${info.fileXacNhan}`
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
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `lkn_PhieuDatHangNoiBo/tai-file-dat-hang-noi-bo/${id}`,
              "PUT",
              { id: id, file: data.path },
              "GUIPHIEU",
              "",
              resolve,
              reject
            )
          );
        })
          .then((res) => {
            if (res.status !== 409) getInfo(id, true);
          })
          .catch((error) => console.error(error));
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
          `lkn_phieudathangnoibo/xac-nhan/${id}`,
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

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu đặt hàng nội bộ "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu đặt hàng nội bộ"
    ) : (
      <span>
        Chi tiết phiếu đặt hàng nội bộ -{" "}
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

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
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
                label="Người gửi"
                name={["dathangnoibo", "userYeuCau_Id"]}
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
                  placeholder="Chọn người gửi"
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
                label="Nơi gửi"
                name={["dathangnoibo", "userYeuCau_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy}
                  placeholder="Chọn người gửi"
                  optionsvalue={["user_Id", "tenDonVi"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
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
                label="Nhà cung cấp"
                name={["dathangnoibo", "userNhan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhaCungCap}
                  placeholder="Chọn nhà cung cấp"
                  optionsvalue={["id", "tenNhaCungCap"]}
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
                label="Người liên hệ:"
                name={["dathangnoibo", "userNhan_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhaCungCap}
                  placeholder="Chọn người liên hệ"
                  optionsvalue={["id", "nguoiLienHe"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
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
                label="Địa chỉ"
                name={["dathangnoibo", "userNhan_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhaCungCap}
                  placeholder="Chọn địa chỉ"
                  optionsvalue={["id", "diaChi"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
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
                label="Điện thoại"
                name={["dathangnoibo", "userNhan_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhaCungCap}
                  placeholder="Chọn số điện thoại"
                  optionsvalue={["id", "soDienThoai"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
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
                label="Người nhận"
                name={["dathangnoibo", "nguoiNhan_DHNB"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập tên người nhận"
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
                label="Email"
                name={["dathangnoibo", "emailNguoiNhan_DHNB"]}
                rules={[
                  {
                    type: "email",
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập email người nhận"
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
                label="Dự kiến hoàn thành"
                name={["dathangnoibo", "ngayHoanThanhDukien"]}
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
                  disabledDate={disabledDate}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      dathangnoibo: {
                        ngayHoanThanhDukien: moment(dateString, "DD/MM/YYYY"),
                      },
                    });
                  }}
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
                name={["dathangnoibo", "ngayYeuCau"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  disabled={true}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      dathangnoibo: {
                        ngayYeuCau: moment(dateString, "DD/MM/YYYY"),
                      },
                    });
                  }}
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
                label="CV thu mua"
                name={["dathangnoibo", "userThuMua_Id"]}
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
                  placeholder="Chọn chuyên viên thu mua"
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
                label="Yêu cầu"
                name={["dathangnoibo", "yeuCau"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập yêu cầu"
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
                label="Địa điểm giao hàng"
                name={["dathangnoibo", "diaDiemGiaoHang"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập địa điểm giao hàng"
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
                label="Người kiểm tra"
                name={["dathangnoibo", "userKiemTra_Id"]}
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
                  placeholder="Chọn người kiểm tra"
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
                label="Kế toán duyệt"
                name={["dathangnoibo", "userKeToan_Id"]}
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
                name={["dathangnoibo", "userDuyet_Id"]}
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
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
          </Row>
          {(type === "UploadFile" ||
            type === "xacnhan" ||
            type === "detail") && (
            <>
              <Divider />
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
                    label="File đã ký"
                    name={["dinhmucvattu", "userDuyet_Id"]}
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
                          style={{ color: "#0469B9", cursor: "pointer" }}
                          onClick={() => handleViewFile(File)}
                        >
                          {File.name.length > 20
                            ? File.name.substring(0, 20) + "..."
                            : File.name}{" "}
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
                        {type === "UploadFile" &&
                          (!info.isXacNhan || info.isXacNhan !== true) && (
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
            </>
          )}
        </Form>
        {(type === "new" || type === "edit") && (
          <Col
            xxl={24}
            xl={24}
            lg={24}
            md={24}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
            align="center"
          >
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => setActiveModal(true)}
            >
              Thêm vật tư
            </Button>
          </Col>
        )}
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
      </Card>
      <AddVatTuModal
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        addVatTu={addVatTu}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
};

export default DatHangNoiBoForm;
