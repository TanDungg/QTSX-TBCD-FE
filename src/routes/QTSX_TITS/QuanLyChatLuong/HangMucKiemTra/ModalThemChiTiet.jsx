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
  Tag,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
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
  const cardRef = useRef(null);
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
      if (itemData.loai === "new") {
        getListDonVi();
        getListXuong();
        getCongDoan(
          itemData.tits_qtsx_SanPham_Id,
          itemData.tits_qtsx_CongDoan_Id
        );
        setFieldsValue({
          themchitiet: {
            donVi_Id: INFO.donVi_Id.toLowerCase(),
            maSoCha: itemData.maSo,
            isNhapKetQua: true,
          },
        });
      } else if (itemData.loai === "edit") {
        getListDonVi();
        getListXuong();
        getListTram(itemData.tits_qtsx_Xuong_Id);
        getCongDoan(
          itemData.tits_qtsx_SanPham_Id,
          itemData.tits_qtsx_CongDoan_Id
        );
        setFieldsValue({
          themchitiet: {
            ...itemData,
          },
        });
      }
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
      if (itemData.loai === "new") {
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
                    maSoCha: itemData.maSo,
                    isNhapKetQua: true,
                  },
                });
              }
            }
          })
          .catch((error) => console.error(error));
      }
      if (itemData.loai === "edit") {
        const newData = {
          ...themchitiet,
          id: itemData.id,
          tits_qtsx_HangMucKiemTra_Id: itemData.tits_qtsx_HangMucKiemTra_Id,
          isNhapKetQua:
            themchitiet.isNhapKetQua === undefined
              ? false
              : themchitiet.isNhapKetQua,
          list_HinhAnhs: ListHinhAnhDaChon,
        };
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `tits_qtsx_HangMucKiemTra/hang-muc-kiem-tra-chi-tiet/${itemData.id}`,
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
              handleCancel();
            }
          })
          .catch((error) => console.log(error));
      }
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
  const title =
    itemData.loai === "new" ? (
      <span>
        Thêm mới chi tiết hạng mục kiểm tra{" "}
        <Tag color={"darkcyan"} style={{ fontSize: "14px" }}>
          {itemData && itemData.maSo}
        </Tag>
      </span>
    ) : (
      <span>
        Chỉnh sửa chi tiết hạng mục kiểm tra{" "}
        <Tag color={"darkcyan"} style={{ fontSize: "14px" }}>
          {itemData && itemData.maSo}
        </Tag>
      </span>
    );
  return (
    <AntModal
      title={title}
      open={openModal}
      width={width > 1000 ? `80%` : "100%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
      bodyStyle={{
        height:
          cardRef.current && cardRef.current.clientHeight <= 640
            ? cardRef.current && cardRef.current.clientHeight + 60
            : 700,
        overflowY: "auto",
      }}
    >
      <div className="gx-main-content">
        <Card
          ref={cardRef}
          className="th-card-margin-bottom"
          style={{ marginBottom: 20 }}
        >
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
                  name={["themchitiet", "maSoCha"]}
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
                      required: true,
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
                      required: true,
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
                    disabled={itemData.loai === "new" ? false : true}
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
                      required: true,
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
                    disabled={itemData.loai === "new" ? false : true}
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
