import { UploadOutlined } from "@ant-design/icons";
import { Modal as AntModal, Form, Input, Row, Button, Upload } from "antd";
import React, { useState } from "react";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
const FormItem = Form.Item;

function ModalThemHinhAnh({ openModalFS, openModal, saveTuChoi }) {
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.themhinhanh);
  };

  const saveData = (tc) => {
    saveTuChoi(tc.lyDoTuChoi);
    openModalFS(false);
    resetFields();
  };
  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="Thêm mới hình ảnh sản phẩm"
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
            label="Tên khu vực"
            name={["themhinhanh", "tenKhuVuc"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input className="input-item" placeholder="Tên khu vực" />
          </FormItem>
          <FormItem
            label="Mô tả"
            name={["themhinhanh", "moTa"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input className="input-item" placeholder="Mô tả" />
          </FormItem>
          <FormItem
            label="Hình ảnh"
            name={["themhinhanh", "lyDoTuChoi"]}
            rules={[
              {
                type: "file",
                required: true,
              },
            ]}
          >
            <Upload
              action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
              listType="picture"
              // defaultFileList={[...fileList]}
              className="upload-list-inline"
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </FormItem>
          <Row justify={"center"}>
            <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
              Thêm mới
            </Button>
          </Row>
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalThemHinhAnh;
