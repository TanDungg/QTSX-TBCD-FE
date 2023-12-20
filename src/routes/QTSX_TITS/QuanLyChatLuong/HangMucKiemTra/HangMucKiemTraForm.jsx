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

function HangMucKiemTraForm({ match, permission, history }) {
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
  const [HinhAnhDaChon, setHinhAnhDaChon] = useState([]);
  const [ListHinhAnhDaChon, setListHinhAnhDaChon] = useState([]);
  const [IsSuDungHinhAnh, setIsSuDungHinhAnh] = useState(false);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getLoaiSanPham();
      }
    } else if (includes(match.url, "chinh-sua")) {
      if (permission && permission.edit) {
        setType("edit");
        setId(match.params.id);
        getInfo(match.params.id);
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    } else if (includes(match.url, "chi-tiet")) {
      if (permission && permission.edit) {
        setType("detail");
        setId(match.params.id);
        getInfo(match.params.id);
      } else if (permission && !permission.edit) {
        history.push("/home");
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
          setListCongDoan(res.data);
          const newListHinhAnh = res.data.filter(
            (congdoan) =>
              congdoan.tits_qtsx_CongDoan_Id.toLowerCase() === key.toLowerCase()
          );
          const hinhanh =
            newListHinhAnh[0].list_KhuVucs &&
            JSON.parse(newListHinhAnh[0].list_KhuVucs);

          if (!hinhanhdachon) {
            setListHinhAnh(hinhanh);
          } else {
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
          }
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
          getLoaiSanPham();
          setLoaiSanPham(res.data.tits_qtsx_LoaiSanPham_Id);
          getSanPham(res.data.tits_qtsx_LoaiSanPham_Id);
          setSanPham(res.data.tits_qtsx_SanPham_Id);
          getCongDoan(
            res.data.tits_qtsx_SanPham_Id,
            res.data.tits_qtsx_CongDoan_Id,
            res.data.list_HinhAnhs
          );
          setCongDoan(res.data.tits_qtsx_CongDoan_Id);
          setHinhAnhDaChon(res.data.list_HinhAnhs);

          setInfo(res.data);
          setFieldsValue({
            hangmuckiemtra: {
              ...res.data,
              isNoiDung:
                res.data.isNoiDung === true ? "isNoiDung" : "isThongSo",
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
          tits_qtsx_SanPham_Id: SanPham,
          tits_qtsx_CongDoan_Id: CongDoan,
          list_HinhAnhs: ListHinhAnhDaChon,
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
                setListHinhAnh([]);
                setListHinhAnhDaChon([]);
                setLoaiSanPham(null);
                setSanPham(null);
                setCongDoan(null);
              }
            } else {
              setFieldTouch(false);
            }
          })
          .catch((error) => console.error(error));
      }
    }
    if (type === "edit") {
      const newData = {
        ...hangmuckiemtra,
        id: id,
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
        list_HinhAnhs: ListHinhAnhDaChon,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_HangMucKiemTra/hang-muc-kiem-tra/${id}`,
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

  const handleOnSelectLoaiSanPham = (value) => {
    setListHinhAnh([]);
    setLoaiSanPham(value);
    setSanPham(null);
    setCongDoan(null);
    getSanPham(value);
  };

  const handleOnSelectSanPham = (value) => {
    setListHinhAnh([]);
    setSanPham(value);
    setCongDoan(null);
    getCongDoan(value);
  };

  const handleOnSelectCongDoan = (value) => {
    setCongDoan(value);
    const newListHinhAnh = ListCongDoan.filter(
      (congdoan) => congdoan.tits_qtsx_CongDoan_Id === value
    );
    const hinhanh =
      newListHinhAnh[0].list_KhuVucs &&
      JSON.parse(newListHinhAnh[0].list_KhuVucs);
    setListHinhAnh(hinhanh);
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
              disabled={type === "new" ? false : true}
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
              disabled={LoaiSanPham === null || type !== "new" ? true : false}
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
              disabled={SanPham === null || type !== "new" ? true : false}
            />
          </Col>
        </Row>
      </Card>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin hạng mục kiểm tra"}
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
                      { key: "isNoiDung", title: "Nội dung" },
                      { key: "isThongSo", title: "Thông số" },
                    ]}
                    placeholder="Chọn kiểu đánh giá"
                    optionsvalue={["key", "title"]}
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
                  label="Sử dụng"
                  name={["hangmuckiemtra", "isSuDung"]}
                  valuePropName="checked"
                >
                  <Switch disabled={type === "detail" ? true : false} />
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
                  <Switch disabled={type === "detail" ? true : false} />
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
                  <Input
                    className="input-item"
                    placeholder="Nhập ghi chú"
                    disabled={type === "detail" ? true : false}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col
                lg={12}
                xs={24}
                style={{
                  marginBottom: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Card
                  className="th-card-margin-bottom th-card-reset-margin"
                  title="Hình ảnh trong công đoạn"
                  style={{
                    width: "730px",
                    height: "450px",
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
                        maxHeight: "380px",
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
                      <Empty style={{ height: "450px" }} />
                    </div>
                  )}
                </Card>
              </Col>
              <Col
                lg={12}
                xs={24}
                style={{
                  marginBottom: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Card
                  className="th-card-margin-bottom th-card-reset-margin"
                  title="Hình ảnh đã chọn"
                  style={{
                    width: "730px",
                    height: "450px",
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
                        maxHeight: "380px",
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
                    <div>
                      <Empty style={{ height: "450px" }} />
                    </div>
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

export default HangMucKiemTraForm;
