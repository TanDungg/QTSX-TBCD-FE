import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Form,
  Row,
  Spin,
  Switch,
  Input,
  Divider,
  Image,
  Empty,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { FormSubmit, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  BASE_URL_API,
  DEFAULT_FORM_XUATKHONGOAIQUAN,
} from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import Helpers from "src/helpers";

const FormItem = Form.Item;

function ThemChiTietHMKT({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { setFieldsValue, validateFields, resetFields } = form;
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { loading } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListHangMucSuDung, setListHangMucSuDung] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [ListTram, setListTram] = useState([]);
  const [ListHinhAnh, setListHinhAnh] = useState([]);
  const [ListHinhAnhDaChon, setListHinhAnhDaChon] = useState([]);
  const [IsSuDungHinhAnh, setIsSuDungHinhAnh] = useState(false);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (permission && !permission.add) {
      history.push("/home");
    } else {
      getInfo(match.params.id);
      getListHangMucSuDung();
      getListDonVi();
      getListXuong();
      setFieldsValue({
        themchitiet: {
          donVi_Id: INFO.donVi_Id.toLowerCase(),
        },
      });
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_HangMucKiemTra/${id}`,
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
          setInfo(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListHangMucSuDung = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_HangMucKiemTra?page=-1`,
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
          setListHangMucSuDung(res.data);
        } else {
          setListHangMucSuDung([]);
        }
      })
      .catch((error) => console.error(error));
  };

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

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.hangmuckiemtra);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.hangmuckiemtra, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (hangmuckiemtra, saveQuit = false) => {
    if (type === "new") {
      if (ListHinhAnhDaChon.length === 0 && IsSuDungHinhAnh === false) {
        setFieldTouch(false);
        Helpers.alertError("Vui lòng chọn hình ảnh");
      } else {
        const newData = {
          ...hangmuckiemtra,
          isNoiDung: hangmuckiemtra.isNoiDung === "isNoiDung" ? true : false,
          isSuDung:
            hangmuckiemtra.isSuDung === undefined
              ? false
              : hangmuckiemtra.isSuDung,
          isFile:
            hangmuckiemtra.isFile === undefined ? false : hangmuckiemtra.isFile,
          isSuDungHinhAnh:
            hangmuckiemtra.isSuDungHinhAnh === undefined
              ? false
              : hangmuckiemtra.isSuDungHinhAnh,
        };
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `tits_qtsx_HangMucKiemTra`,
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
                goBack();
              } else {
                resetFields();
                setFieldTouch(false);
              }
            }
          })
          .catch((error) => console.error(error));
      }
    }
  };

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

  const formTitle =
    type === "new"
      ? "Thêm mới hạng mục kiểm tra"
      : "Chỉnh sửa hạng mục kiểm tra";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin chung"}
        headStyle={{
          textAlign: "center",
          backgroundColor: "#0469B9",
          color: "#fff",
        }}
      >
        <Spin spinning={loading}>
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
                  name={["themchitiet", "tits_qtsx_HangMucKiemTra_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListHangMucSuDung ? ListHangMucSuDung : []}
                    optionsvalue={[
                      "tits_qtsx_HangMucKiemTra_Id",
                      "tenHangMucKiemTra",
                    ]}
                    style={{ width: "100%" }}
                    placeholder="Chọn hạng mục sử dụng cha"
                    showSearch
                    optionFilterProp={"name"}
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
                      required: true,
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
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập phương pháp tiêu chuẩn"
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
                  label="Nhà máy"
                  name={["themchitiet", "donVi_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
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
                    // onSelect={SelectViTriKho}
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
                >
                  <Switch defaultChecked />
                </FormItem>
              </Col>
              {IsSuDungHinhAnh === false && (
                <Col lg={12} xs={24} style={{ marginBottom: 8 }}>
                  <h5 style={{ fontWeight: "bold" }}>
                    Hình ảnh trong công đoạn:
                  </h5>
                  <Card
                    className="th-card-margin-bottom th-card-reset-margin"
                    style={{
                      width: "730px",
                      height: "400px",
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
                          maxHeight: "350px",
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
                                        {type === "new" && (
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
                                        )}
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
                        <Empty style={{ height: "730px" }} />
                      </div>
                    )}
                  </Card>
                </Col>
              )}
              {IsSuDungHinhAnh === false && (
                <Col lg={12} xs={24} style={{ marginBottom: 8 }}>
                  <h5 style={{ fontWeight: "bold" }}>Hình ảnh đã chọn:</h5>
                  <Card
                    className="th-card-margin-bottom th-card-reset-margin"
                    style={{
                      width: "730px",
                      height: "400px",
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
                          maxHeight: "350px",
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
                              {type === "new" && (
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
                              )}
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
              goBack={goBack}
              saveAndClose={saveAndClose}
              disabled={fieldTouch}
            />
          </Form>
        </Spin>
      </Card>
    </div>
  );
}

export default ThemChiTietHMKT;
