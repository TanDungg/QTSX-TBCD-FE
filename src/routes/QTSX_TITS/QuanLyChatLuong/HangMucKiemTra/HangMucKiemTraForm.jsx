import React, { useState, useEffect } from "react";
import {
  Button,
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
import { DeleteOutlined } from "@ant-design/icons";

const FormItem = Form.Item;

function HangMucSuDungForm({ match, permission, history }) {
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
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [LoaiSanPham, setLoaiSanPham] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [ListCongDoan, setListCongDoan] = useState([]);
  const [CongDoan, setCongDoan] = useState(null);
  const [ListHinhAnh, setListHinhAnh] = useState([]);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getLoaiSanPham();
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getInfo(match.params.id);
        }
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLoaiSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_LoaiSanPham?page=-1`,
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
          setListLoaiSanPham(res.data);
        } else {
          setListLoaiSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getSanPham = (tits_qtsx_LoaiSanPham_Id) => {
    let param = convertObjectToUrlParams({
      tits_qtsx_LoaiSanPham_Id,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPham?${param}`,
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
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getCongDoan = (value) => {
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
          setListCongDoan(res.data);
        } else {
          setListCongDoan([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Lấy thông tin info
   *
   * @param {*} id
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ChiTiet/${id}`,
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
          setFieldsValue({
            hangmuckiemtra: {
              ...res.data,
            },
          });
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
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_ChiTiet`,
            "POST",
            hangmuckiemtra,
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
    if (type === "edit") {
      hangmuckiemtra.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_ChiTiet/${id}`,
            "PUT",
            hangmuckiemtra,
            "EDIT",
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
              setFieldTouch(false);
              getInfo(id);
            }
          }
        })
        .catch((error) => console.log(error));
    }
  };

  /**
   * Quay lại trang chi tiết
   *
   */
  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const handleOnSelectLoaiSanPham = (value) => {
    setLoaiSanPham(value);
    setSanPham(null);
    getSanPham(value);
  };

  const handleOnSelectSanPham = (value) => {
    setSanPham(value);
    setCongDoan(null);
    getCongDoan(value);
  };

  const handleOnSelectCongDoan = (value) => {
    setCongDoan(value);
    const newListHinhAnh = ListCongDoan.filter(
      (congdoan) => congdoan.tits_qtsx_CongDoan_Id === value
    );
    console.log(newListHinhAnh);
    const hinhanh =
      newListHinhAnh[0].list_KhuVucs &&
      JSON.parse(newListHinhAnh[0].list_KhuVucs);
    setListHinhAnh(hinhanh);
  };

  const formTitle =
    type === "new"
      ? "Thêm mới hạng mục kiểm tra"
      : "Chỉnh sửa hạng mục kiểm tra";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <div>
          <h3 style={{ fontWeight: "bold" }}>
            Hạng mục kiểm tra được áp dụng với:
          </h3>
        </div>
        <Row>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Loại sản phẩm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLoaiSanPham ? ListLoaiSanPham : []}
              placeholder="Chọn loại sản phẩm"
              optionsvalue={["id", "tenLoaiSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectLoaiSanPham}
              value={LoaiSanPham}
            />
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Sản phẩm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham ? ListSanPham : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "tenSanPham"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectSanPham}
              optionFilterProp="name"
              value={SanPham}
              disabled={LoaiSanPham === null ? true : false}
            />
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Công đoạn:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListCongDoan ? ListCongDoan : []}
              placeholder="Chọn công đoạn"
              optionsvalue={["tits_qtsx_CongDoan_Id", "tenCongDoan"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectCongDoan}
              optionFilterProp="name"
              value={CongDoan}
              disabled={SanPham === null ? true : false}
            />
          </Col>
        </Row>
      </Card>
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
                  label="Tên hạng mục kiểm tra"
                  name={["hangmuckiemtra", "tenHangMucKiemTra"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên hạng mục kiểm tra"
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
                  label="Kiểu đánh giá"
                  name={["hangmuckiemtra", "isNoiDung"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={[
                      { key: "1", title: "Nội dung" },
                      { key: "0", title: "Thông số" },
                    ]}
                    placeholder="Chọn kiểu đánh giá"
                    optionsvalue={["key", "title"]}
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
                  label="Ghi chú"
                  name={["hangmuckiemtra", "moTa"]}
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
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Sử dụng hình ảnh chi tiết"
                  name={["hangmuckiemtra", "isSuDungHinhAnh"]}
                  valuePropName="checked"
                >
                  <Switch />
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
                  label="Sử dụng"
                  name={["hangmuckiemtra", "isSuDung"]}
                  valuePropName="checked"
                >
                  <Switch />
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
                  label="File kết quả"
                  name={["hangmuckiemtra", "isFile"]}
                  valuePropName="checked"
                >
                  <Switch />
                </FormItem>
              </Col>
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
                      {ListHinhAnh.map((khuvuc) => {
                        return (
                          <div
                            style={{
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                              marginBottom: 10,
                              maxWidth: "420px",
                              overflowWrap: "break-word",
                            }}
                          >
                            <span style={{ fontWeight: "bold", fontSize: 15 }}>
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
                                        width={130}
                                        height={130}
                                        style={{
                                          borderRadius: 15,
                                          border: "1px solid #c8c8c8",
                                          padding: 10,
                                        }}
                                        src={BASE_URL_API + hinhanh.hinhAnh}
                                      />
                                      <Button
                                        title="Xóa hình ảnh"
                                        style={{
                                          width: 25,
                                          height: 30,
                                          position: "absolute",
                                          top: -5,
                                          right: -5,
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "red",
                                          backgroundColor: "#fff",
                                          borderColor: "#c8c8c8",
                                          borderRadius: 15,
                                          transition:
                                            "background-color 0.3s ease",
                                        }}
                                        // onClick={() =>
                                        //   handleDeleteClick({
                                        //     id: hinhanh.tits_qtsx_SanPhamHinhAnh_Id,
                                        //     tenKhuVuc: khuvuc.tenKhuVuc,
                                        //   })
                                        // }
                                      >
                                        <DeleteOutlined
                                          style={{ fontSize: 15 }}
                                        />
                                      </Button>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Empty />
                  )}
                </Card>
              </Col>
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
                  {ListHinhAnh.length > 0 ? (
                    <div
                      style={{
                        overflowY: "auto",
                        maxHeight: "350px",
                      }}
                    >
                      {ListHinhAnh.map((khuvuc) => {
                        return (
                          <div
                            style={{
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                              marginBottom: 10,
                              maxWidth: "420px",
                              overflowWrap: "break-word",
                            }}
                          >
                            <span style={{ fontWeight: "bold", fontSize: 15 }}>
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
                                        width={130}
                                        height={130}
                                        style={{
                                          borderRadius: 15,
                                          border: "1px solid #c8c8c8",
                                          padding: 10,
                                        }}
                                        src={BASE_URL_API + hinhanh.hinhAnh}
                                      />
                                      <Button
                                        title="Xóa hình ảnh"
                                        style={{
                                          width: 25,
                                          height: 30,
                                          position: "absolute",
                                          top: -5,
                                          right: -5,
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "red",
                                          backgroundColor: "#fff",
                                          borderColor: "#c8c8c8",
                                          borderRadius: 15,
                                          transition:
                                            "background-color 0.3s ease",
                                        }}
                                        // onClick={() =>
                                        //   handleDeleteClick({
                                        //     id: hinhanh.tits_qtsx_SanPhamHinhAnh_Id,
                                        //     tenKhuVuc: khuvuc.tenKhuVuc,
                                        //   })
                                        // }
                                      >
                                        <DeleteOutlined
                                          style={{ fontSize: 15 }}
                                        />
                                      </Button>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Empty />
                  )}
                </Card>
              </Col>
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

export default HangMucSuDungForm;
