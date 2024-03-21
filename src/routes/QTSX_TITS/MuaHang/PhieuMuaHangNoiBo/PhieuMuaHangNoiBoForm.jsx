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
  EditableTableRow,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_TWO_COL } from "src/constants/Config";
import {
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
  renderPDF,
  convertObjectToUrlParams,
} from "src/util/Common";
import Helper from "src/helpers";
import ModalChonVatTu from "./ModalChonVatTu";
import ImportDanhSachVatTu from "./ImportDanhSachVatTu";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const PhieuMuaHangNoiBoForm = ({ history, match, permission }) => {
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
  const [ListNhaCungCap, setListNhaCungCap] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [disableUpload, setDisableUpload] = useState(false);
  const [File, setFile] = useState(null);
  const [editingRecord, setEditingRecord] = useState([]);
  const [info, setInfo] = useState({});
  const [ActiveModalChonVatTu, setActiveModalChonVatTu] = useState(false);
  const [ActiveModalImportVatTu, setActiveModalImportVatTu] = useState(false);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getListNhaCungCap();
          getUserKy();
          setFieldsValue({
            phieumuahangnoibo: {
              ngayTaoPhieu: moment(getDateNow(), "DD/MM/YYYY"),
              benMua:
                "CÔNG TY TNHH SẢN XUẤT SƠ MI RƠ MOÓC VÀ CẤU KIỆN NẶNG THACO INDUSTRIES",
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
          getListNhaCungCap();
          getUserKy();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id, true);
          getListNhaCungCap();
          getUserKy();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListNhaCungCap = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi?page=-1&tapdoanid=${INFO.tapDoan_Id}`,
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
  };

  const getUserKy = (info) => {
    const params = convertObjectToUrlParams({
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account?${params}`,
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
        setListUserKy(newData);
      } else {
        setListUserKy([]);
      }
    });
  };

  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id, check) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuMuaHangNoiBo/${id}`,
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
            newData.tits_qtsx_PhieuMuaHangNoiBoChiTiets &&
            JSON.parse(newData.tits_qtsx_PhieuMuaHangNoiBoChiTiets).map(
              (data) => {
                return {
                  ...data,
                  thanhTien: data.donGia && data.soLuong * data.donGia,
                };
              }
            );
          setListVatTu(vattu);

          if (newData.file) {
            setFile(newData.file);
            setDisableUpload(true);
          }

          setFieldsValue({
            phieumuahangnoibo: {
              ...newData,
              ngayTaoPhieu: moment(newData.ngayYeuCau, "DD/MM/YYYY"),
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
          : `/${id}/chi-tiet`,
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
      permission && permission.del && type !== "detail"
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
    const soLuong = val.target.value;
    if (isEmpty(soLuong) || Number(soLuong) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData = editingRecord.filter(
        (d) => d.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListVatTu];
    newData.forEach((ct, index) => {
      if (ct.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id) {
        ct.soLuong = soLuong;
        ct.thanhTien = ct.donGia && parseFloat(soLuong * ct.donGia);
      }
    });
    setListVatTu(newData);
  };

  const rendersoLuong = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id) {
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
          }}
          className={`input-item`}
          type="number"
          value={item.soLuong}
          disabled={type === "detail" ? true : false}
          onChange={(val) => handleInputChange(val, item)}
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
      width: 50,
      align: "center",
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      width: 150,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      width: 250,
    },
    {
      title: "Loại vật tư",
      dataIndex: "tenLoaiVatTu",
      key: "tenLoaiVatTu",
      align: "center",
      width: 150,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 100,
    },
    {
      title: "Đơn hàng",
      dataIndex: "maPhieu",
      key: "maPhieu",
      align: "center",
    },
    {
      title: "Số lượng",
      key: "soLuong",
      align: "center",
      render: (record) => rendersoLuong(record),
    },
    {
      title: "Ngày yêu cầu giao",
      dataIndex: "ngay",
      key: "ngay",
      align: "center",
      width: 150,
    },
    {
      title: "Đơn giá",
      dataIndex: "donGia",
      key: "donGia",
      align: "center",
      width: 100,
    },
    {
      title: "Thành tiền",
      dataIndex: "thanhTien",
      key: "thanhTien",
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
    uploadFile(values.phieumuahangnoibo);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          uploadFile(values.phieumuahangnoibo, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (phieumuahangnoibo, saveQuit) => {
    if (type === "new" && phieumuahangnoibo.file) {
      const formData = new FormData();
      console.log(phieumuahangnoibo.file.file);
      formData.append("file", phieumuahangnoibo.file.file);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          phieumuahangnoibo.file = data.path;
          saveData(phieumuahangnoibo, saveQuit);
        })
        .catch(() => {
          console.log("upload failed.");
        });
    } else if (
      type === "edit" &&
      phieumuahangnoibo.file &&
      phieumuahangnoibo.file.file
    ) {
      const formData = new FormData();
      formData.append("file", phieumuahangnoibo.file.file);
      fetch(
        info.file
          ? `${BASE_URL_API}/api/Upload?stringPath=${info.file}`
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
          phieumuahangnoibo.file = data.path;
          saveData(phieumuahangnoibo, saveQuit);
        })
        .catch(() => {
          console.log("upload failed.");
        });
    } else {
      saveData(phieumuahangnoibo, saveQuit);
    }
  };

  const saveData = (phieumuahangnoibo, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...phieumuahangnoibo,
        ngayTaoPhieu: phieumuahangnoibo.ngayTaoPhieu.format("DD/MM/YYYY"),
        tits_qtsx_PhieuMuaHangNoiBoChiTiets: ListVatTu.map((dt) => {
          return {
            ...dt,
            soLuong: parseFloat(dt.soLuong),
            donGia: parseFloat(dt.donGia),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuMuaHangNoiBo`,
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
                phieumuahangnoibo: {
                  ngayTaoPhieu: moment(getDateNow(), "DD/MM/YYYY"),
                  benMua:
                    "CÔNG TY TNHH SẢN XUẤT SƠ MI RƠ MOÓC VÀ CẤU KIỆN NẶNG THACO INDUSTRIES",
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
        ...phieumuahangnoibo,
        ngayTaoPhieu: phieumuahangnoibo.ngayTaoPhieu.format("DD/MM/YYYY"),
        tits_qtsx_PhieuMuaHangNoiBoChiTiets: ListVatTu.map((dt) => {
          return {
            ...dt,
            soLuong: parseFloat(dt.soLuong),
            donGia: parseFloat(dt.donGia),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuMuaHangNoiBo/${id}`,
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

  const DataThemVatTu = (data) => {
    setListVatTu([...ListVatTu, ...data]);
    setFieldTouch(true);
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

  const handleViewFile = (file) => {
    if (file.type === "application/pdf") {
      renderPDF(file);
    } else {
    }
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu mua hàng nội bộ "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu mua hàng nội bộ"
    ) : (
      <span>
        Chi tiết phiếu mua hàng nội bộ -{" "}
        <Tag color={"blue"} style={{ fontSize: 15 }}>
          {info && info.maPhieu}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin phiếu mua hàng nội bộ"}
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
                name={["phieumuahangnoibo", "tenDonHang"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập tên đơn hàng"
                  disabled={type === "detail" ? true : false}
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
                label="Ngày tạo phiếu"
                name={["phieumuahangnoibo", "ngayTaoPhieu"]}
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
                label="Đơn vị cung cấp"
                name={["phieumuahangnoibo", "tits_qtsx_NhaCungCap_Id"]}
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
                  placeholder="Chọn đơn vị cung cấp"
                  optionsvalue={["id", "tenDonVi"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "detail" ? true : false}
                />
              </FormItem>
            </Col>
            {/* <Col
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
                name={["phieumuahangnoibo", "tits_qtsx_NhaCungCap_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhaCungCap}
                  placeholder="Địa chỉ đơn vị cung cấp"
                  optionsvalue={["id", "diaChi"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={true}
                />
              </FormItem>
            </Col> */}
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
                label="Bên mua"
                name={["phieumuahangnoibo", "benMua"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập bên mua"
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
                label="Người kiểm tra"
                name={["phieumuahangnoibo", "nguoiKiemTra_Id"]}
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
                  optionsvalue={["user_Id", "user"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "detail" ? true : false}
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
                name={["phieumuahangnoibo", "nguoiKeToan_Id"]}
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
                  optionsvalue={["user_Id", "user"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "detail" ? true : false}
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
                name={["phieumuahangnoibo", "nguoiDuyet_Id"]}
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
                  optionsvalue={["user_Id", "user"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "detail" ? true : false}
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
                name={["phieumuahangnoibo", "diaChiGiaoHang"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập địa điểm giao hàng"
                  disabled={type === "detail" ? true : false}
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
                label="Hình thức thanh toán"
                name={["phieumuahangnoibo", "hinhThucThanhToan"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập hình thức thanh toán"
                  disabled={type === "detail" ? true : false}
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
                label="Ghi chú"
                name={["phieumuahangnoibo", "moTa"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập ghi chú"
                  disabled={type === "detail" ? true : false}
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
                name={["phieumuahangnoibo", "file"]}
              >
                {!disableUpload ? (
                  <Upload {...props}>
                    <Button
                      className="th-margin-bottom-0"
                      style={{
                        marginBottom: 0,
                      }}
                      icon={<UploadOutlined />}
                      disabled={type === "detail"}
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
                      disabled={type === "detail" ? true : false}
                      onClick={() => {
                        setFile(null);
                        setDisableUpload(false);
                        setFieldTouch(true);
                        setFieldsValue({
                          phieumuahangnoibo: {
                            file: null,
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
                    {type !== "detail" && (
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setFile(null);
                          setDisableUpload(false);
                          setFieldTouch(true);
                          setFieldsValue({
                            phieumuahangnoibo: {
                              file: null,
                            },
                          });
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
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Danh sách vật tư"}
      >
        {type !== "detail" && (
          <div align={"end"} style={{ marginBottom: 10 }}>
            <Button
              icon={<UploadOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={() => setActiveModalImportVatTu(true)}
            >
              Import vật tư
            </Button>
            <Button
              icon={<PlusCircleOutlined />}
              className="th-margin-bottom-0"
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
      {type !== "detail" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={saveAndClose}
          saveAndClose={saveAndClose}
          disabled={fieldTouch && ListVatTu.length !== 0}
        />
      ) : null}
      <ImportDanhSachVatTu
        openModal={ActiveModalImportVatTu}
        openModalFS={setActiveModalImportVatTu}
        itemData={ListVatTu && ListVatTu}
        DataThemVatTu={DataThemVatTu}
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

export default PhieuMuaHangNoiBoForm;
