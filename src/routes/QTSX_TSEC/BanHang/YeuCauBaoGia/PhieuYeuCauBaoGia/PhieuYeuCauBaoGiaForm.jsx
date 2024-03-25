import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Form, Input, Row, Upload } from "antd";
import dayjs from "dayjs";
import includes from "lodash/includes";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  BASE_URL_API,
  DEFAULT_FORM_ADD_2COL_180PX,
} from "src/constants/Config";
import Helpers from "src/helpers";
import { getTokenInfo, getLocalStorage } from "src/util/Common";

const FormItem = Form.Item;

const PhieuYeuCauBaoGiaForm = ({ history, match, permission }) => {
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
  const [ListDonViTinh, setListDonViTinh] = useState([]);
  const [FileTaiLieuBaoGia, setFileTaiLieuBaoGia] = useState(null);
  const [DisableUploadTaiLieuBaoGia, setDisableUploadTaiLieuBaoGia] =
    useState(false);
  const [FileTomTatDuAn, setFileTomTatDuAn] = useState(null);
  const [DisableUploadTomTatDuAn, setDisableUploadTomTatDuAn] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListUser();
        getListPhongBan();
        getListDonViTinh();
        setFieldsValue({
          formphieuyeucaubaogia: {
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

  const getListDonViTinh = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonViTinh?DonVi_Id=${INFO.donVi_Id}&page=-1`,
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
          setListDonViTinh(res.data);
        } else {
          setListDonViTinh([]);
        }
      })
      .catch((error) => console.error(error));
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
          `tsec_qtsx_PhieuYeuCauBaoGia/${id}`,
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
            formphieuyeucaubaogia: res.data,
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const onFinish = (values) => {
    saveData(values.formphieuyeucaubaogia);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.formphieuyeucaubaogia, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (formphieuyeucaubaogia, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_PhieuYeuCauBaoGia`,
            "POST",
            formphieuyeucaubaogia,
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
      var newData = { ...formphieuyeucaubaogia, id: id };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_PhieuYeuCauBaoGia/${id}`,
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

  const propstailieubaogia = {
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
        setFileTaiLieuBaoGia(file);
        setDisableUploadTaiLieuBaoGia(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
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
        setFileTomTatDuAn(file);
        setDisableUploadTomTatDuAn(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const formTitle =
    type === "new"
      ? "Thêm mới phiếu yêu cầu báo giá"
      : "Chỉnh sửa phiếu yêu cầu báo giá";

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
                  label="Tên phiếu yêu cầu"
                  name={["formphieuyeucaubaogia", "tenPhieuYeuCauBaoGia"]}
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
                  name={["formphieuyeucaubaogia", "noiDungThucHien"]}
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
                  name={["formphieuyeucaubaogia", "qtsx_tsec_NguoiYeuCau_Id"]}
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
                  name={["formphieuyeucaubaogia", "tenPhongBan"]}
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
                  name={["formphieuyeucaubaogia", "qtsx_tsec_KhachHang_Id"]}
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
                  name={["formphieuyeucaubaogia", "qtsx_tsec_DonHang_Id"]}
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
                  label="Người gửi"
                  name={["formphieuyeucaubaogia", "qtsx_tsec_NguoiGui_Id"]}
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
                    placeholder="Chọn người gửi"
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
                  label="Phòng ban"
                  name={["formphieuyeucaubaogia", "qtsx_tsec_PhongBan_Id"]}
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
                  label="Thời gian hoàn thành"
                  name={["formphieuyeucaubaogia", "thoiGianHoanThanh"]}
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
                  label="Số lượng đặt hàng"
                  name={["formphieuyeucaubaogia", "soLuongDatHang"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    className="input-item"
                    placeholder="Nhập số lượng đặt hàng"
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
                  name={["formphieuyeucaubaogia", "qtsx_tsec_DonViTinh_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDonViTinh ? ListDonViTinh : []}
                    placeholder="Chọn đơn vị tính"
                    optionsvalue={["id", "tenDonViTinh"]}
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
                  name={["formphieuyeucaubaogia", "qtsx_tsec_DongSanPham_Id"]}
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
                  label="Điều kiện giao hàng"
                  name={["formphieuyeucaubaogia", "dieuKienGiaoHang"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập điều kiện giao hàng"
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
                  name={["formphieuyeucaubaogia", "moTa"]}
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
                  label="Người kiểm tra"
                  name={["formphieuyeucaubaogia", "qtsx_tsec_NguoiKiemTra_Id"]}
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
                  name={["formphieuyeucaubaogia", "qtsx_tsec_NguoiDuyet_Id"]}
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
                  label="Tài liệu báo giá"
                  name={["formphieuyeucaubaogia", "boTaiLieuBaoGia"]}
                  rules={[
                    {
                      type: "file",
                      required: true,
                    },
                  ]}
                >
                  {!DisableUploadTaiLieuBaoGia ? (
                    <Upload {...propstailieubaogia}>
                      <Button
                        className="th-margin-bottom-0 btn-margin-bottom-0"
                        style={{
                          marginBottom: 0,
                        }}
                        icon={<UploadOutlined />}
                        disabled={type === "detail" ? true : false}
                      >
                        Tải file tài liệu báo giá
                      </Button>
                    </Upload>
                  ) : FileTaiLieuBaoGia && FileTaiLieuBaoGia.name ? (
                    <span>
                      <span
                        style={{
                          color: "#0469B9",
                          cursor: "pointer",
                          whiteSpace: "break-spaces",
                        }}
                        onClick={() => handleOpenFile(FileTaiLieuBaoGia)}
                      >
                        {FileTaiLieuBaoGia.name}{" "}
                      </span>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        disabled={
                          type === "new" || type === "edit" ? false : true
                        }
                        onClick={() => {
                          setFileTaiLieuBaoGia(null);
                          setDisableUploadTaiLieuBaoGia(false);
                          setFieldTouch(true);
                          setFieldsValue({
                            formphieuyeucaubaogia: {
                              boTaiLieuBaoGia: null,
                            },
                          });
                        }}
                      />
                    </span>
                  ) : (
                    <span>
                      <a
                        target="_blank"
                        href={BASE_URL_API + FileTaiLieuBaoGia}
                        rel="noopener noreferrer"
                      >
                        {FileTaiLieuBaoGia && FileTaiLieuBaoGia.split("/")[5]}{" "}
                      </a>
                      {(type === "new" || type === "edit") && (
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          disabled={
                            type === "new" || type === "edit" ? false : true
                          }
                          onClick={() => {
                            setFileTaiLieuBaoGia(null);
                            setDisableUploadTaiLieuBaoGia(false);
                            setFieldTouch(true);
                            setFieldsValue({
                              formphieuyeucaubaogia: {
                                boTaiLieuBaoGia: null,
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
                  label="Tóm tắt dự án"
                  name={["formphieuyeucaubaogia", "fileTomTatDuAn"]}
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
                        Tải file tóm tắt dự án
                      </Button>
                    </Upload>
                  ) : FileTomTatDuAn && FileTomTatDuAn.name ? (
                    <span>
                      <span
                        style={{
                          color: "#0469B9",
                          cursor: "pointer",
                          whiteSpace: "break-spaces",
                        }}
                        onClick={() => handleOpenFile(FileTomTatDuAn)}
                      >
                        {FileTomTatDuAn.name}{" "}
                      </span>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        disabled={
                          type === "new" || type === "edit" ? false : true
                        }
                        onClick={() => {
                          setFileTomTatDuAn(null);
                          setDisableUploadTomTatDuAn(false);
                          setFieldTouch(true);
                          setFieldsValue({
                            formphieuyeucaubaogia: {
                              fileTomTatDuAn: null,
                            },
                          });
                        }}
                      />
                    </span>
                  ) : (
                    <span>
                      <a
                        target="_blank"
                        href={BASE_URL_API + FileTomTatDuAn}
                        rel="noopener noreferrer"
                      >
                        {FileTomTatDuAn && FileTomTatDuAn.split("/")[5]}{" "}
                      </a>
                      {(type === "new" || type === "edit") && (
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          disabled={
                            type === "new" || type === "edit" ? false : true
                          }
                          onClick={() => {
                            setFileTomTatDuAn(null);
                            setDisableUploadTomTatDuAn(false);
                            setFieldTouch(true);
                            setFieldsValue({
                              formphieuyeucaubaogia: {
                                fileTomTatDuAn: null,
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
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
    </div>
  );
};

export default PhieuYeuCauBaoGiaForm;
