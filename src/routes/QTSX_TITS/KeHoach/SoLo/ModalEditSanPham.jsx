import { Modal as AntModal, Form, Input, DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import { FormSubmit } from "src/components/Common";
import moment from "moment";
import dayjs from "dayjs";
const FormItem = Form.Item;

function ModalEditSanPham({
  openModalFS,
  openModal,
  refesh,
  info,
  editSanPham,
}) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListQuyTrinh, setListQuyTrinh] = useState([]);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
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
    const newData = chitiet;
    editSanPham(newData);
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
  const title = "Chỉnh sửa thông tin mã sản phẩm nội bộ";

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
            label="Mã sản phẩm nội bộ"
            name={["chitiet", "maNoiBo"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input placeholder="Mã nội bộ"></Input>
          </FormItem>
          <FormItem
            label="Quy trình"
            name={["chitiet", "tits_qtsx_QuyTrinhSanXuat_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListQuyTrinh}
              placeholder="Chọn quy trình"
              optionsvalue={["id", "maQuyTrinh"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormSubmit disabled={fieldTouch} />
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalEditSanPham;
