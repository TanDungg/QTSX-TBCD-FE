import { Modal as AntModal, Button, Row, Form } from "antd";
import React, { useEffect, useState } from "react";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";

const FormItem = Form.Item;

function ModalThemKe({ openModalFS, openModal, ListKe, addKe }) {
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
    }
  }, [openModal]);

  const handleSubmit = () => {
    validateFields()
      .then((values) => {
        addKe(values.addKe.ke_Id);
        openModalFS(false);
        resetFields();
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const handleCancel = () => {
    openModalFS(false);
  };
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    // saveData(values.bophan);
  };
  return (
    <AntModal
      title="Chọn Kệ"
      open={openModal}
      width={`80%`}
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
            label="Kệ"
            name={["addKe", "ke_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKe}
              placeholder="Chọn Kệ"
              optionsvalue={["ke_Id", "tenKe"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
        </Form>
        <Row justify={"center"}>
          <Button
            className="th-btn-margin-bottom-0"
            style={{ marginTop: 10, marginRight: 15 }}
            type="primary"
            onClick={handleSubmit}
            disabled={!fieldTouch}
          >
            Thêm
          </Button>
        </Row>
      </div>
    </AntModal>
  );
}

export default ModalThemKe;
