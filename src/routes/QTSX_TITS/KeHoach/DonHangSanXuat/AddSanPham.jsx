import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import { FormSubmit } from "src/components/Common";
const FormItem = Form.Item;

function AddSanPham({ openModalFS, openModal, refesh, info, type }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  useEffect(() => {
    if (openModal) {
      if (type === "congDoanNew") {
        setFieldsValue({
          chitiet: {
            ...info,
          },
        });
      }
    }
  }, [openModal]);

  const saveData = (chitiet) => {
    if (type === "congDoanNew" || type === "xuongNew" || type === "chuyenNew") {
      const url =
        type === "congDoanNew"
          ? "tits_qtsx_Xuong"
          : type === "xuongNew"
          ? "tits_qtsx_Chuyen"
          : type === "chuyenNew" && "tits_qtsx_Tram";
      const newData = type === "congDoanNew";

      new Promise((resolve, reject) => {
        dispatch(fetchStart(url, "POST", newData, "ADD", "", resolve, reject));
      })
        .then((res) => {
          if (res && res.status !== 409) {
            openModalFS(false);
            resetFields();
            refesh();
          }
        })
        .catch((error) => console.error(error));
    } else if (
      type === "xuongEdit" ||
      type === "chuyenEdit" ||
      type === "tramEdit"
    ) {
      const url =
        type === "xuongEdit"
          ? "tits_qtsx_Xuong"
          : type === "chuyenEdit"
          ? "tits_qtsx_Chuyen"
          : type === "tramEdit" && "tits_qtsx_Tram";
      const newData =
        type === "xuongEdit"
          ? {
              ...chitiet,
              id: info.id,
              tits_qtsx_CongDoan_Id: info.tits_qtsx_CongDoan_Id,
            }
          : type === "chuyenEdit"
          ? {
              ...chitiet,
              id: info.id,
              tits_qtsx_Xuong_Id: info.tits_qtsx_Xuong_Id,
              tits_qtsx_CongDoan_Id: info.tits_qtsx_CongDoan_Id,
            }
          : type === "tramEdit" && {
              ...chitiet,
              id: info.id,
              tits_qtsx_Chuyen_Id: info.tits_qtsx_Chuyen_Id,
              tits_qtsx_Xuong_Id: info.tits_qtsx_Xuong_Id,
              tits_qtsx_CongDoan_Id: info.tits_qtsx_CongDoan_Id,
            };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `${url}/${info.id}`,
            "PUT",
            newData,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status !== 409) {
            openModalFS(false);
            resetFields();
            refesh();
          }
        })
        .catch((error) => console.error(error));
    }
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
  const title =
    type === "congDoanNew"
      ? "Thêm xưởng"
      : type === "xuongEdit"
      ? "Chỉnh sửa xưởng"
      : type === "xuongNew"
      ? "Thêm chuyền"
      : type === "chuyenEdit"
      ? "Chỉnh sửa chuyền"
      : type === "chuyenNew"
      ? "Thêm trạm"
      : type === "tramEdit" && "Chỉnh sửa trạm";

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
            label="Loại sản phẩm"
            name={["chitiet", "loaiSanPham_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={[]}
              placeholder="Chọn loại sản phẩm"
              optionsvalue={["id", "tenLoaiSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Sản phẩm"
            name={["chitiet", "sanPham_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={[]}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "tenSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Lốp"
            name={["chitiet", "lop"]}
            rules={[{ type: "string", required: true }]}
          >
            <Input placeholder="Lốp"></Input>
          </FormItem>
          <FormItem
            label="Màu sắc"
            name={["chitiet", "mauSac_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={[]}
              placeholder="Chọn màu sắc"
              optionsvalue={["id", "tenMauSac"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Đơn vị tính"
            name={["chitiet", "donViTinh_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={[]}
              placeholder="Chọn Đơn vị tính"
              optionsvalue={["id", "tenDoiViTinh"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              disabled={true}
            />
          </FormItem>

          <FormItem
            label="Số lượng"
            name={["chitiet", "soLuong"]}
            rules={[
              { required: true },
              {
                pattern: /^[1-9]\d*$/,
                message: "Số lượng không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Số lượng"></Input>
          </FormItem>
          <FormItem
            label="Đơn giá"
            name={["chitiet", "donGia"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input placeholder="Đơn giá"></Input>
          </FormItem>
          <FormItem
            label="Vận chuyển"
            name={["chitiet", "vanChuyen"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input placeholder="Vận chuyển"></Input>
          </FormItem>
          <FormItem
            label="Ghi chú"
            name={["chitiet", "moTa"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Input placeholder="Ghi chú"></Input>
          </FormItem>
          <FormSubmit disabled={fieldTouch} />
        </Form>
      </div>
    </AntModal>
  );
}

export default AddSanPham;
