import {
  DeleteOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  Upload,
} from "antd";
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
import { getTokenInfo, getLocalStorage, reDataForTable } from "src/util/Common";
import ModalThemNoiDung from "./ModalThemNoiDung";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;
const NoiDungYeuCau = [
  {
    maCongViec: "YCKH-01",
    noiDungYeuCau:
      "Chuẩn bị xe đưa đón khách, mũ bảo hộ, nước,... ( Hành chính NM TBCD)",
    diaDiem: "NM TBCD",
    thoiGianHoanThanh: "20/03/2024 14:00",
    tenPhongBan: "BP. Hành chính",
    tenNhanSuThucHien: "Hoanh Kiều",
    tenNhanSuQuanLy: "Nguyễn Văn A",
  },
  {
    maCongViec: "YCKH-02",
    noiDungYeuCau:
      "Gửi báo cáo hình ảnh trial cụm 403 ( Phòng QLCL) - 04/01/2024",
    diaDiem: "NM TBCD",
    thoiGianHoanThanh: "20/03/2024 14:00",
    tenPhongBan: "P. QLCL",
    tenNhanSuThucHien: "Hoanh Kiều",
    tenNhanSuQuanLy: "Nguyễn Văn A",
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
  const [TypeYeuCau, setTypeYeuCau] = useState(1);
  const [ListUser, setListUser] = useState([]);
  const [FileTaiLieu, setFileTaiLieu] = useState(null);
  const [DisableUploadTomTatDuAn, setDisableUploadTomTatDuAn] = useState(false);
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
          formphieuyeucau: {
            qtsx_tsec_NguoiYeuCau_Id: INFO.user_Id.toLowerCase(),
            thoiGianHoanThanh: moment(
              moment().format("DD/MM/YYYY HH:mm"),
              "DD/MM/YYYY HH:mm"
            ),
          },
        });
      } else if (permission && !permission.add) {
        history.push("/home");
      }
    } else {
      if (permission && permission.edit) {
        setType("edit");
        // Get info
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
            formphieuyeucau: res.data,
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

  let columnDanhGia = [
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
      title: "Mã công việc",
      dataIndex: "maCongViec",
      key: "maCongViec",
      align: "left",
      width: 150,
    },
    {
      title: "Nội dung yêu cầu",
      dataIndex: "noiDungYeuCau",
      key: "noiDungYeuCau",
      align: "left",
      width: 250,
    },
    {
      title: "Địa điểm",
      dataIndex: "diaDiem",
      key: "diaDiem",
      align: "center",
      width: 150,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          hoàn thành
        </div>
      ),
      dataIndex: "thoiGianHoanThanh",
      key: "thoiGianHoanThanh",
      align: "center",
      width: 100,
    },
    {
      title: "Xưởng/Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "left",
      width: 150,
    },
    {
      title: "Nhân sự thực hiện",
      dataIndex: "tenNhanSuThucHien",
      key: "tenNhanSuThucHien",
      align: "center",
      width: 160,
    },
    {
      title: "Nhân sự quản lý",
      dataIndex: "tenNhanSuQuanLy",
      key: "tenNhanSuQuanLy",
      align: "center",
      width: 160,
    },
  ];

  let columnTrienKhaiKhieuNai = [
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
      title: "Nội dung lỗi khách hàng",
      dataIndex: "noiDungLoi",
      key: "noiDungLoi",
      align: "left",
      width: 300,
    },
    {
      title: "Loại lỗi",
      dataIndex: "tenLoaiLoi",
      key: "tenLoaiLoi",
      align: "center",
      width: 150,
    },
    {
      title: "Ngày nhận thông tin",
      dataIndex: "ngayNhanThongTin",
      key: "ngayNhanThongTin",
      align: "center",
      width: 150,
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "ngayHoanThanh",
      key: "ngayHoanThanh",
      align: "left",
      width: 150,
    },
    {
      title: "Nhân sự thực hiện",
      dataIndex: "tenNhanSuThucHien",
      key: "tenNhanSuThucHien",
      align: "center",
      width: 200,
    },
  ];

  let columnKhac = [
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
      title: "Mã công việc",
      dataIndex: "maCongViec",
      key: "maCongViec",
      align: "left",
      width: 150,
    },
    {
      title: "Nội dung yêu cầu",
      dataIndex: "noiDungYeuCau",
      key: "noiDungYeuCau",
      align: "left",
      width: 250,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "ngayBatDau",
      key: "ngayBatDau",
      align: "center",
      width: 150,
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "ngayHoanThanh",
      key: "ngayHoanThanh",
      align: "center",
      width: 150,
    },
    {
      title: "Nhân sự thực hiện",
      dataIndex: "tenNhanSuThucHien",
      key: "tenNhanSuThucHien",
      align: "center",
      width: 200,
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

  const columns = map(
    TypeYeuCau === 1
      ? columnDanhGia
      : TypeYeuCau === 2
      ? columnTrienKhaiKhieuNai
      : columnKhac,
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
        }),
      };
    }
  );

  const handleThemNoiDung = (data) => {
    console.log(data);
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
    saveData(values.formphieuyeucau);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.formphieuyeucau, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (formphieuyeucau, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_PhieuYeuCau`,
            "POST",
            formphieuyeucau,
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
      const newData = { ...formphieuyeucau, id: id };
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

  const propstomtatduan = {
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
        setFileTaiLieu(file);
        setDisableUploadTomTatDuAn(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const onChange = (e) => {
    setTypeYeuCau(e.target.value);
  };

  const formTitle =
    type === "new"
      ? "Thêm mới phiếu yêu cầu báo giá"
      : "Chỉnh sửa phiếu yêu cầu báo giá";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Radio.Group
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-evenly",
            height: "auto",
            lineHeight: "30px",
          }}
          onChange={onChange}
          value={TypeYeuCau}
        >
          <Radio
            className={`radio-custom ${TypeYeuCau === 1 ? "radio-active" : ""}`}
            value={1}
          >
            Yêu cầu đánh giá
          </Radio>
          <Radio
            className={`radio-custom ${TypeYeuCau === 2 ? "radio-active" : ""}`}
            value={2}
          >
            Yêu cầu triển khai khiếu nại
          </Radio>
          <Radio
            className={`radio-custom ${TypeYeuCau === 3 ? "radio-active" : ""}`}
            value={3}
          >
            Yêu cầu khác
          </Radio>
        </Radio.Group>
        <Divider />
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
                  label="Tên phiếu yêu cầu"
                  name={["formphieuyeucau", "tenPhieuYeuCau"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                      message: "Tên phiếu yêu cầu không được quá 250 ký tự",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên phiếu yêu cầu"
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
                  label="Nội dung thực hiện"
                  name={["formphieuyeucau", "noiDungThucHien"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập nội dung thực hiện"
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
                  label="Người yêu cầu"
                  name={["formphieuyeucau", "qtsx_tsec_NguoiYeuCau_Id"]}
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
                    optionFilterProp={"name"}
                    disabled
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
                  label="Phòng ban thực hiện"
                  name={["formphieuyeucau", "tenPhongBan"]}
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
            </Row>
          </Card>
          <Card
            className="th-card-margin-bottom"
            title="Thông tin đơn hàng báo giá"
          >
            {TypeYeuCau === 1 ? (
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
                    label="Khách hàng"
                    name={["formphieuyeucau", "qtsx_tsec_KhachHang_Id"]}
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
                    label="Đơn hàng"
                    name={["formphieuyeucau", "qtsx_tsec_DonHang_Id"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      // data={ListDonHang ? ListDonHang : []}
                      data={[
                        {
                          id: "1",
                          tenDonHang: "tenDonHangA",
                        },
                      ]}
                      placeholder="Chọn đơn hàng"
                      optionsvalue={["id", "tenDonHang"]}
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
                    label="Lĩnh vực"
                    name={["formphieuyeucau", "qtsx_tsec_LinhVuc_Id"]}
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
                      placeholder="Chọn lĩnh vực"
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
                    label="Địa điểm"
                    name={["formphieuyeucau", "diaDiem"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Input className="input-item" placeholder="Nhập địa điểm" />
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
                    label="Thời gian"
                    name={["formphieuyeucau", "thoiGian"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <DatePicker
                      showTime
                      format={"DD/MM/YYYY HH:mm"}
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
                    label="Tài liệu liên quan"
                    name={["formphieuyeucau", "fileTaiLieu"]}
                    rules={[
                      {
                        type: "file",
                        required: true,
                      },
                    ]}
                  >
                    {!DisableUploadTomTatDuAn ? (
                      <Upload {...propstomtatduan}>
                        <Button
                          className="th-margin-bottom-0 btn-margin-bottom-0"
                          style={{
                            marginBottom: 0,
                          }}
                          icon={<UploadOutlined />}
                          disabled={type === "detail" ? true : false}
                        >
                          Tải file tài liệu liên quan
                        </Button>
                      </Upload>
                    ) : FileTaiLieu && FileTaiLieu.name ? (
                      <span>
                        <span
                          style={{
                            color: "#0469B9",
                            cursor: "pointer",
                            whiteSpace: "break-spaces",
                          }}
                          onClick={() => handleOpenFile(FileTaiLieu)}
                        >
                          {FileTaiLieu.name}{" "}
                        </span>
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          disabled={
                            type === "new" || type === "edit" ? false : true
                          }
                          onClick={() => {
                            setFileTaiLieu(null);
                            setDisableUploadTomTatDuAn(false);
                            setFieldTouch(true);
                            setFieldsValue({
                              formphieuyeucau: {
                                fileTaiLieu: null,
                              },
                            });
                          }}
                        />
                      </span>
                    ) : (
                      <span>
                        <a
                          target="_blank"
                          href={BASE_URL_API + FileTaiLieu}
                          rel="noopener noreferrer"
                        >
                          {FileTaiLieu && FileTaiLieu.split("/")[5]}{" "}
                        </a>
                        {(type === "new" || type === "edit") && (
                          <DeleteOutlined
                            style={{ cursor: "pointer", color: "red" }}
                            disabled={
                              type === "new" || type === "edit" ? false : true
                            }
                            onClick={() => {
                              setFileTaiLieu(null);
                              setDisableUploadTomTatDuAn(false);
                              setFieldTouch(true);
                              setFieldsValue({
                                formphieuyeucau: {
                                  fileTaiLieu: null,
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
                    label="Người kiểm tra"
                    name={["formphieuyeucau", "qtsx_tsec_NguoiKiemTra_Id"]}
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
                      placeholder="Chọn người kiểm tra"
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
                    label="Người duyệt"
                    name={["formphieuyeucau", "qtsx_tsec_NguoiDuyet_Id"]}
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
                      placeholder="Chọn người duyệt"
                      optionsvalue={["id", "user"]}
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp={"name"}
                    />
                  </FormItem>
                </Col>
              </Row>
            ) : TypeYeuCau === 2 ? (
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
                    label="Số PO"
                    name={["formphieuyeucau", "soPO"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Input className="input-item" placeholder="Nhập số PO" />
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
                    name={["formphieuyeucau", "qtsx_tsec_KhachHang_Id"]}
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
                    label="Đơn hàng"
                    name={["formphieuyeucau", "qtsx_tsec_DonHang_Id"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      // data={ListDonHang ? ListDonHang : []}
                      data={[
                        {
                          id: "1",
                          tenDonHang: "tenDonHangA",
                        },
                      ]}
                      placeholder="Chọn đơn hàng"
                      optionsvalue={["id", "tenDonHang"]}
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
                    label="Loại phản hồi"
                    name={["formphieuyeucau", "qtsx_tsec_LoaiPhanHoi_Id"]}
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
                      placeholder="Chọn loại phản hồi"
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
                    label="Người kiểm tra"
                    name={["formphieuyeucau", "qtsx_tsec_NguoiKiemTra_Id"]}
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
                      placeholder="Chọn người kiểm tra"
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
                    label="Người duyệt"
                    name={["formphieuyeucau", "qtsx_tsec_NguoiDuyet_Id"]}
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
                      placeholder="Chọn người duyệt"
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
                    label="Tài liệu liên quan"
                    name={["formphieuyeucau", "fileTaiLieu"]}
                    rules={[
                      {
                        type: "file",
                        required: true,
                      },
                    ]}
                  >
                    {!DisableUploadTomTatDuAn ? (
                      <Upload {...propstomtatduan}>
                        <Button
                          className="th-margin-bottom-0 btn-margin-bottom-0"
                          style={{
                            marginBottom: 0,
                          }}
                          icon={<UploadOutlined />}
                          disabled={type === "detail" ? true : false}
                        >
                          Tải file tài liệu liên quan
                        </Button>
                      </Upload>
                    ) : FileTaiLieu && FileTaiLieu.name ? (
                      <span>
                        <span
                          style={{
                            color: "#0469B9",
                            cursor: "pointer",
                            whiteSpace: "break-spaces",
                          }}
                          onClick={() => handleOpenFile(FileTaiLieu)}
                        >
                          {FileTaiLieu.name}{" "}
                        </span>
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          disabled={
                            type === "new" || type === "edit" ? false : true
                          }
                          onClick={() => {
                            setFileTaiLieu(null);
                            setDisableUploadTomTatDuAn(false);
                            setFieldTouch(true);
                            setFieldsValue({
                              formphieuyeucau: {
                                fileTaiLieu: null,
                              },
                            });
                          }}
                        />
                      </span>
                    ) : (
                      <span>
                        <a
                          target="_blank"
                          href={BASE_URL_API + FileTaiLieu}
                          rel="noopener noreferrer"
                        >
                          {FileTaiLieu && FileTaiLieu.split("/")[5]}{" "}
                        </a>
                        {(type === "new" || type === "edit") && (
                          <DeleteOutlined
                            style={{ cursor: "pointer", color: "red" }}
                            disabled={
                              type === "new" || type === "edit" ? false : true
                            }
                            onClick={() => {
                              setFileTaiLieu(null);
                              setDisableUploadTomTatDuAn(false);
                              setFieldTouch(true);
                              setFieldsValue({
                                formphieuyeucau: {
                                  fileTaiLieu: null,
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
            ) : (
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
                    label="Số PO"
                    name={["formphieuyeucau", "soPO"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Input className="input-item" placeholder="Nhập số PO" />
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
                    name={["formphieuyeucau", "qtsx_tsec_KhachHang_Id"]}
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
                    label="Lĩnh vực"
                    name={["formphieuyeucau", "qtsx_tsec_LinhVuc_Id"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      // data={ListLinhVuc ? ListLinhVuc : []}
                      data={[
                        {
                          id: "1",
                          tenLinhVuc: "tenLinhVucA",
                        },
                      ]}
                      placeholder="Chọn lĩnh vực"
                      optionsvalue={["id", "tenLinhVuc"]}
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
                    label="Dòng sản phẩm"
                    name={["formphieuyeucau", "qtsx_tsec_DongSanPham_Id"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      // data={ListDongSanPham ? ListDongSanPham : []}
                      data={[
                        {
                          id: "1",
                          tenDongSanPham: "tenDongSanPhamA",
                        },
                      ]}
                      placeholder="Chọn dòng sản phẩm"
                      optionsvalue={["id", "tenDongSanPham"]}
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
                    label="Đơn hàng"
                    name={["formphieuyeucau", "qtsx_tsec_DonHang_Id"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      // data={ListDonHang ? ListDonHang : []}
                      data={[
                        {
                          id: "1",
                          tenDonHang: "tenDonHangA",
                        },
                      ]}
                      placeholder="Chọn đơn hàng"
                      optionsvalue={["id", "tenDonHang"]}
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
                    label="Tài liệu liên quan"
                    name={["formphieuyeucau", "fileTaiLieu"]}
                    rules={[
                      {
                        type: "file",
                        required: true,
                      },
                    ]}
                  >
                    {!DisableUploadTomTatDuAn ? (
                      <Upload {...propstomtatduan}>
                        <Button
                          className="th-margin-bottom-0 btn-margin-bottom-0"
                          style={{
                            marginBottom: 0,
                          }}
                          icon={<UploadOutlined />}
                          disabled={type === "detail" ? true : false}
                        >
                          Tải file tài liệu liên quan
                        </Button>
                      </Upload>
                    ) : FileTaiLieu && FileTaiLieu.name ? (
                      <span>
                        <span
                          style={{
                            color: "#0469B9",
                            cursor: "pointer",
                            whiteSpace: "break-spaces",
                          }}
                          onClick={() => handleOpenFile(FileTaiLieu)}
                        >
                          {FileTaiLieu.name}{" "}
                        </span>
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          disabled={
                            type === "new" || type === "edit" ? false : true
                          }
                          onClick={() => {
                            setFileTaiLieu(null);
                            setDisableUploadTomTatDuAn(false);
                            setFieldTouch(true);
                            setFieldsValue({
                              formphieuyeucau: {
                                fileTaiLieu: null,
                              },
                            });
                          }}
                        />
                      </span>
                    ) : (
                      <span>
                        <a
                          target="_blank"
                          href={BASE_URL_API + FileTaiLieu}
                          rel="noopener noreferrer"
                        >
                          {FileTaiLieu && FileTaiLieu.split("/")[5]}{" "}
                        </a>
                        {(type === "new" || type === "edit") && (
                          <DeleteOutlined
                            style={{ cursor: "pointer", color: "red" }}
                            disabled={
                              type === "new" || type === "edit" ? false : true
                            }
                            onClick={() => {
                              setFileTaiLieu(null);
                              setDisableUploadTomTatDuAn(false);
                              setFieldTouch(true);
                              setFieldsValue({
                                formphieuyeucau: {
                                  fileTaiLieu: null,
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
                    label="Người kiểm tra"
                    name={["formphieuyeucau", "qtsx_tsec_NguoiKiemTra_Id"]}
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
                      placeholder="Chọn người kiểm tra"
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
                    label="Người duyệt"
                    name={["formphieuyeucau", "qtsx_tsec_NguoiDuyet_Id"]}
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
                      placeholder="Chọn người duyệt"
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
                    label="Ghi chú"
                    name={["formphieuyeucau", "moTa"]}
                    rules={[
                      {
                        type: "string",
                      },
                    ]}
                  >
                    <Input className="input-item" placeholder="Nhập ghi chú" />
                  </FormItem>
                </Col>
              </Row>
            )}
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
              scroll={{ x: 1300, y: "45vh" }}
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
        TypeYeuCau={TypeYeuCau}
      />
    </div>
  );
};

export default PhieuYeuCauForm;
