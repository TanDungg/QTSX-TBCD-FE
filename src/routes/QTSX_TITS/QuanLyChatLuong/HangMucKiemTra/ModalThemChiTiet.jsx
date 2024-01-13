import { Modal as AntModal, Input, Row, Col, Form, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { FormSubmit, Select } from "src/components/Common";
import { DEFAULT_FORM_XUATKHONGOAIQUAN } from "src/constants/Config";
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

  useEffect(() => {
    if (openModal) {
      if (itemData.type === "add") {
        getListDonVi();
        getListXuong(itemData && itemData.tits_qtsx_CongDoan_Id);
        setFieldsValue({
          themchitiet: {
            donVi_Id: INFO.donVi_Id.toLowerCase(),
          },
        });
      } else if (itemData.type === "edit") {
        getListDonVi();
        getListXuong(itemData && itemData.tits_qtsx_CongDoan_Id);
        getListTram(itemData.tits_qtsx_Xuong_Id);
        setFieldsValue({
          themchitiet: {
            ...itemData,
          },
        });
      }
    }
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

  const getListXuong = (congDoan_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Xuong?page=-1&&congDoan_Id=${congDoan_Id}`,
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
    if (itemData.type === "add") {
      const newData = {
        ...themchitiet,
        tits_qtsx_HangMucKiemTraTieuDePhu_Id:
          itemData.tits_qtsx_HangMucKiemTraTieuDePhu_Id &&
          itemData.tits_qtsx_HangMucKiemTraTieuDePhu_Id,
        tits_qtsx_HangMucKiemTra_Id: itemData.tits_qtsx_HangMucKiemTra_Id,
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
          if (res && res.status === 200) {
            if (saveQuit) {
              handleCancel();
            } else {
              setFieldTouch(false);
              getListDonVi();
              getListXuong(itemData && itemData.tits_qtsx_CongDoan_Id);

              setFieldsValue({
                themchitiet: {
                  maSo: null,
                  noiDungKiemTra: null,
                  tieuChuanDanhGia: null,
                  giaTriMin: null,
                  giaTriMax: null,
                  giaTriTieuChuan: null,
                  phuongPhapTieuChuan: null,
                },
              });
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (itemData.type === "edit") {
      const newData = {
        ...themchitiet,
        id: itemData.tits_qtsx_HangMucKiemTraChiTiet_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_HangMucKiemTra/hang-muc-kiem-tra-chi-tiet/${itemData.tits_qtsx_HangMucKiemTraChiTiet_Id}`,
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
          if (res && res.status === 200) {
            if (saveQuit) {
              handleCancel();
            } else {
              setFieldTouch(false);
              getListDonVi();
              getListXuong(itemData && itemData.tits_qtsx_CongDoan_Id);
            }
          }
        })
        .catch((error) => console.log(error));
    }
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
    itemData.type === "add" ? (
      <span>
        Thêm mới chi tiết hạng mục kiểm tra chi tiết{" "}
        {/* <Tag color={"darkcyan"} style={{ fontSize: "14px" }}>
          {itemData && itemData.tenHangMucKiemTra}
        </Tag> */}
      </span>
    ) : (
      <span>
        Chỉnh sửa chi tiết hạng mục kiểm tra chi tiết{" "}
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
                label="Mã số"
                name={["themchitiet", "maSo"]}
                rules={[
                  {
                    required: true,
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
                  disabled={itemData.type === "add" ? false : true}
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
                  disabled={itemData.type === "add" ? false : true}
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

export default ModalThemChiTiet;
