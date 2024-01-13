import { Modal as AntModal, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { FormSubmit } from "src/components/Common";
const FormItem = Form.Item;

function ModalEditSanPham({
  openModalFS,
  openModal,
  refesh,
  info,
  editSanPham,
  type,
}) {
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  useEffect(() => {
    if (openModal) {
      setFieldsValue({
        chitiet: {
          ...info,
        },
      });
    }
  }, [openModal]);

  const saveData = (chitiet) => {
    const newData = { ...info, ...chitiet };
    editSanPham(newData, type);
    resetFields();
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
    saveData(values.chitiet);
  };
  const title = "Chỉnh sửa thông tin số VIN";

  return (
    <AntModal
      title={title}
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
            label="Mã sản phẩm"
            name={["chitiet", "maSanPham"]}
            rules={[{ required: true }]}
          >
            <Input placeholder="Mã sản phẩm" disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Tên sản phẩm"
            name={["chitiet", "tenSanPham"]}
            rules={[{ required: true }]}
          >
            <Input placeholder="Tên sản phẩm" disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Loại sản phẩm"
            name={["chitiet", "tenLoaiSanPham"]}
            rules={[{ required: true }]}
          >
            <Input placeholder="Loại sản phẩm" disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Màu sắc"
            name={["chitiet", "tenMauSac"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input placeholder="Màu sắc" disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Mã số VIN"
            name={["chitiet", "maSoVin"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input placeholder="Mã số VIN"></Input>
          </FormItem>
          <FormSubmit disabled={fieldTouch} />
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalEditSanPham;
