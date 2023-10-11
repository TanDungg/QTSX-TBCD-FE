import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import { FormSubmit } from "src/components/Common";
const FormItem = Form.Item;

function AddChiTiet({ openModalFS, openModal, refesh, sanPham, type }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [listDonViTinh, setListDonViTinh] = useState([]);
  const [listSanPham, setListSanPham] = useState([]);

  useEffect(() => {
    if (openModal) {
      console.log(sanPham);
      getDonViTInh();
      setListSanPham([sanPham]);
      type === "add"
        ? setFieldsValue({
            chitiet: {
              sanPham_Id: sanPham.sanPham_Id,
            },
          })
        : setFieldsValue({
            chitiet: {
              ...sanPham,
              sanPham_Id: sanPham.sanPham_Id,
              donViTinh_Id: sanPham.donViTinh_Id.toLowerCase(),
            },
          });
    }
  }, [openModal]);
  const getDonViTInh = () => {
    const params = convertObjectToUrlParams({ page: -1 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonViTinh?${params}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListDonViTinh(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  const saveData = (chitiet) => {
    if (type === "add") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`lkn_ChiTiet`, "POST", chitiet, "ADD", "", resolve, reject)
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
    } else if (type === "edit") {
      chitiet.id = sanPham.chiTiet_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_ChiTiet/${sanPham.chiTiet_Id}`,
            "PUT",
            chitiet,
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
  const title = type === "add" ? "Thêm chi tiết" : "Chỉnh sửa chi tiết";
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
            name={["chitiet", "sanPham_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={listSanPham}
              optionsvalue={["sanPham_Id", "maSanPham"]}
              style={{ width: "100%" }}
              disabled={true}
            />
          </FormItem>
          <FormItem
            label="Tên sản phẩm"
            name={["chitiet", "sanPham_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={listSanPham}
              optionsvalue={["sanPham_Id", "tenSanPham"]}
              style={{ width: "100%" }}
              disabled={true}
            />
          </FormItem>
          <FormItem
            label="Mã chi tiết"
            name={["chitiet", "maChiTiet"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input placeholder="Mã chi tiết"></Input>
          </FormItem>
          <FormItem
            label="Tên chi tiết"
            name={["chitiet", "tenChiTiet"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input placeholder="Tên chi tiết"></Input>
          </FormItem>
          <FormItem
            label="Đơn vị tính"
            name={["chitiet", "donViTinh_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={listDonViTinh}
              placeholder="Đơn vị tính"
              optionsvalue={["id", "tenDonViTinh"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Kích thước"
            name={["chitiet", "kichThuoc"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Input placeholder="Kích thước"></Input>
          </FormItem>
          <FormSubmit disabled={fieldTouch} />
        </Form>
      </div>
    </AntModal>
  );
}

export default AddChiTiet;
