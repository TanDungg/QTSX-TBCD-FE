import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Card,
  Input,
  Row,
  Col,
  Form,
  Switch,
  Image,
  Empty,
  Divider,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { FormSubmit, Select } from "src/components/Common";
import {
  BASE_URL_API,
  DEFAULT_FORM_XUATKHONGOAIQUAN,
} from "src/constants/Config";
import Helpers from "src/helpers";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";

const FormItem = Form.Item;

function ModalThemChiTiet({ openModalFS, openModal, itemData, refesh }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue, validateFields } = form;
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [ListTram, setListTram] = useState([]);
  const [ListHinhAnh, setListHinhAnh] = useState([]);
  const [ListHinhAnhDaChon, setListHinhAnhDaChon] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListDonVi();
      getListXuong();
      getCongDoan(
        itemData.tits_qtsx_SanPham_Id,
        itemData.tits_qtsx_CongDoan_Id
      );
      setFieldsValue({
        themchitiet: {
          donVi_Id: INFO.donVi_Id.toLowerCase(),
          tits_qtsx_HangMucKiemTraChiTiet_Id: itemData.maSo,
          isNhapKetQua: true,
        },
      });
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

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

  const getListXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Xuong?page=-1`,
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
          setListXuong(res.data);
        } else {
          setListXuong([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListTram = (tits_qtsx_Xuong_Id) => {
    let param = convertObjectToUrlParams({ tits_qtsx_Xuong_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Tram/tram-by-xuong?${param}`,
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
          setListTram(res.data);
        } else {
          setListTram([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getCongDoan = (value, key, hinhanhdachon) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPhamHinhAnh?tits_qtsx_SanPham_Id=${value}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          const newListHinhAnh = res.data.filter(
            (congdoan) =>
              congdoan.tits_qtsx_CongDoan_Id.toLowerCase() === key.toLowerCase()
          );
          const hinhanh =
            newListHinhAnh[0].list_KhuVucs &&
            JSON.parse(newListHinhAnh[0].list_KhuVucs);

          if (hinhanhdachon) {
            const newHinhAnh = hinhanh.map((data) => {
              const filteredHinhAnhs = data.list_HinhAnhs.filter((image) => {
                return !hinhanhdachon.some(
                  (selectedImage) =>
                    selectedImage.tits_qtsx_SanPhamHinhAnh_Id.toLowerCase() ===
                    image.tits_qtsx_SanPhamHinhAnh_Id.toLowerCase()
                );
              });
              return {
                ...data,
                list_HinhAnhs: filteredHinhAnhs,
              };
            });
            setListHinhAnh(newHinhAnh);

            const newHinhAnhDaChon = hinhanhdachon.map((selectedImage) => {
              const area = hinhanh.find((area) =>
                area.list_HinhAnhs.some(
                  (image) =>
                    image.tits_qtsx_SanPhamHinhAnh_Id.toLowerCase() ===
                    selectedImage.tits_qtsx_SanPhamHinhAnh_Id.toLowerCase()
                )
              );
              return {
                ...selectedImage,
                tenKhuVuc: area.tenKhuVuc,
              };
            });
            setListHinhAnhDaChon(newHinhAnhDaChon);
          } else {
            setListHinhAnh(hinhanh);
          }
        } else {
          setListHinhAnh([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onFinish = (values) => {
    saveData(values.themchitiet);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.themchitiet, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (themchitiet, saveQuit = false) => {
    if (
      ListHinhAnhDaChon.length === 0 &&
      itemData &&
      itemData.isSuDungHinhAnh
    ) {
      setFieldTouch(false);
      Helpers.alertError("Vui lòng chọn hình ảnh");
    } else {
      const newData = {
        ...themchitiet,
        tits_qtsx_HangMucKiemTra_Id: itemData.tits_qtsx_HangMucKiemTra_Id,
        tits_qtsx_HangMucKiemTraChiTiet_Id: itemData.id,
        isNhapKetQua:
          themchitiet.isNhapKetQua === undefined
            ? false
            : themchitiet.isNhapKetQua,
        list_HinhAnhs: ListHinhAnhDaChon,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_HangMucKiemTra/chi-tiet`,
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
          if (res && res.status !== 409) {
            if (saveQuit) {
              handleCancel();
            } else {
              resetFields();
              setFieldTouch(false);
              setListHinhAnh([]);
              setListHinhAnhDaChon([]);
              getListDonVi();
              getListXuong();
              getCongDoan(
                itemData.tits_qtsx_SanPham_Id,
                itemData.tits_qtsx_CongDoan_Id
              );
              setFieldsValue({
                themchitiet: {
                  donVi_Id: INFO.donVi_Id.toLowerCase(),
                  tits_qtsx_HangMucKiemTraChiTiet_Id: itemData.maSo,
                  isNhapKetQua: true,
                },
              });
            }
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleThemHinhAnh = (item, khuvuc) => {
    const newData = {
      ...item,
      tenKhuVuc: khuvuc.tenKhuVuc,
    };
    setListHinhAnhDaChon([...ListHinhAnhDaChon, newData]);

    const newkhuvuc = ListHinhAnh.map((data) => {
      if (data.tenKhuVuc === khuvuc.tenKhuVuc) {
        const newhinhanh = data.list_HinhAnhs.filter(
          (hinhanh) =>
            hinhanh.tits_qtsx_SanPhamHinhAnh_Id.toLowerCase() !==
            item.tits_qtsx_SanPhamHinhAnh_Id.toLowerCase()
        );
        return {
          ...data,
          list_HinhAnhs: newhinhanh,
        };
      } else {
        return data;
      }
    });
    setListHinhAnh(newkhuvuc);
    setFieldTouch(true);
  };

  const handleXoaHinhAnh = (item) => {
    const newData = ListHinhAnhDaChon.filter(
      (data) =>
        data.tits_qtsx_SanPhamHinhAnh_Id !== item.tits_qtsx_SanPhamHinhAnh_Id
    );
    setListHinhAnhDaChon(newData);

    const newkhuvuc = ListHinhAnh.map((data) => {
      if (data.tenKhuVuc === item.tenKhuVuc) {
        const newhinhanh = {
          hinhAnh: item.hinhAnh,
          tits_qtsx_SanPhamHinhAnh_Id: item.tits_qtsx_SanPhamHinhAnh_Id,
        };
        return {
          ...data,
          list_HinhAnhs: [...data.list_HinhAnhs, newhinhanh],
        };
      } else {
        return data;
      }
    });
    setListHinhAnh(newkhuvuc);
    setFieldTouch(true);
  };

  const handleSelectXuong = (value) => {
    getListTram(value);
  };

  const handleCancel = () => {
    resetFields();
    openModalFS(false);
    refesh();
  };

  return (
    <AntModal
      title={`Thêm mới chi tiết hạng mục kiểm tra`}
      open={openModal}
      width={width > 1000 ? `80%` : "100%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
      bodyStyle={{ height: "750px", overflowY: "auto" }}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom" style={{ marginBottom: 20 }}>
          <Form
            {...DEFAULT_FORM_XUATKHONGOAIQUAN}
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
                  label="Hạng mục kiểm tra cha"
                  name={["themchitiet", "tits_qtsx_HangMucKiemTraChiTiet_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" disabled />
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
                  label="Mã số"
                  name={["themchitiet", "maSo"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập mã số" />
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
                  label="Nội dung kiểm tra"
                  name={["themchitiet", "noiDungKiemTra"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập nội dung kiểm tra"
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
                  label="Tiêu chuẩn đánh giá"
                  name={["themchitiet", "tieuChuanDanhGia"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tiêu chuẩn đánh giá"
                  />
                </FormItem>
              </Col>
              {itemData && !itemData.isNoiDung && (
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
                    label="Giá trị tiêu chuẩn MIN"
                    name={["themchitiet", "giaTriMin"]}
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="input-item"
                      placeholder="Nhập giá trị tiêu chuẩn MIN"
                    />
                  </FormItem>
                </Col>
              )}
              {itemData && !itemData.isNoiDung && (
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
                    label="Giá trị tiêu chuẩn MAX"
                    name={["themchitiet", "giaTriMax"]}
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="input-item"
                      placeholder="Nhập giá trị tiêu chuẩn MAX"
                    />
                  </FormItem>
                </Col>
              )}
              {itemData && itemData.isNoiDung && (
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
                    label="Giá trị tiêu chuẩn"
                    name={["themchitiet", "giaTriTieuChuan"]}
                    rules={[
                      {
                        type: "string",
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="input-item"
                      placeholder="Nhập giá trị tiêu chuẩn"
                    />
                  </FormItem>
                </Col>
              )}
              {itemData && itemData.isNoiDung && (
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
                    label="Phương pháp tiêu chuẩn"
                    name={["themchitiet", "phuongPhapTieuChuan"]}
                    rules={[
                      {
                        type: "string",
                      },
                    ]}
                  >
                    <Input
                      className="input-item"
                      placeholder="Nhập phương pháp tiêu chuẩn"
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
                  label="Nhà máy"
                  name={["themchitiet", "donVi_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDonVi ? ListDonVi : []}
                    optionsvalue={["id", "tenDonVi"]}
                    style={{ width: "100%" }}
                    placeholder="Chọn đơn vị nhà máy"
                    showSearch
                    optionFilterProp={"name"}
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
                  label="Xưởng"
                  name={["themchitiet", "tits_qtsx_Xuong_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListXuong ? ListXuong : []}
                    placeholder="Chọn xưởng"
                    optionsvalue={["id", "tenXuong"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    onSelect={handleSelectXuong}
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
                  label="Trạm"
                  name={["themchitiet", "tits_qtsx_Tram_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListTram ? ListTram : []}
                    placeholder="Chọn trạm"
                    optionsvalue={["id", "tenTram"]}
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
                  label="Nhập kết quả"
                  name={["themchitiet", "isNhapKetQua"]}
                  valuePropName="checked"
                >
                  <Switch />
                </FormItem>
              </Col>
              {itemData && itemData.isSuDungHinhAnh && (
                <Col lg={12} xs={24} style={{ marginBottom: 8 }}>
                  <h5 style={{ fontWeight: "bold" }}>
                    Hình ảnh trong công đoạn:
                  </h5>
                  <Card
                    className="th-card-margin-bottom th-card-reset-margin"
                    style={{
                      width: "700px",
                      height: "350px",
                      display: "start",
                      justifyContent: "space-around",
                      overflowY: "relative",
                      alignItems: "center",
                      borderColor: "#c8c8c8",
                      borderRadius: 15,
                    }}
                  >
                    {ListHinhAnh.length > 0 ? (
                      <div
                        style={{
                          overflowY: "auto",
                          maxHeight: "300px",
                        }}
                      >
                        {ListHinhAnh.map((khuvuc, index) => {
                          return (
                            <div
                              key={index}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                marginBottom: 10,
                                maxWidth: "700px",
                                overflowWrap: "break-word",
                              }}
                            >
                              <span
                                style={{ fontWeight: "bold", fontSize: 15 }}
                              >
                                {khuvuc.tenKhuVuc}
                              </span>
                              <br />
                              <span style={{}}>Mô tả: {khuvuc.moTa}</span>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  flexWrap: "wrap",
                                  marginTop: "10px",
                                }}
                              >
                                {khuvuc.list_HinhAnhs &&
                                  khuvuc.list_HinhAnhs.map((hinhanh) => {
                                    return (
                                      <div
                                        style={{
                                          position: "relative",
                                          display: "inline-block",
                                          borderRadius: 15,
                                          marginRight: 10,
                                          marginBottom: 10,
                                        }}
                                      >
                                        <Image
                                          width={110}
                                          height={110}
                                          style={{
                                            borderRadius: 15,
                                            border: "1px solid #c8c8c8",
                                            padding: 8,
                                          }}
                                          src={BASE_URL_API + hinhanh.hinhAnh}
                                        />
                                        <PlusCircleOutlined
                                          style={{
                                            fontSize: 25,
                                            position: "absolute",
                                            top: -7,
                                            right: -5,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#0469B9",
                                            backgroundColor: "#fff",
                                            borderRadius: 15,
                                            transition:
                                              "background-color 0.3s ease",
                                          }}
                                          onClick={() =>
                                            handleThemHinhAnh(hinhanh, khuvuc)
                                          }
                                        />
                                      </div>
                                    );
                                  })}
                              </div>
                              {index !== ListHinhAnh.length - 1 && <Divider />}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div>
                        <Empty style={{ height: "700px" }} />
                      </div>
                    )}
                  </Card>
                </Col>
              )}
              {itemData && itemData.isSuDungHinhAnh && (
                <Col
                  lg={12}
                  xs={24}
                  style={{ marginBottom: 8, paddingRight: 8 }}
                >
                  <h5 style={{ fontWeight: "bold" }}>Hình ảnh đã chọn:</h5>
                  <Card
                    className="th-card-margin-bottom th-card-reset-margin"
                    style={{
                      width: "700px",
                      height: "350px",
                      display: "start",
                      justifyContent: "space-around",
                      overflowY: "relative",
                      alignItems: "center",
                      borderColor: "#c8c8c8",
                      borderRadius: 15,
                    }}
                  >
                    {ListHinhAnhDaChon.length > 0 ? (
                      <div
                        style={{
                          overflowY: "auto",
                          maxHeight: "300px",
                        }}
                      >
                        {ListHinhAnhDaChon.map((hinhanh) => {
                          return (
                            <div
                              style={{
                                position: "relative",
                                display: "inline-block",
                                borderRadius: 15,
                                marginRight: 10,
                                marginTop: 10,
                              }}
                            >
                              <Image
                                width={110}
                                height={110}
                                style={{
                                  borderRadius: 15,
                                  border: "1px solid #c8c8c8",
                                  padding: 8,
                                }}
                                src={BASE_URL_API + hinhanh.hinhAnh}
                              />
                              <MinusCircleOutlined
                                style={{
                                  fontSize: 25,
                                  position: "absolute",
                                  top: -7,
                                  right: -5,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "red",
                                  backgroundColor: "#fff",
                                  borderColor: "#c8c8c8",
                                  borderRadius: 15,
                                  transition: "background-color 0.3s ease",
                                }}
                                onClick={() => handleXoaHinhAnh(hinhanh)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <Empty />
                    )}
                  </Card>
                </Col>
              )}
            </Row>
            <FormSubmit
              goBack={handleCancel}
              saveAndClose={saveAndClose}
              disabled={fieldTouch}
            />
          </Form>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalThemChiTiet;
