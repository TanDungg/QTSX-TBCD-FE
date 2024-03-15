import { CloseCircleOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Input,
  Button,
  Card,
  Col,
  Divider,
} from "antd";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { DEFAULT_FORM_ADD_130PX } from "src/constants/Config";
const FormItem = Form.Item;

function ModalTuChoi({ openModalFS, openModal, handleTuChoi, lophoc }) {
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;

  const onFinish = (values) => {
    saveData(values.tuchoi);
  };

  const saveData = (tc) => {
    handleTuChoi(tc.lyDoTuChoi);
    openModalFS(false);
    resetFields();
  };
  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title={`HỦY DUYỆT LỚP HỌC ${lophoc && lophoc.maLopHoc}`}
      open={openModal}
      width={width >= 1200 ? "50%" : "100%"}
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
          {...DEFAULT_FORM_ADD_130PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col x lg={16} xs={24}>
            <FormItem
              label="Lý do từ chối"
              name={["tuchoi", "lyDoTuChoi"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input className="input-item" placeholder="Lý do từ chối" />
            </FormItem>
          </Col>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Divider />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <Button
                icon={<CloseCircleOutlined />}
                className="th-margin-bottom-0 btn-margin-bottom-0"
                type="danger"
                htmlType={"submit"}
                disabled={!fieldTouch}
              >
                Hủy duyệt
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </AntModal>
  );
}

export default ModalTuChoi;
