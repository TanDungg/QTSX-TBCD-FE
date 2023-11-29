import { UploadOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Input,
  Row,
  Button,
  Upload,
  Card,
  Divider,
} from "antd";
import React, { useState } from "react";
import { BASE_URL_API, DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
const FormItem = Form.Item;

function ModalThemHinhAnh({ openModalFS, openModal, itemData, ThemHinhAnh }) {
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    const data = values.themhinhanh;
    console.log(values.themhinhanh);
    const formData = new FormData();
    data.list_SanPhamHinhAnhs.fileList.map((file) => {
      formData.append("lstFiles", file);
    });
    fetch(`${BASE_URL_API}/api/Upload/Multi/Image`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: "Bearer ".concat(INFO.token),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        // saveData(data, saveQuit);
      })
      .catch(() => {
        console.log("upload failed.");
      });
  };

  const saveData = (tc) => {
    ThemHinhAnh(tc.lyDoTuChoi);
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
        <Card className="th-card-margin-bottom">
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
              name={["themhinhanh", "list_SanPhamHinhAnhs"]}
              rules={[
                {
                  type: "file",
                  required: true,
                },
              ]}
            >
              <Upload
                action="http://10.14.7.215:1512/api/Upload/Multi"
                listType="picture"
                className="upload-list-inline"
                headers={{
                  Authorization: "Bearer ".concat(INFO.token),
                }}
              >
                <Button icon={<UploadOutlined />}>Tải hình ảnh sản phẩm</Button>
              </Upload>
            </FormItem>
            <Divider />
            <Row justify={"center"}>
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
                Thêm mới
              </Button>
            </Row>
          </Form>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalThemHinhAnh;
