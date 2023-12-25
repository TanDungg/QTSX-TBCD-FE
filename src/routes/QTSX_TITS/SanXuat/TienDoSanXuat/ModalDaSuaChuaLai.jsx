import {
  Modal as AntModal,
  Button,
  Row,
  Form,
  Input,
  Col,
  Checkbox,
  Mentions,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, getTokenInfo } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
const FormItem = Form.Item;

function ModalDaSuaChuaLai({ openModalFS, openModal, ViTri, SuaChuaLai }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [ListLoi, setListLoi] = useState([]);

  useEffect(() => {
    if (openModal) {
      resetFields();
      setFieldsValue({
        chiTietLoi: { nguoiThucHien: getTokenInfo().fullName, ...ViTri.viTri },
      });
    }
  }, [openModal]);

  const handleCancel = () => {
    openModalFS(false);
  };
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    SuaChuaLai({
      ...ViTri,
      ...values.chiTietLoi,
    });
    openModalFS(false);
  };

  return (
    <AntModal
      title={"Sữa chữa lại"}
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
            label="Người thực hiện"
            name={["chiTietLoi", "nguoiThucHien"]}
          >
            <Input disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Mã lỗi"
            name={["chiTietLoi", "maLoi"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Nhóm lỗi"
            name={["chiTietLoi", "tenNhomLoi"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Mô tả lỗi"
            name={["chiTietLoi", "moTa"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input disabled={true}></Input>
          </FormItem>
          <FormItem label="Ghi chú SCL" name={["chiTietLoi", "moTaSCL"]}>
            <Input placeholder="Ghi chú sữa chữa lại"></Input>
          </FormItem>
          <Row justify={"center"}>
            <Button
              className="th-btn-margin-bottom-0"
              style={{ marginTop: 10, marginRight: 15 }}
              type="primary"
              htmlType="submit"
              disabled={!fieldTouch}
            >
              Lưu
            </Button>
          </Row>
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalDaSuaChuaLai;
