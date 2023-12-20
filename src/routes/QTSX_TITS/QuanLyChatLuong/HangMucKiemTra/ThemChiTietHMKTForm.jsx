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
  Tag,
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

function ThemChiTietHMKTForm({ match, permission, history }) {
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
  const [ListHangMucSuDung, setListHangMucSuDung] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [ListTram, setListTram] = useState([]);
  const [ListHinhAnh, setListHinhAnh] = useState([]);
  const [ListHinhAnhDaChon, setListHinhAnhDaChon] = useState([]);
  const [HinhAnhDaChon, setHinhAnhDaChon] = useState([]);
  const [id, setId] = useState(undefined);
  const [idChiTiet, setIdChiTiet] = useState(undefined);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        setId(match.params.id);
        getInfo(match.params.id, "new");
        getListHangMucSuDung();
        getListDonVi();
        getListXuong();
      }
    } else if (includes(match.url, "chinh-sua")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("edit");
        setId(match.params.id);
        setIdChiTiet(match.params.idchitiet);
        getInfo(match.params.id, "edit");
        getListHangMucSuDung();
        getListDonVi();
        getListXuong();
      }
    }

    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInfo = (id, key) => {
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
          if (key === "edit") {
            const listData =
              res.data.list_HangMucKiemTraChiTiets &&
              res.data.list_HangMucKiemTraChiTiets.filter(
                (data) => (data.id = match.params.idchitiet)
              );
            getListTram(listData[0].tits_qtsx_Xuong_Id);
            setFieldsValue({
              themchitiet: {
                ...listData[0],
                tenHangMucKiemTra: res.data.tenHangMucKiemTra,
              },
            });
            setHinhAnhDaChon(
              listData[0].list_HinhAnhs && listData[0].list_HinhAnhs
            );
            getCongDoan(
              res.data.tits_qtsx_SanPham_Id,
              res.data.tits_qtsx_CongDoan_Id,
              listData[0].list_HinhAnhs
            );
          } else {
            getCongDoan(
              res.data.tits_qtsx_SanPham_Id,
              res.data.tits_qtsx_CongDoan_Id
            );
            setFieldsValue({
              themchitiet: {
                donVi_Id: INFO.donVi_Id.toLowerCase(),
                tenHangMucKiemTra: res.data && res.data.tenHangMucKiemTra,
                isNhapKetQua: true,
              },
            });
          }
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

  /**
   * Khi submit
   *
   * @param {*} values
   */
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
    if (type === "new") {
      if (ListHinhAnhDaChon.length === 0 && info && info.isSuDungHinhAnh) {
        setFieldTouch(false);
        Helpers.alertError("Vui lòng chọn hình ảnh");
      } else {
        const newData = {
          ...themchitiet,
          tits_qtsx_HangMucKiemTra_Id: info.tits_qtsx_HangMucKiemTra_Id,
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
                goBack();
              } else {
                resetFields();
                setFieldTouch(false);
                setListHinhAnh([]);
                setListHinhAnhDaChon([]);
                getInfo(id, type);
                setFieldsValue({
                  themchitiet: {
                    donVi_Id: INFO.donVi_Id.toLowerCase(),
                    isNhapKetQua: true,
                  },
                });
              }
            }
          })
          .catch((error) => console.error(error));
      }
    }
    if (type === "edit") {
      const newData = {
        ...themchitiet,
        id: idChiTiet,
        tits_qtsx_HangMucKiemTra_Id: info.tits_qtsx_HangMucKiemTra_Id,
        isNhapKetQua:
          themchitiet.isNhapKetQua === undefined
            ? false
            : themchitiet.isNhapKetQua,
        list_HinhAnhs: ListHinhAnhDaChon,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_HangMucKiemTra/hang-muc-kiem-tra-chi-tiet/${idChiTiet}`,
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
              getInfo(id, type);
            }
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${idChiTiet}/chinh-sua`,
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
    setFieldsValue({
      themchitiet: {
        tits_qtsx_Tram_Id: null,
      },
    });
  };

  const formTitle =
    type === "new"
      ? "Thêm mới chi tiết hạng mục kiểm tra"
      : "Chỉnh sửa chi tiết hạng mục kiểm tra";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thêm mới chi tiết hạng mục kiểm tra"}
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
                  name={["themchitiet", "tenHangMucKiemTra"]}
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
              {info && !info.isNoiDung && (
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
              {info && !info.isNoiDung && (
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
              {info && info.isNoiDung && (
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
              {info && info.isNoiDung && (
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
                <FormItem
                  label="Nhập kết quả"
                  name={["themchitiet", "isNhapKetQua"]}
                  valuePropName="checked"
                >
                  <Switch />
                </FormItem>
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

export default ThemChiTietHMKTForm;
