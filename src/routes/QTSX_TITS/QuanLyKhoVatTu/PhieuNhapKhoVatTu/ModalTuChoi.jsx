import { Modal as AntModal, Form, Input, Row, Button } from "antd";
import React, { useState } from "react";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
const FormItem = Form.Item;

function ModalTuChoi({ openModalFS, openModal, saveTuChoi }) {
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.tuChoi);
  };

  const saveData = (tc) => {
    saveTuChoi(tc.lyDoDuyetTuChoi);
    openModalFS(false);
    resetFields();
  };
  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="Từ chối phiếu phiếu định mức vật tư"
      open={openModal}
      width={`50%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem
            label="Lý do"
            name={["tuChoi", "lyDoDuyetTuChoi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input className="input-item" placeholder="Lý do từ chối" />
          </FormItem>
          <Row justify={"center"}>
            <Button
              className="th-margin-bottom-0"
              type="danger"
              htmlType={"submit"}
              disabled={!fieldTouch}
            >
              Từ chối
            </Button>
          </Row>
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalTuChoi;
