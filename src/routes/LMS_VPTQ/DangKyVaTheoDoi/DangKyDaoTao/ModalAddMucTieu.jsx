import { Modal as AntModal, Form, Input, Card, Col } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { FormSubmit } from "src/components/Common";
import { DEFAULT_FORM_ADD_170PX } from "src/constants/Config";

const { TextArea } = Input;
const FormItem = Form.Item;

function ModalAddMucTieu({ openModalFS, openModal, refesh }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;

  const onFinish = (values) => {
    saveData(values.formmuctieudaotao);
  };

  const saveData = (formmuctieudaotao) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_MucTieuDaoTao`,
          "POST",
          formmuctieudaotao,
          "ADD",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          handleCancel();
          refesh();
        } else {
          setFieldTouch(false);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleCancel = () => {
    openModalFS(false);
    resetFields();
    setFieldTouch(false);
  };

  return (
    <AntModal
      title="Thêm mới mục tiêu đào tạo"
      open={openModal}
      width={width >= 1600 ? "50%" : "80%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        align={"center"}
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_170PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col lg={20} xs={24}>
            <FormItem
              label="Mã mục tiêu đào tạo"
              name={["formmuctieudaotao", "maMucTieuDaoTao"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 50,
                  message: "Mã mục tiêu đào tạo không được quá 50 ký tự",
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập mã mục tiêu đào tạo"
              />
            </FormItem>
          </Col>
          <Col lg={20} xs={24}>
            <FormItem
              label="Tên mục tiêu đào tạo"
              name={["formmuctieudaotao", "tenMucTieuDaoTao"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                  message: "Tên mục tiêu đào tạo không được quá 250 ký tự",
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập tên mục tiêu đào tạo"
              />
            </FormItem>
          </Col>
          <Col lg={20} xs={24}>
            <FormItem
              label="Nội dung"
              name={["formmuctieudaotao", "noiDung"]}
              rules={[
                {
                  required: true,
                  type: "string",
                },
              ]}
            >
              <TextArea
                rows={3}
                className="input-item"
                placeholder="Nhập nội dung mục tiêu đào tạo"
              />
            </FormItem>
          </Col>
          <FormSubmit goBack={handleCancel} disabled={fieldTouch} />
        </Form>
      </Card>
    </AntModal>
  );
}

export default ModalAddMucTieu;
