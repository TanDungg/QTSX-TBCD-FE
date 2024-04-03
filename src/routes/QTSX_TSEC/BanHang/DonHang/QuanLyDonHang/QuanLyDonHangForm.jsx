import {
  DeleteOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Form, Input, Row, Upload } from "antd";
import dayjs from "dayjs";
import { map } from "lodash";
import includes from "lodash/includes";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  EditableTableRow,
  FormSubmit,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  BASE_URL_API,
  DEFAULT_FORM_ADD_2COL_180PX,
} from "src/constants/Config";
import Helpers from "src/helpers";
import {
  getTokenInfo,
  getLocalStorage,
  reDataForTable,
  getDateNow,
} from "src/util/Common";
import ModalThemNoiDung from "./ModalThemNoiDung";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;
const NoiDungYeuCau = [
  {
    maSanPham: "YCKH-01",
    tenSanPham: "SanPham1",
    tenDonViTinh: "Cái",
    soLuongPO: "50",
    soLuongTonKho: "15",
    soLuongSanXuat: "55",
    giaDaBao: "150000",
    giaTheoPO: "150000",
    ngayGiaoHang: "10/04/2024",
  },
  {
    maSanPham: "YCKH-02",
    tenSanPham: "SanPham2",
    tenDonViTinh: "Cái",
    soLuongPO: "50",
    soLuongTonKho: "10",
    soLuongSanXuat: "55",
    giaDaBao: "150000",
    giaTheoPO: "150000",
    ngayGiaoHang: "10/04/2024",
  },
];

const PhieuYeuCauForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListUser, setListUser] = useState([]);
  const [FileHopDong, setFileHopDong] = useState(null);
  const [FileDinhKem, setFileDinhKem] = useState(null);
  const [ListNoiDungYeuCau, setListNoiDungYeuCau] = useState([]);
  const [ActiveModalThemNoiDung, setActiveModalThemNoiDung] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListUser();
        getListPhongBan();
        setListNoiDungYeuCau(NoiDungYeuCau);
        setFieldsValue({
          formquanlydonhang: {
            ngayGiaoHang: moment(getDateNow(), "DD/MM/YYYY"),
            ngayDatHang: moment(getDateNow(), "DD/MM/YYYY"),
          },
        });
      } else if (permission && !permission.add) {
        history.push("/home");
      }
    } else {
      if (permission && permission.edit) {
        setType("edit");
        const { id } = match.params;
        setId(id);
        getInfo(id);
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListPhongBan = () => {
    // new Promise((resolve, reject) => {
    //   dispatch(
    //     fetchStart(
    //       `Account/list-cbnv-thuoc-don-vi-va-co-quyen?donVi_Id=${INFO.donVi_Id}`,
    //       "GET",
    //       null,
    //       "DETAIL",
    //       "",
    //       resolve,
    //       reject
    //     )
    //   );
    // })
    //   .then((res) => {
    //     if (res && res.data) {
    //       const newData = res.data.map((dt) => {
    //         return {
    //           ...dt,
    //           user: `${dt.maNhanVien} - ${dt.fullName}${
    //             dt.tenPhongBan ? ` (${dt.tenPhongBan})` : ""
    //           }`,
    //         };
    //       });
    //       setListUser(newData);
    //     } else {
    //       setListUser([]);
    //     }
    // })
    // .catch((error) => console.error(error));
  };

  const getListUser = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/list-cbnv-thuoc-don-vi-va-co-quyen?donVi_Id=${INFO.donVi_Id}`,
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
          const newData = res.data.map((dt) => {
            return {
              ...dt,
              user: `${dt.maNhanVien} - ${dt.fullName}${
                dt.tenPhongBan ? ` (${dt.tenPhongBan})` : ""
              }`,
            };
          });
          setListUser(newData);
        } else {
          setListUser([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_PhieuYeuCau/${id}`,
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
          setFieldsValue({
            formquanlydonhang: res.data,
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.noiDungYeuCau,
      "nội dung yêu cầu"
    );
  };

  const deleteItemAction = (item) => {
    // const newDanhSach = ListCauHoi.filter((ds) => ds.noiDung !== item.noiDung);
    setFieldTouch(true);
  };

  const actionContent = (item) => {
    const deleteItem = { onClick: () => deleteItemFunc(item) };

    return (
      <div>
        <React.Fragment>
          <a {...deleteItem} title="Xóa câu hỏi">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let columnvalue = [
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
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
      width: 150,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "left",
      width: 250,
    },
    {
      title: "ĐVT",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 100,
    },
    {
      title: "Số lượng PO",
      dataIndex: "soLuongPO",
      key: "soLuongPO",
      align: "center",
      width: 110,
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          tồn kho
        </div>
      ),
      dataIndex: "soLuongTonKho",
      key: "soLuongTonKho",
      align: "center",
      width: 100,
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          sản xuất
        </div>
      ),
      dataIndex: "soLuongSanXuat",
      key: "soLuongSanXuat",
      align: "center",
      width: 100,
    },
    {
      title: (
        <div>
          Giá đã báo
          <br />
          (VNĐ)
        </div>
      ),
      dataIndex: "giaDaBao",
      key: "giaDaBao",
      align: "center",
      width: 120,
    },
    {
      title: (
        <div>
          Giá theo PO
          <br />
          (VNĐ)
        </div>
      ),
      dataIndex: "giaTheoPO",
      key: "giaTheoPO",
      align: "center",
      width: 120,
    },
    {
      title: (
        <div>
          Ngày
          <br />
          giao hàng
        </div>
      ),
      dataIndex: "ngayGiaoHang",
      key: "ngayGiaoHang",
      align: "center",
      width: 100,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 150,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(columnvalue, (col) => {
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

  const handleThemNoiDung = (data) => {
    setListNoiDungYeuCau([...ListNoiDungYeuCau, data]);
  };

  const handleRefesh = () => {};

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const onFinish = (values) => {
    saveData(values.formquanlydonhang);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.formquanlydonhang, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (formquanlydonhang, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_PhieuYeuCau`,
            "POST",
            formquanlydonhang,
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
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = { ...formquanlydonhang, id: id };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_PhieuYeuCau/${id}`,
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
          if (res.status === 409 || !saveQuit) {
            setFieldTouch(false);
          } else {
            goBack();
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const handleOpenFile = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  const propsfilehopdong = {
    accept: ".pdf, .doc, .docx, .ppt, .pptx",
    beforeUpload: (file) => {
      const allowedFileTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (!allowedFileTypes.includes(file.type)) {
        Helpers.alertError(
          `${file.name} không phải là tệp PDF, Word hoặc PowerPoint`
        );
        return false;
      } else {
        setFileHopDong(file);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const propsfiledinhkem = {
    accept: ".pdf, .doc, .docx, .ppt, .pptx",
    beforeUpload: (file) => {
      const allowedFileTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (!allowedFileTypes.includes(file.type)) {
        Helpers.alertError(
          `${file.name} không phải là tệp PDF, Word hoặc PowerPoint`
        );
        return false;
      } else {
        setFileDinhKem(file);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const formTitle = type === "new" ? "Thêm mới đơn hàng" : "Chỉnh sửa đơn hàng";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_ADD_2COL_180PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Card className="th-card-margin-bottom" title="Thông tin triển khai">
            <Row align={width >= 1600 ? "" : "center"} className="row-margin">
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Tên đơn hàng"
                  name={["formquanlydonhang", "tenDonhang"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                      message: "Tên đơn hàng không được quá 250 ký tự",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên đơn hàng"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Sản phẩm"
                  name={["formquanlydonhang", "qtsx_tsec_SanPham_Id"]}
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
                    placeholder="Chọn sản phẩm"
                    optionsvalue={["id", "user"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Số lượng"
                  name={["formquanlydonhang", "soLuong"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    className="input-item"
                    placeholder="Nhập số lượng"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Đơn vị tính"
                  name={["formquanlydonhang", "qtsx_tsec_DonViTinh_Id"]}
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
                    placeholder="Chọn người yêu cầu"
                    optionsvalue={["id", "user"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Ngày đặt hàng"
                  name={["formquanlydonhang", "ngayDatHang"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    format={"DD/MM/YYYY"}
                    disabledDate={disabledDate}
                    allowClear={false}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Ngày giao hàng"
                  name={["formquanlydonhang", "ngayGiaoHang"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    format={"DD/MM/YYYY"}
                    disabledDate={disabledDate}
                    allowClear={false}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Khách hàng"
                  name={["formquanlydonhang", "qtsx_tsec_KhachHang_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    // data={ListKhachHang ? ListKhachHang : []}
                    data={[
                      {
                        id: "1",
                        tenKhachHang: "tenKhachHangA",
                      },
                    ]}
                    placeholder="Chọn khách hàng"
                    optionsvalue={["id", "tenKhachHang"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Điều kiện giao hàng"
                  name={["formquanlydonhang", "dieuKienGiaoHang"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    // data={ListPhongBan ? ListPhongBan : []}
                    data={[
                      {
                        id: "1",
                        tenPhongBan: "tenPhongBanA",
                      },
                    ]}
                    placeholder="Chọn phòng ban thực hiện"
                    optionsvalue={["id", "tenPhongBan"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Hình thức tính giá"
                  name={["formquanlydonhang", "hinhThucTinhGia"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    // data={ListPhongBan ? ListPhongBan : []}
                    data={[
                      {
                        id: "1",
                        tenPhongBan: "tenPhongBanA",
                      },
                    ]}
                    placeholder="Chọn phòng ban thực hiện"
                    optionsvalue={["id", "tenPhongBan"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Báo giá"
                  name={["formquanlydonhang", "baoGia"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    // data={ListPhongBan ? ListPhongBan : []}
                    data={[
                      {
                        id: "1",
                        tenPhongBan: "tenPhongBanA",
                      },
                    ]}
                    placeholder="Chọn phòng ban thực hiện"
                    optionsvalue={["id", "tenPhongBan"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Hình thức hợp đồng"
                  name={["formquanlydonhang", "hinhThucHopDong"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    // data={ListPhongBan ? ListPhongBan : []}
                    data={[
                      {
                        id: "1",
                        tenPhongBan: "tenPhongBanA",
                      },
                    ]}
                    placeholder="Chọn phòng ban thực hiện"
                    optionsvalue={["id", "tenPhongBan"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Ghi chú"
                  name={["formquanlydonhang", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập ghi chú" />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Hợp đồng"
                  name={["formquanlydonhang", "fileHopDong"]}
                  rules={[
                    {
                      type: "file",
                      required: true,
                    },
                  ]}
                >
                  {!FileHopDong ? (
                    <Upload {...propsfilehopdong}>
                      <Button
                        className="th-margin-bottom-0 btn-margin-bottom-0"
                        style={{
                          marginBottom: 0,
                        }}
                        icon={<UploadOutlined />}
                        disabled={type === "detail" ? true : false}
                      >
                        Tải file hợp đồng
                      </Button>
                    </Upload>
                  ) : FileHopDong && FileHopDong.name ? (
                    <span>
                      <span
                        style={{
                          color: "#0469B9",
                          cursor: "pointer",
                          whiteSpace: "break-spaces",
                        }}
                        onClick={() => handleOpenFile(FileHopDong)}
                      >
                        {FileHopDong.name}{" "}
                      </span>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        disabled={
                          type === "new" || type === "edit" ? false : true
                        }
                        onClick={() => {
                          setFileHopDong(null);
                          setFieldTouch(true);
                          setFieldsValue({
                            formquanlydonhang: {
                              fileHopDong: null,
                            },
                          });
                        }}
                      />
                    </span>
                  ) : (
                    <span>
                      <a
                        target="_blank"
                        href={BASE_URL_API + FileHopDong}
                        rel="noopener noreferrer"
                      >
                        {FileHopDong && FileHopDong.split("/")[5]}{" "}
                      </a>
                      {(type === "new" || type === "edit") && (
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          disabled={
                            type === "new" || type === "edit" ? false : true
                          }
                          onClick={() => {
                            setFileHopDong(null);
                            setFieldTouch(true);
                            setFieldsValue({
                              formquanlydonhang: {
                                fileHopDong: null,
                              },
                            });
                          }}
                        />
                      )}
                    </span>
                  )}
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="File đính kèm"
                  name={["formquanlydonhang", "fileDinhKem"]}
                  rules={[
                    {
                      type: "file",
                    },
                  ]}
                >
                  {!FileDinhKem ? (
                    <Upload {...propsfiledinhkem}>
                      <Button
                        className="th-margin-bottom-0 btn-margin-bottom-0"
                        style={{
                          marginBottom: 0,
                        }}
                        icon={<UploadOutlined />}
                        disabled={type === "detail" ? true : false}
                      >
                        Tải file đính kèm
                      </Button>
                    </Upload>
                  ) : FileDinhKem && FileDinhKem.name ? (
                    <span>
                      <span
                        style={{
                          color: "#0469B9",
                          cursor: "pointer",
                          whiteSpace: "break-spaces",
                        }}
                        onClick={() => handleOpenFile(FileDinhKem)}
                      >
                        {FileDinhKem.name}{" "}
                      </span>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        disabled={
                          type === "new" || type === "edit" ? false : true
                        }
                        onClick={() => {
                          setFileDinhKem(null);
                          setFieldTouch(true);
                          setFieldsValue({
                            formquanlydonhang: {
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
                        href={BASE_URL_API + FileDinhKem}
                        rel="noopener noreferrer"
                      >
                        {FileDinhKem && FileDinhKem.split("/")[5]}{" "}
                      </a>
                      {(type === "new" || type === "edit") && (
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          disabled={
                            type === "new" || type === "edit" ? false : true
                          }
                          onClick={() => {
                            setFileDinhKem(null);
                            setFieldTouch(true);
                            setFieldsValue({
                              formquanlydonhang: {
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
            </Row>
          </Card>
          <Card
            className="th-card-margin-bottom"
            title={"Thông tin danh sách nội dung yêu cầu"}
          >
            <div align={"end"} style={{ marginBottom: "10px" }}>
              <Button
                className="th-margin-bottom-0 btn-margin-bottom-0"
                icon={<PlusCircleOutlined />}
                onClick={() => setActiveModalThemNoiDung(true)}
                type="primary"
              >
                Thêm nội dung yêu cầu
              </Button>
            </div>
            <Table
              bordered
              columns={columns}
              scroll={{ x: 1400, y: "45vh" }}
              components={components}
              className="gx-table-responsive th-table"
              dataSource={reDataForTable(ListNoiDungYeuCau)}
              size="small"
              rowClassName={"editable-row"}
              pagination={false}
            />
          </Card>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
      <ModalThemNoiDung
        openModal={ActiveModalThemNoiDung}
        openModalFS={setActiveModalThemNoiDung}
        refesh={handleRefesh}
        DataThemNoiDung={handleThemNoiDung}
      />
    </div>
  );
};

export default PhieuYeuCauForm;
