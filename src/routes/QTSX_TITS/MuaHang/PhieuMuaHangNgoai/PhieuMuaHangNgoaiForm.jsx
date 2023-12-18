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
  Button,
  Tag,
  Upload,
  DatePicker,
} from "antd";
import { includes, isEmpty, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { BASE_URL_API } from "src/constants/Config";
import {
  FormSubmit,
  Select,
  Table,
  ModalDeleteConfirm,
  Modal,
  EditableTableRow,
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
import Helper from "src/helpers";
import ModalChonVatTu from "./ModalChonVatTu";
import ModalTuChoi from "./ModalTuChoi";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const PhieuMuaHangNgoaiForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [disableUpload, setDisableUpload] = useState(false);
  const [File, setFile] = useState(null);
  const [FileXacNhan, setFileXacNhan] = useState(null);
  const [disableUploadXacNhan, setDisableUploadXacNhan] = useState(false);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [ActiveModalChonVatTu, setActiveModalChonVatTu] = useState(false);
  const [editingRecord, setEditingRecord] = useState([]);
  const [errors, setErrors] = useState({});
  const [info, setInfo] = useState({});

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getListDonVi();
          getUserKy(INFO);
          setFieldsValue({
            phieumuahangngoai: {
              donViYeuCau_Id: INFO.donVi_Id.toLowerCase(),
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
          getListDonVi();
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id, true);
          getListDonVi();
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
          getListDonVi();
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

  const getListDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`DonVi?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
      );
    }).then((res) => {
      if (res && res.data) {
        setListDonVi(res.data);
      } else {
        setListDonVi([]);
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
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuMuaHangNgoai/${id}`,
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
          const newData = res.data;
          setInfo(newData);

          const vattu =
            newData.tits_qtsx_PhieuMuaHangNgoaiChiTiets &&
            JSON.parse(newData.tits_qtsx_PhieuMuaHangNgoaiChiTiets);
          setListVatTu(vattu);

          if (newData.fileDinhKem) {
            setFile(newData.fileDinhKem);
            setDisableUpload(true);
          }
          if (newData.fileXacNhan) {
            setFileXacNhan(newData.fileXacNhan);
            setDisableUploadXacNhan(true);
          }

          setFieldsValue({
            phieumuahangngoai: {
              ...newData,
              ngayGiaoDuKien:
                newData.tinhTrang === "Chưa xác nhận"
                  ? moment(getDateNow(), "DD/MM/YYYY")
                  : moment(newData.ngayGiaoDuKien, "DD/MM/YYYY"),
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
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = ListVatTu.filter(
      (d) => d.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
    );
    if (newData.length !== 0) {
      setFieldTouch(true);
    }
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

  const handleInputChange = (val, item, key) => {
    const soLuong = val.target.value;
    const newErrors = { ...errors };

    if (isEmpty(soLuong) || Number(soLuong) <= 0) {
      setFieldTouch(false);

      newErrors[item.tits_qtsx_VatTu_Id] = {
        ...newErrors[item.tits_qtsx_VatTu_Id],
        [key]: "Số lượng phải là số lớn hơn 0 và bắt buộc",
      };
    } else {
      const newData = editingRecord.filter(
        (d) => d.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);

      if (newErrors[item.tits_qtsx_VatTu_Id]) {
        delete newErrors[item.tits_qtsx_VatTu_Id][key];
        if (Object.keys(newErrors[item.tits_qtsx_VatTu_Id]).length === 0) {
          delete newErrors[item.tits_qtsx_VatTu_Id];
        }
      }
    }

    const newData = [...ListVatTu];
    newData.forEach((ct, index) => {
      if (ct.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id) {
        ct[key] = soLuong;
      }
    });
    setListVatTu(newData);
    setErrors(newErrors);
  };

  const rendersoLuong = (item, key) => {
    let isEditing = false;
    let message = "";

    if (
      errors[item.tits_qtsx_VatTu_Id] &&
      errors[item.tits_qtsx_VatTu_Id][key]
    ) {
      isEditing = true;
      message = errors[item.tits_qtsx_VatTu_Id][key];
    }

    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          value={item[key]}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChange(val, item, key)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
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
      title: "Loại vật tư",
      dataIndex: "tenLoaiVatTu",
      key: "tenLoaiVatTu",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Đơn hàng",
      dataIndex: "maPhieu",
      key: "maPhieu",
      align: "center",
    },
    {
      title: "Định mức",
      dataIndex: "dinhMuc",
      key: "dinhMuc",
      align: "center",
    },
    {
      title: "SL dự phòng",
      key: "soLuongDuPhong",
      align: "center",
      render: (value) => rendersoLuong(value, "soLuongDuPhong"),
    },
    {
      title: "SL đặt mua",
      key: "soLuongDatMua",
      align: "center",
      render: (value) => rendersoLuong(value, "soLuongDatMua"),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "ngay",
      key: "ngay",
      align: "center",
    },
    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
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
    uploadFile(values.phieumuahangngoai);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          uploadFile(values.phieumuahangngoai, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (phieumuahangngoai, saveQuit) => {
    if (type === "new" && phieumuahangngoai.fileDinhKem) {
      const formData = new FormData();
      formData.append("file", phieumuahangngoai.fileDinhKem.file);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          phieumuahangngoai.fileDinhKem = data.path;
          saveData(phieumuahangngoai, saveQuit);
        })
        .catch(() => {
          console.log("upload failed.");
        });
    } else if (
      type === "edit" &&
      phieumuahangngoai.fileDinhKem &&
      phieumuahangngoai.fileDinhKem.file
    ) {
      const formData = new FormData();
      formData.append("file", phieumuahangngoai.fileDinhKem.file);
      fetch(
        info.fileDinhKem
          ? `${BASE_URL_API}/api/Upload?stringPath=${info.fileDinhKem}`
          : `${BASE_URL_API}/api/Upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          phieumuahangngoai.fileDinhKem = data.path;
          saveData(phieumuahangngoai, saveQuit);
        })
        .catch(() => {
          console.log("upload failed.");
        });
    } else {
      saveData(phieumuahangngoai, saveQuit);
    }
  };

  const saveData = (phieumuahangngoai, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...phieumuahangngoai,
        tits_qtsx_PhieuMuaHangNgoaiChiTiets: ListVatTu.map((dt) => {
          return {
            ...dt,
            dinhMuc: parseFloat(dt.dinhMuc),
            soLuongDuPhong: parseFloat(dt.soLuongDuPhong),
            soLuongDatMua: parseFloat(dt.soLuongDatMua),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuMuaHangNgoai`,
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
              setFieldsValue({
                phieumuahangngoai: {
                  donViYeuCau_Id: INFO.donVi_Id.toLowerCase(),
                },
              });
              setDisableUpload(false);
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
        ...phieumuahangngoai,
        tits_qtsx_PhieuMuaHangNgoaiChiTiets: ListVatTu.map((dt) => {
          return {
            ...dt,
            dinhMuc: parseFloat(dt.dinhMuc),
            soLuongDuPhong: parseFloat(dt.soLuongDuPhong),
            soLuongDatMua: parseFloat(dt.soLuongDatMua),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuMuaHangNgoai/${id}`,
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
    validateFields()
      .then((values) => {
        const datalist = values.phieumuahangngoai;
        if (!datalist.fileXacNhan) {
          Helpers.alertError("File xác nhận không được để trống");
        } else if (!datalist.nguoiThuMua_Id) {
          Helpers.alertError("Chuyên viên thu mua không được để trống");
        } else if (datalist.fileXacNhan && datalist.fileXacNhan.file) {
          const formData = new FormData();
          formData.append("file", datalist.fileXacNhan.file);
          fetch(
            info.fileXacNhan
              ? `${BASE_URL_API}/api/Upload?stringPath=${info.fileXacNhan}`
              : `${BASE_URL_API}/api/Upload`,
            {
              method: "POST",
              body: formData,
              headers: {
                Authorization: "Bearer ".concat(INFO.token),
              },
            }
          )
            .then((res) => res.json())
            .then((data) => {
              const newData = {
                ...datalist,
                ngayGiaoDuKien: datalist.ngayGiaoDuKien.format("DD/MM/YYYY"),
                fileXacNhan: data.path,
                id: id,
                isDuyet: true,
              };
              new Promise((resolve, reject) => {
                dispatch(
                  fetchStart(
                    `tits_qtsx_PhieuMuaHangNgoai/xac-nhan/${id}`,
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
                    setFileXacNhan(null);
                    setDisableUploadXacNhan(false);
                    setFieldTouch(false);
                    getInfo(id);
                  }
                })
                .catch((error) => console.error(error));
            })
            .catch(() => {
              console.log("upload failed.");
            });
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận phiếu mua hàng ngoài",
    onOk: hanldeXacNhan,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const saveTuChoi = (data) => {
    const newData = {
      id: id,
      isDuyet: false,
      lyDoTuChoi: data,
    };

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuMuaHangNgoai/xac-nhan/${id}`,
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

  const DataThemVatTu = (data) => {
    setListVatTu([...ListVatTu, ...data]);
  };

  const props = {
    accept: ".pdf, .xlsx",
    beforeUpload: (file) => {
      const isPDF = file.type === "application/pdf";
      const isXLSX =
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      if (!isPDF && !isXLSX) {
        Helper.alertError(
          `${file.name} không phải là file PDF hoặc file Excel`
        );
      } else {
        setFile(file);
        setDisableUpload(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const propsxacnhan = {
    accept: ".pdf",
    beforeUpload: (file) => {
      const isPDF = file.type === "application/pdf";

      if (!isPDF) {
        Helper.alertError(`${file.name} không phải là file PDF`);
      } else {
        setFileXacNhan(file);
        setDisableUploadXacNhan(true);
        setFieldTouch(true);
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
    }
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu mua hàng ngoài"
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu mua hàng ngoài"
    ) : (
      <span>
        Chi tiết phiếu mua hàng ngoài -{" "}
        <Tag color={"blue"} style={{ fontSize: 15 }}>
          {info && info.maPhieu}
        </Tag>
        <Tag
          color={
            info && info.tinhTrang === "Chưa xác nhận"
              ? "orange"
              : info && info.tinhTrang === "Đã xác nhận"
              ? "blue"
              : "red"
          }
          style={{ fontSize: 15 }}
        >
          {info && info.tinhTrang}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin phiếu đề nghị mua hàng"}
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
                label="Đơn vị yêu cầu"
                name={["phieumuahangngoai", "donViYeuCau_Id"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListDonVi}
                  placeholder="Chọn đơn vị yêu cầu"
                  optionsvalue={["id", "tenDonVi"]}
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
                label="Đơn vị nhận yêu cầu"
                name={["phieumuahangngoai", "donViNhanYeuCau_Id"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListDonVi}
                  placeholder="Đơn vị nhận yêu cầu"
                  optionsvalue={["id", "tenDonVi"]}
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
                label="Người nhận"
                name={["phieumuahangngoai", "nguoiNhan_Id"]}
                rules={[
                  {
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
                name={["phieumuahangngoai", "nguoiKiemTra_Id"]}
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
                name={["phieumuahangngoai", "nguoiKeToan_Id"]}
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
                name={["phieumuahangngoai", "nguoiDuyet_Id"]}
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
                label="Địa chỉ giao hàng"
                name={["phieumuahangngoai", "diaChiGiaoHang"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập địa chỉ giao hàng"
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
                label="File đính kèm"
                name={["phieumuahangngoai", "fileDinhKem"]}
              >
                {!disableUpload ? (
                  <Upload {...props}>
                    <Button
                      style={{
                        marginBottom: 0,
                      }}
                      icon={<UploadOutlined />}
                      disabled={type === "xacnhan" || type === "detail"}
                    >
                      File đính kèm
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
                      {File.name}{" "}
                    </span>
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      onClick={() => {
                        setFile(null);
                        setDisableUpload(false);
                        setFieldTouch(true);
                        setFieldsValue({
                          phieumuahangngoai: {
                            fileDinhKem: null,
                          },
                        });
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
                    {(type === "new" || type === "edit") && (
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setFile(null);
                          setDisableUpload(false);
                          setFieldTouch(true);
                          setFieldsValue({
                            phieumuahangngoai: {
                              fileDinhKem: null,
                            },
                          });
                        }}
                      />
                    )}
                  </span>
                )}
              </FormItem>
            </Col>
            {(info.isDuyet === true ||
              (type === "xacnhan" && info.tinhTrang === "Chưa xác nhận")) && (
              <>
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
                    name={["phieumuahangngoai", "nguoiThuMua_Id"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      data={ListUserKy}
                      placeholder="Chọn người thu mua"
                      optionsvalue={["user_Id", "fullName"]}
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp="name"
                      disabled={
                        type === "xacnhan" && info.tinhTrang === "Chưa xác nhận"
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
                    label="File xác nhận"
                    name={["phieumuahangngoai", "fileXacNhan"]}
                  >
                    {!disableUploadXacNhan ? (
                      <Upload {...propsxacnhan}>
                        <Button
                          style={{
                            marginBottom: 0,
                          }}
                          icon={<UploadOutlined />}
                          disabled={type === "detail"}
                        >
                          File xác nhận
                        </Button>
                      </Upload>
                    ) : FileXacNhan && FileXacNhan.name ? (
                      <span>
                        <span
                          style={{
                            color: "#0469B9",
                            cursor: "pointer",
                            whiteSpace: "break-spaces",
                          }}
                          onClick={() => handleViewFile(FileXacNhan)}
                        >
                          {FileXacNhan.name}{" "}
                        </span>
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => {
                            setFileXacNhan(null);
                            setDisableUploadXacNhan(false);
                            setFieldTouch(false);
                            setFieldsValue({
                              phieumuahangngoai: {
                                fileXacNhan: null,
                              },
                            });
                          }}
                        />
                      </span>
                    ) : (
                      <span>
                        <a
                          target="_blank"
                          href={BASE_URL_API + FileXacNhan && FileXacNhan}
                          rel="noopener noreferrer"
                          style={{
                            whiteSpace: "break-spaces",
                            wordBreak: "break-all",
                          }}
                        >
                          {FileXacNhan && FileXacNhan.split("/")[5]}{" "}
                        </a>
                      </span>
                    )}
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
                    label="Ngày giao dự kiến"
                    name={["phieumuahangngoai", "ngayGiaoDuKien"]}
                  >
                    <DatePicker
                      format={"DD/MM/YYYY"}
                      allowClear={false}
                      disabled={
                        type === "xacnhan" && info.tinhTrang === "Chưa xác nhận"
                          ? false
                          : true
                      }
                    />
                  </FormItem>
                </Col>
              </>
            )}
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
                  name={["phieumuahangngoai", "lyDoDuyetTuChoi"]}
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
        title={"Thông tin vật tư"}
      >
        {(type === "new" || type === "edit") && (
          <div align={"end"}>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => setActiveModalChonVatTu(true)}
              type="primary"
            >
              Thêm vật tư
            </Button>
          </div>
        )}
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
      {type === "xacnhan" && info.tinhTrang === "Chưa xác nhận" && (
        <Row justify={"end"} style={{ marginTop: 15 }}>
          <Col style={{ marginRight: 15 }}>
            <Button type="primary" onClick={modalXK} disabled={!fieldTouch}>
              Xác nhận
            </Button>
          </Col>
          <Col style={{ marginRight: 15 }}>
            <Button
              type="danger"
              onClick={() => setActiveModalTuChoi(true)}
              disabled={info.tinhTrang !== "Chưa xác nhận"}
            >
              Từ chối
            </Button>
          </Col>
        </Row>
      )}
      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={saveAndClose}
          saveAndClose={saveAndClose}
          disabled={fieldTouch && ListVatTu.length !== 0}
        />
      ) : null}
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
      <ModalChonVatTu
        openModal={ActiveModalChonVatTu}
        openModalFS={setActiveModalChonVatTu}
        itemData={ListVatTu && ListVatTu}
        DataThemVatTu={DataThemVatTu}
      />
    </div>
  );
};

export default PhieuMuaHangNgoaiForm;
