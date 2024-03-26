import { Modal as AntModal, Form, Card, Input, Col, Checkbox } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FormSubmit, Select } from "src/components/Common";
import { DEFAULT_FORM_ADD_150PX } from "src/constants/Config";

const FormItem = Form.Item;
const { TextArea } = Input;
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
}) {
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListNoiDung, setListNoiDung] = useState(false);
  const [isChinhSua, setIsChinhSua] = useState(false);

  useEffect(() => {
    if (openModal) {
      setListNoiDung(List);
      if (chitiet) {
        setIsChinhSua(true);
        setFieldsValue({
          formthemnoidung: chitiet,
        });
      } else {
        setFieldsValue({
          formthemnoidung: {
            trangThai: true,
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

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
          {...DEFAULT_FORM_ADD_150PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Nội dung đáp án"
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
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Loại thông tin"
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
                placeholder="Loại thông tin"
                optionsvalue={["noiDungYeuCau", "tenLoaiThongTin"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp={"name"}
                disabled
              />
            </FormItem>
          </Col>
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Trạng thái"
              name={["formthemnoidung", "trangThai"]}
              valuePropName="checked"
            >
              <Checkbox />
            </FormItem>
          </Col>
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
              <TextArea
                rows={3}
                className="input-item"
                placeholder="Nhập ghi chú"
              />
            </FormItem>
          </Col>
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
