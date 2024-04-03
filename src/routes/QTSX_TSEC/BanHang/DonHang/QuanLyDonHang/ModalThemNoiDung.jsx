import { Modal as AntModal, Form, Card, Input, Col, DatePicker } from "antd";
import dayjs from "dayjs";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import { DEFAULT_FORM_ADD_170PX } from "src/constants/Config";
import { getTokenInfo, getLocalStorage, getDateNow } from "src/util/Common";

const FormItem = Form.Item;
const List = [
  {
    noiDungYeuCau: "noiDungYeuCau3",
    tenLoaiThongTin: "tenLoaiThongTin3",
  },
  {
    noiDungYeuCau: "noiDungYeuCau4",
    tenLoaiThongTin: "tenLoaiThongTin4",
  },
];

function ModalThemNoiDung({
  openModalFS,
  openModal,
  chitiet,
  refesh,
  DataThemNoiDung,
  TypeYeuCau,
}) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListNoiDung, setListNoiDung] = useState(false);
  const [ListNhanSu, setListNhanSu] = useState(false);
  const [isChinhSua, setIsChinhSua] = useState(false);

  useEffect(() => {
    if (openModal) {
      getListUser();
      setListNoiDung(List);
      if (chitiet) {
        setIsChinhSua(true);
        setFieldsValue({
          formthemnoidung: chitiet,
        });
      } else {
        if (TypeYeuCau === 1) {
          setFieldsValue({
            formthemnoidung: {
              ngayHoanThanh: moment(getDateNow(), "DD/MM/YYYY"),
            },
          });
        } else if (TypeYeuCau === 2) {
          setFieldsValue({
            formthemnoidung: {
              ngayNhanThongTin: moment(getDateNow(), "DD/MM/YYYY"),
              ngayHoanThanh: moment(getDateNow(), "DD/MM/YYYY"),
            },
          });
        } else if (TypeYeuCau === 3) {
          setFieldsValue({
            formthemnoidung: {
              ngayBatDau: moment(getDateNow(), "DD/MM/YYYY"),
              ngayHoanThanh: moment(getDateNow(), "DD/MM/YYYY"),
            },
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

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
          setListNhanSu(newData);
        } else {
          setListNhanSu([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onFinish = (values) => {
    ThemNoiDung(values.formthemnoidung);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        ThemNoiDung(values.formthemnoidung, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const ThemNoiDung = (formthemnoidung, saveQuit = false) => {
    console.log(formthemnoidung);
    const newNoiDung = ListNoiDung.find(
      (noidung) =>
        noidung.noiDungYeuCau.toString() ===
        formthemnoidung.qtsx_tsec_NoiDungYeuCau_Id
    );
    DataThemNoiDung({
      ...formthemnoidung,
      ...newNoiDung,
      isChinhSua: isChinhSua,
    });

    const newListNoiDung = ListNoiDung.filter(
      (noidung) =>
        noidung.noiDungYeuCau.toString() !==
        formthemnoidung.qtsx_tsec_NoiDungYeuCau_Id
    );
    setListNoiDung(newListNoiDung);

    setFieldTouch(false);
    resetFields();
    setFieldsValue({
      formthemnoidung: {
        trangThai: true,
      },
    });
    refesh();
    if (saveQuit || chitiet) {
      handleCancel();
    }
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const handleCancel = () => {
    resetFields();
    setIsChinhSua(false);
    setFieldTouch(false);
    openModalFS(false);
    refesh();
  };

  return (
    <AntModal
      title="Thêm nội dung yêu cầu"
      open={openModal}
      width={width >= 1600 ? `65%` : width >= 1200 ? `80%` : `100%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card
        className="th-card-margin-bottom"
        align="center"
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_170PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Nội dung yêu cầu"
              name={["formthemnoidung", "qtsx_tsec_NoiDungYeuCau_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListNoiDung ? ListNoiDung : []}
                placeholder="Chọn nội dung yêu cầu"
                optionsvalue={["noiDungYeuCau", "noiDungYeuCau"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp={"name"}
              />
            </FormItem>
          </Col>
          {TypeYeuCau === 2 ? (
            <Col xxl={18} xl={20} lg={22} xs={24}>
              <FormItem
                label="Loại lỗi"
                name={["formthemnoidung", "qtsx_tsec_LoaiLoi_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNoiDung ? ListNoiDung : []}
                  placeholder="Chọn loại lỗi"
                  optionsvalue={["noiDungYeuCau", "noiDungYeuCau"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                />
              </FormItem>
            </Col>
          ) : null}
          {TypeYeuCau === 1 ? (
            <Col xxl={18} xl={20} lg={22} xs={24}>
              <FormItem
                label="Địa điểm"
                name={["formthemnoidung", "diaDiem"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input className="input-item" placeholder="Nhập địa điểm" />
              </FormItem>
            </Col>
          ) : null}
          {TypeYeuCau === 3 ? (
            <Col xxl={18} xl={20} lg={22} xs={24}>
              <FormItem
                label="Ngày bắt đầu"
                name={["formthemnoidung", "ngayBatDau"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  disabledDate={disabledDate}
                  allowClear={false}
                />
              </FormItem>
            </Col>
          ) : null}
          {TypeYeuCau === 2 ? (
            <Col xxl={18} xl={20} lg={22} xs={24}>
              <FormItem
                label="Ngày nhận thông tin"
                name={["formthemnoidung", "ngayNhanThongTin"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  disabledDate={disabledDate}
                  allowClear={false}
                />
              </FormItem>
            </Col>
          ) : null}
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Ngày hoàn thành"
              name={["formthemnoidung", "ngayHoanThanh"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <DatePicker
                format={"DD/MM/YYYY"}
                disabledDate={disabledDate}
                allowClear={false}
              />
            </FormItem>
          </Col>
          {TypeYeuCau === 1 ? (
            <Col xxl={18} xl={20} lg={22} xs={24}>
              <FormItem
                label="Xưởng/Phòng ban"
                name={["formthemnoidung", "qtsx_tsec_PhongBan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNoiDung ? ListNoiDung : []}
                  placeholder="Chọn xưởng/phòng ban"
                  optionsvalue={["noiDungYeuCau", "tenLoaiThongTin"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                />
              </FormItem>
            </Col>
          ) : null}
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Nhân sự thực hiện"
              name={["formthemnoidung", "tsec_qtsx_NhanSuThucHien_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListNhanSu ? ListNhanSu : []}
                placeholder="Chọn nhân sự thực hiện"
                optionsvalue={["id", "user"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp={"name"}
              />
            </FormItem>
          </Col>
          {TypeYeuCau === 1 ? (
            <Col xxl={18} xl={20} lg={22} xs={24}>
              <FormItem
                label="Nhân sự quản lý"
                name={["formthemnoidung", "tsec_qtsx_NhanSuQuanLy_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhanSu ? ListNhanSu : []}
                  placeholder="Chọn nhân sự quản lý"
                  optionsvalue={["id", "user"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                />
              </FormItem>
            </Col>
          ) : null}
          {TypeYeuCau === 3 ? (
            <Col xxl={18} xl={20} lg={22} xs={24}>
              <FormItem
                label="Ghi chú"
                name={["formthemnoidung", "moTa"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input className="input-item" placeholder="Nhập ghi chú" />
              </FormItem>
            </Col>
          ) : null}
          {!chitiet ? (
            <FormSubmit
              goBack={handleCancel}
              saveAndClose={saveAndClose}
              disabled={fieldTouch}
            />
          ) : (
            <FormSubmit goBack={handleCancel} disabled={fieldTouch} />
          )}
        </Form>
      </Card>
    </AntModal>
  );
}

export default ModalThemNoiDung;
