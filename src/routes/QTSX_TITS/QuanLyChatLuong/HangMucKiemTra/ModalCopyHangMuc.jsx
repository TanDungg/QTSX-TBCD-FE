import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Input,
  Row,
  Col,
  Form,
  Card,
  Image,
  Divider,
  Empty,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { FormSubmit, Select } from "src/components/Common";
import {
  BASE_URL_API,
  DEFAULT_FORM_XUATKHONGOAIQUAN,
} from "src/constants/Config";
import { convertObjectToUrlParams } from "src/util/Common";

const FormItem = Form.Item;

function ModalCopyHangMuc({ openModalFS, openModal, itemData, refesh }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue, validateFields } = form;
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListHinhAnh, setListHinhAnh] = useState([]);
  const [ListHinhAnhDaChon, setListHinhAnhDaChon] = useState([]);
  useEffect(() => {
    if (openModal) {
      getListSanPham(itemData.tits_qtsx_HangMucKiemTra_Id);

      setFieldsValue({
        copyHangMuc: {
          ...itemData,
          tits_qtsx_SanPham_Id: null,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListSanPham = (tits_qtsx_HangMucKiemTra_Id) => {
    let param = convertObjectToUrlParams({ tits_qtsx_HangMucKiemTra_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_HangMucKiemTra/san-pham-copy?${param}`,
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
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getCongDoan = (value, tits_qtsx_CongDoan_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPhamHinhAnh?tits_qtsx_SanPham_Id=${value}&tits_qtsx_CongDoan_Id=${tits_qtsx_CongDoan_Id}`,
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
          setListHinhAnh(JSON.parse(res.data[0].list_KhuVucs));
        } else {
          setListHinhAnh([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const onFinish = (values) => {
    saveData(values.copyHangMuc);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.copyHangMuc);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (copyHangMuc) => {
    const newData = {
      ...copyHangMuc,
      tits_qtsx_HangMucKiemTra_Id:
        itemData.tits_qtsx_HangMucKiemTra_Id &&
        itemData.tits_qtsx_HangMucKiemTra_Id,
      list_HinhAnhs: ListHinhAnhDaChon,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_HangMucKiemTra/copy`,
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
        if (res && res.status === 200) {
          handleCancel();
          setFieldTouch(false);
        }
      })
      .catch((error) => console.error(error));
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

  const handleCancel = () => {
    resetFields();
    openModalFS(false);
    refesh();
  };
  const title = "Copy hạng mục kiểm tra";

  return (
    <AntModal
      title={title}
      open={openModal}
      width={width > 1000 ? `80%` : "100%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
      bodyStyle={{
        paddingBottom: 0,
      }}
    >
      <div className="gx-main-content">
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
                label="Loại sản phẩm"
                name={["copyHangMuc", "tenLoaiSanPham"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input className="input-item" disabled={true} />
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
                label="Sản phẩm"
                name={["copyHangMuc", "tits_qtsx_SanPham_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListSanPham}
                  placeholder="Chọn sản phẩm"
                  optionsvalue={["tits_qtsx_SanPham_Id", "tenSanPham"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  onSelect={(val) => {
                    getCongDoan(val, itemData.tits_qtsx_CongDoan_Id);
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
                label="Công đoạn"
                name={["copyHangMuc", "tenCongDoan"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input className="input-item" disabled={true} />
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
                {ListHinhAnh && ListHinhAnh.length > 0 ? (
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
                                        padding: 5,
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
                              padding: 5,
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
            goBack={handleCancel}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalCopyHangMuc;
