import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Input,
  Row,
  Button,
  Col,
  Card,
  DatePicker,
  Upload,
  Image,
  Divider,
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Select } from "src/components/Common";
import { BASE_URL_API, DEFAULT_FORM_THEMVATTU } from "src/constants/Config";
import Helpers from "src/helpers";
import { getDateNow, renderPDF } from "src/util/Common";

const FormItem = Form.Item;

function ModalChonVatTu({
  openModalFS,
  openModal,
  DataThemVatTu,
  itemVatTu,
  ListUserThuMua = [],
  isMuaHangTrongNuoc,
  dataEdit,
}) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListDonHang, setListDonHang] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const [file, setFile] = useState();
  const [fileChat, setFileChat] = useState();

  useEffect(() => {
    if (openModal) {
      getListDonHang();
      if (dataEdit) {
        const newListVatTu = itemVatTu.filter(
          (item) =>
            item.tits_qtsx_VatTu_Id.toLowerCase() !==
            dataEdit.tits_qtsx_VatTu_Id.toLowerCase()
        );
        if (dataEdit.isChiTiet) {
          getListVatTu("1", newListVatTu);
        } else {
          getListVatTu("0", newListVatTu);
        }
        if (isMuaHangTrongNuoc === "1") {
          if (dataEdit.moTa) {
            setFile(dataEdit.moTa);
            setFileChat(BASE_URL_API + dataEdit.moTa);
          }
        }
        setFieldsValue({
          themvattu: {
            ...dataEdit,
            isChiTiet: dataEdit.isChiTiet ? "1" : "0",
            ngay: moment(dataEdit.ngay, "DD/MM/YYYY"),
            nguoiThuMua_Id: dataEdit.nguoiThuMua_Id.toLowerCase(),
            tits_qtsx_DonHang_Id: dataEdit.tits_qtsx_DonHang_Id.toLowerCase(),
            tits_qtsx_VatTu_Id: dataEdit.tits_qtsx_VatTu_Id.toLowerCase(),
          },
        });
      } else {
        setFieldsValue({
          themvattu: {
            ngay: moment(getDateNow(), "DD/MM/YYYY"),
          },
        });
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListVatTu = (isChiTiet, vatTus) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          isChiTiet === "0"
            ? `tits_qtsx_PhieuMuaHangNgoai/list-vat-tu-mua-hang-ngoai`
            : `tits_qtsx_PhieuMuaHangNgoai/list-chi-tiet-mua-hang-ngoai`,
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
        const newListVatTu = res.data.map((data) => {
          return {
            ...data,
            vatTu: `${data.maVatTu} - ${data.tenVatTu}`,
          };
        });
        const newData = newListVatTu.filter((data) => {
          if (vatTus.length > 0) {
            return !vatTus.some(
              (item) =>
                item.tits_qtsx_VatTu_Id.toLowerCase() ===
                data.tits_qtsx_VatTu_Id.toLowerCase()
            );
          } else {
            return true;
          }
        });
        setListVatTu(newData);
      } else {
        setListVatTu([]);
      }
    });
  };

  const getListDonHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_DonHang?page=-1`,
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
        const newData = res.data.filter((d) => d.isXacNhan === true);
        setListDonHang(newData);
      } else {
        setListDonHang([]);
      }
    });
  };

  const onFinish = (values) => {
    const data = values.themvattu;
    data.ngay = data.ngay && data.ngay._i;
    data.hinhAnh = fileChat && fileChat;
    data.isChiTiet = data.isChiTiet === "1" ? true : false;
    ListVatTu.forEach((vt) => {
      if (vt.tits_qtsx_VatTu_Id === data.tits_qtsx_VatTu_Id) {
        data.tenVatTu = vt.tenVatTu;
        data.maVatTu = vt.maVatTu;
        data.tenDonViTinh = vt.tenDonViTinh;
        data.tenLoaiVatTu = vt.tenLoaiVatTu;
      }
    });
    data.render = true;
    ListDonHang.forEach((dh) => {
      if (dh.id === data.tits_qtsx_DonHang_Id) {
        data.maPhieu = dh.maPhieu;
      }
    });
    ListUserThuMua.forEach((us) => {
      if (us.id === data.nguoiThuMua_Id) {
        data.tenNguoiThuMua = us.fullName;
      }
    });
    if (dataEdit) {
      data.type = "edit";
      data.tits_qtsx_PhieuMuaHangNgoaiChiTiet_Id =
        dataEdit.tits_qtsx_PhieuMuaHangNgoaiChiTiet_Id;
    } else {
      data.type = "new";
    }
    DataThemVatTu(data);
    setFile();
    setFileChat();
    openModalFS(false);
    resetFields();
  };
  const props = {
    accept: ".pdf, .png, .jpeg, .jpg",
    beforeUpload: (file) => {
      const isPDF =
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type.startsWith("image/");

      if (!isPDF) {
        Helpers.alertError(`Chỉ chấp nhận file pdf và hình ảnh`);
      } else {
        setFile(file);
        setFieldTouch(true);
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => setFileChat(e.target.result);
          reader.readAsDataURL(file);
        }
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const handleChangeLoai = (value) => {
    getListVatTu(value, itemVatTu);
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title={dataEdit ? "Chỉnh sửa thông tin vật tư" : "Thêm thông tin vật tư"}
      open={openModal}
      width={width > 1200 ? `85%` : `90%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <div className="gx-main-content">
          <Form
            {...DEFAULT_FORM_THEMVATTU}
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
                  label="Loại"
                  name={["themvattu", "isChiTiet"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={[
                      {
                        id: "0",
                        name: "Vật tư",
                      },
                      {
                        id: "1",
                        name: "Cụm chi tiết",
                      },
                    ]}
                    placeholder="Chọn loại"
                    optionsvalue={["id", "name"]}
                    style={{ width: "100%" }}
                    onChange={(val) => handleChangeLoai(val)}
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
                  label="Tên vật tư"
                  name={["themvattu", "tits_qtsx_VatTu_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListVatTu}
                    placeholder="Chọn tên vật tư"
                    optionsvalue={["tits_qtsx_VatTu_Id", "vatTu"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
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
                  label="Đơn đặt hàng"
                  name={["themvattu", "tits_qtsx_DonHang_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDonHang}
                    placeholder="Chọn đơn đặt hàng"
                    optionsvalue={["id", "maPhieu"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
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
                  label="Ngày yêu cầu giao"
                  name={["themvattu", "ngay"]}
                >
                  <DatePicker
                    format={"DD/MM/YYYY"}
                    onChange={(date, dateString) => {
                      if (dateString === "") {
                        setFieldsValue({ themvattu: { ngay: null } });
                      }
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
                  label="Định mức"
                  name={["themvattu", "dinhMuc"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    min={0}
                    className="input-item"
                    placeholder="Nhập định mức"
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
                  label={
                    isMuaHangTrongNuoc === "0" ? "SL dự phòng" : "SL cần dùng"
                  }
                  name={["themvattu", "soLuongDuPhong"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    min={0}
                    className="input-item"
                    placeholder="Nhập số lượng"
                  />
                </FormItem>
              </Col>
              {isMuaHangTrongNuoc === "0" && (
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
                    label={"SL tồn kho"}
                    name={["themvattu", "soLuongTrongKho"]}
                  >
                    <Input
                      type="number"
                      min={0}
                      className="input-item"
                      placeholder="Nhập số lượng"
                    />
                  </FormItem>
                </Col>
              )}
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
                  label="SL đặt mua"
                  name={["themvattu", "soLuongDatMua"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    min={0}
                    className="input-item"
                    placeholder="Nhập số lượng đặt mua"
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
                  name={["themvattu", "nguoiThuMua_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListUserThuMua}
                    placeholder="Chọn CV thu mua"
                    optionsvalue={["id", "nguoiDuyet"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
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
                  label="Hạng mục"
                  name={["themvattu", "hangMucSuDung"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập hạn mục" />
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
                <FormItem label="Ghi chú" name={["themvattu", "moTa"]}>
                  {isMuaHangTrongNuoc === "1" ? (
                    !file ? (
                      <Upload {...props}>
                        <Button
                          style={{
                            marginBottom: 0,
                          }}
                          icon={<UploadOutlined />}
                        >
                          Đính kèm
                        </Button>
                      </Upload>
                    ) : (
                      <span>
                        <span
                          style={{ color: "#0469B9", cursor: "pointer" }}
                          onClick={() => {
                            if (
                              file && file.name
                                ? file.name.includes(".pdf")
                                : file.includes(".pdf")
                            ) {
                              renderPDF(file);
                            } else {
                              setOpenImage(true);
                            }
                          }}
                        >
                          {file.name
                            ? file.name.length > 20
                              ? file.name.substring(0, 20) + "..."
                              : file.name
                            : dataEdit && file.split("/")[5]}{" "}
                        </span>
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => {
                            setFile();
                            setFileChat();
                            setFieldTouch(true);
                            setFieldsValue({
                              themvattu: {
                                moTa: undefined,
                              },
                            });
                          }}
                        />
                        <Image
                          width={100}
                          src={fileChat}
                          alt="preview"
                          style={{
                            display: "none",
                          }}
                          preview={{
                            visible: openImage,
                            scaleStep: 0.5,
                            src: fileChat,
                            onVisibleChange: (value) => {
                              setOpenImage(value);
                            },
                          }}
                        />
                      </span>
                    )
                  ) : (
                    <Input className="input-item" placeholder="Nhập ghi chú" />
                  )}
                </FormItem>
              </Col>
              {isMuaHangTrongNuoc === "0" && (
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
                      label="Chứng nhận"
                      name={["themvattu", "chungNhan"]}
                      rules={[
                        {
                          type: "string",
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Nhập chứng nhận"
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
                      label="Xuất xứ"
                      name={["themvattu", "xuatXu"]}
                      rules={[
                        {
                          type: "string",
                          required: true,
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Nhập xuất xứ"
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
                      label="Bảo hành"
                      name={["themvattu", "baoHanh"]}
                      rules={[
                        {
                          type: "string",
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Nhập bảo hành"
                      />
                    </FormItem>
                  </Col>
                </>
              )}
            </Row>
            <Divider />
            <Row justify={"center"}>
              <Button
                style={{ margin: 0 }}
                className="th-margin-bottom-0"
                type="primary"
                htmlType="submit"
                disabled={!fieldTouch}
              >
                {dataEdit ? "Lưu" : "Thêm"}
              </Button>
            </Row>
          </Form>
        </div>
      </Card>
    </AntModal>
  );
}

export default ModalChonVatTu;
