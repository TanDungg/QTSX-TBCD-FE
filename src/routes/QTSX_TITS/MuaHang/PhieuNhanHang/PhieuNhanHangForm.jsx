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
} from "antd";
import { includes, isEmpty, map } from "lodash";
import Helper from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  ModalDeleteConfirm,
  EditableTableRow,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API, DEFAULT_FORM_TWO_COL } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
  renderPDF,
} from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;
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
  const [ListPhieuMuaHang, setListPhieuMuaHang] = useState([]);
  const [ListNguoiNhan, setListNguoiNhan] = useState([]);
  const [File, setFile] = useState("");
  const [disableUpload, setDisableUpload] = useState(false);
  const [editingRecord, setEditingRecord] = useState([]);
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getNguoiNhanHang(INFO);
          setFieldsValue({
            phieunhanhang: {
              ngayTao: moment(getDateNow(), "DD/MM/YYYY"),
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
          getNguoiNhanHang(INFO);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getNguoiNhanHang(INFO);
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

  const getNguoiNhanHang = (info) => {
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
        setListNguoiNhan(res.data);
      } else {
        setListNguoiNhan([]);
      }
    });
  };

  const getPhieuMuaHang = (IsLoaiPhieu) => {
    const params = convertObjectToUrlParams({
      IsLoaiPhieu,
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuNhanHang/list-phieu-mua-hang-theo-loai?${params}`,
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
      } else {
        setListPhieuMuaHang([]);
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
          `tits_qtsx_PhieuNhanHang/${id}`,
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
          setInfo(data);

          const chiTiet =
            data.chiTietPhieus &&
            data.chiTietPhieus.map((data) => {
              return {
                ...data,
                soLuongCu: data.soLuong,
              };
            });
          setListVatTu(chiTiet);

          if (data.file) {
            setDisableUpload(true);
            setFile(data.file);
          }

          setFieldsValue({
            phieunhanhang: {
              ...data,
              ngayTao: moment(data.ngayTao, "DD/MM/YYYY"),
              isLoaiPhieu: data.isLoaiPhieu.toString(),
            },
          });
          getPhieuMuaHang(data.isLoaiPhieu);
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
    const newData = listVatTu.filter(
      (d) =>
        d.tits_qtsx_PhieuMuaHangChiTiet_Id !==
        item.tits_qtsx_PhieuMuaHangChiTiet_Id
    );
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

  const handleInputChange = (val, item) => {
    const SoLuongNhan = val.target.value;
    if (isEmpty(SoLuongNhan) || Number(SoLuongNhan) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng nhận phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData = editingRecord.filter(
        (d) =>
          d.tits_qtsx_PhieuMuaHangChiTiet_Id !==
          item.tits_qtsx_PhieuMuaHangChiTiet_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...listVatTu];
    const newListVatTu = newData.map((dt) => {
      if (
        dt.tits_qtsx_PhieuMuaHangChiTiet_Id ===
        item.tits_qtsx_PhieuMuaHangChiTiet_Id
      ) {
        return {
          ...dt,
          soLuong: SoLuongNhan,
          vatTus: dt.isChiTiet
            ? dt.vatTus.map((vattu) => {
                return {
                  ...vattu,
                  soLuong: vattu.dinhMuc * SoLuongNhan,
                };
              })
            : [],
        };
      } else {
        return dt;
      }
    });
    setListVatTu(newListVatTu);
  };

  const rendersoLuong = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (
        ct.tits_qtsx_PhieuMuaHangChiTiet_Id ===
        item.tits_qtsx_PhieuMuaHangChiTiet_Id
      ) {
        isEditing = true;
        message = ct.message;
      }
    });
    return type === "detail" ? (
      item.soLuong
    ) : (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          value={item.soLuong}
          disabled={type === "new" || type === "edit" ? false : true}
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
      title: "Số lượng chưa nhận",
      dataIndex: "soLuongChuaNhan",
      key: "soLuongChuaNhan",
      align: "center",
    },
    {
      title: "Số lượng nhận",
      key: "soLuong",
      align: "center",
      render: (record) => rendersoLuong(record),
    },
    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
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

  const renderChildItems = (record) => {
    if (record.isChiTiet) {
      return (
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <Table
            bordered
            scroll={{ y: "35vh", x: 1100 }}
            columns={colValuesChildren}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(record.vatTus)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
          />
        </div>
      );
    }
    return null;
  };

  let colValuesChildren = [
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
      title: "Số lượng chưa nhận",
      dataIndex: "soLuongChuaNhan",
      key: "soLuongChuaNhan",
      align: "center",
    },
    {
      title: "Số lượng nhận",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
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
    if (type === "new" && phieunhanhang.file) {
      const formData = new FormData();
      formData.append("file", phieunhanhang.file.file);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          phieunhanhang.file = data.path;
          saveData(phieunhanhang, saveQuit);
        })
        .catch(() => {
          console.log("upload failed.");
        });
    } else if (
      type === "edit" &&
      phieunhanhang.file &&
      phieunhanhang.file.file
    ) {
      const formData = new FormData();
      formData.append("file", phieunhanhang.file.file);
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
          phieunhanhang.file = data.path;
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
        ngayTao: phieunhanhang.ngayTao.format("DD/MM/YYYY"),
        chiTietPhieus: listVatTu.map((dt) => {
          return {
            ...dt,
            soLuong: dt.soLuong && parseFloat(dt.soLuong),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuNhanHang`,
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
              setFile("");
              setDisableUpload(false);
              setFieldsValue({
                phieunhanhang: {
                  ngayTao: moment(getDateNow(), "DD/MM/YYYY"),
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
        ...phieunhanhang,
        id: id,
        tits_qtsx_PhieuMuaHang_Id: info.tits_qtsx_PhieuMuaHang_Id,
        ngayTao: phieunhanhang.ngayTao.format("DD/MM/YYYY"),
        chiTietPhieus: listVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuNhanHang/${id}`,
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

  const handleGetListPhieu = (value) => {
    getPhieuMuaHang(value);
    setListVatTu([]);
    setFieldsValue({
      phieunhanhang: {
        tits_qtsx_PhieuMuaHang_Id: null,
      },
    });
  };

  const hanldeSelectPhieu = (value) => {
    const newData = ListPhieuMuaHang.find((d) => d.id === value);
    const data =
      newData.chiTietPhieus &&
      newData.chiTietPhieus.map((data) => {
        return {
          ...data,
          soLuong: data.soLuongChuaNhan ? data.soLuongChuaNhan : 0,
          vatTus: data.isChiTiet
            ? data.vatTus.map((vattu) => {
                return {
                  ...vattu,
                  isChildren: true,
                  soLuong: vattu.soLuongChuaNhan ? vattu.soLuongChuaNhan : 0,
                };
              })
            : [],
        };
      });
    setListVatTu(data);
  };

  const props = {
    beforeUpload: (file) => {
      const isFile = file.type === "application/pdf";
      if (!isFile) {
        Helper.alertError(`${file.name} không phải hình ảnh hoặc file pdf`);
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
    }
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu nhận hàng "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu nhận hàng"
    ) : (
      <span>
        Chi tiết phiếu nhận hàng -{" "}
        <Tag color="blue" style={{ fontSize: "14px" }}>
          {info.maPhieu}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin nhận hàng"}
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
                label="Loại phiếu"
                name={["phieunhanhang", "isLoaiPhieu"]}
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
                    { id: "1", name: "Phiếu mua hàng nội bộ" },
                    { id: "2", name: "Phiếu mua hàng ngoài" },
                    { id: "3", name: "Phiếu xuất kho ngoại quan" },
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
              {type === "new" ? (
                <FormItem
                  label="Mã phiếu mua hàng"
                  name={["phieunhanhang", "tits_qtsx_PhieuMuaHang_Id"]}
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
                    optionsvalue={["id", "maPhieu"]}
                    style={{ width: "100%" }}
                    showSearch
                    onSelect={hanldeSelectPhieu}
                    optionFilterProp="name"
                    disabled={type === "new" ? false : true}
                  />
                </FormItem>
              ) : (
                <FormItem
                  label="Mã phiếu mua hàng"
                  name={["phieunhanhang", "maPhieuMuaHang"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input className="input-item" disabled={true} />
                </FormItem>
              )}
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
              {type === "new" ? (
                <FormItem
                  label="Người yêu cầu"
                  name={["phieunhanhang", "tits_qtsx_PhieuMuaHang_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListPhieuMuaHang}
                    placeholder="Chọn mã phiếu mua hàng"
                    optionsvalue={["id", "nguoiYeuCau"]}
                    style={{ width: "100%" }}
                    showSearch
                    onSelect={hanldeSelectPhieu}
                    optionFilterProp="name"
                    disabled={true}
                  />
                </FormItem>
              ) : (
                <FormItem
                  label="Người yêu cầu"
                  name={["phieunhanhang", "nguoiYeuCau"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input className="input-item" disabled={true} />
                </FormItem>
              )}
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
                name={["phieunhanhang", "ngayTao"]}
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
                label="Người nhận hàng"
                name={["phieunhanhang", "nguoiNhan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNguoiNhan}
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
                label="File đính kèm"
                name={["phieunhanhang", "file"]}
                rules={[
                  {
                    type: "file",
                  },
                ]}
              >
                {!disableUpload ? (
                  <Upload {...props}>
                    <Button
                      className="th-margin-bottom-0"
                      style={{
                        marginBottom: 0,
                      }}
                      icon={<UploadOutlined />}
                      disabled={type === "detail" ? true : false}
                    >
                      Tải file đính kèm
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
                        setFile();
                        setDisableUpload(false);
                        setFieldsValue({
                          phieunhanhang: {
                            file: undefined,
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
          expandable={{
            expandedRowRender: renderChildItems,
            rowExpandable: (record) => record.name !== "Not Expandable",
          }}
        />
      </Card>
      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={saveAndClose}
          saveAndClose={saveAndClose}
          disabled={fieldTouch}
        />
      ) : null}
    </div>
  );
};

export default PhieuNhanHangForm;
