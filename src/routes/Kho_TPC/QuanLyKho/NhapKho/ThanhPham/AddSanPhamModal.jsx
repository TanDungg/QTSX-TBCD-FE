import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";

const FormItem = Form.Item;

function AddSanPhamModal({ openModalFS, openModal, loading, addSanPham }) {
  const dispatch = useDispatch();
  const [ListMauSac, setListMauSac] = useState([]);
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);

  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields } = form;

  useEffect(() => {
    if (openModal) {
      getLoaiSanPham();
    }
  }, [openModal]);
  const getLoaiSanPham = () => {
    const params = convertObjectToUrlParams({ page: -1 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `LoaiSanPham?${params}`,
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
          setListLoaiSanPham(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  const getSanPham = (id) => {
    const params = convertObjectToUrlParams({ loaiSanPham_Id: id, page: -1 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `SanPham?${params}`,
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
          setListSanPham(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  const handleSubmit = () => {
    validateFields()
      .then((values) => {
        const newData = values.sanpham;
        ListSanPham.forEach((lsp) => {
          if (lsp.id === newData.sanPham_Id) {
            newData.tenLoaiSanPham = lsp.tenLoaiSanPham;
            newData.tenSanPham = lsp.tenSanPham;
            newData.maSanPham = lsp.maSanPham;
            newData.tenDonViTinh = lsp.tenDonViTinh;
            if (newData.mauSac_Id) {
              JSON.parse(lsp.mauSac).forEach((ms) => {
                if (ms.mauSac_Id === newData.mauSac_Id) {
                  newData.tenMauSac = ms.tenMauSac;
                }
              });
            }
          }
        });

        addSanPham(newData);
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
  const handleSelectLoaiSanPham = (val) => {
    getSanPham(val);
  };
  const handleSelectSanPham = (val) => {
    ListSanPham.forEach((sp) => {
      if (sp.id === val) {
        setListMauSac(JSON.parse(sp.mauSac));
      }
    });
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
      title="Chọn sản phẩm nhập kho"
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
            name={["sanpham", "loaiSanPham_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLoaiSanPham ? ListLoaiSanPham : []}
              placeholder="Chọn loại sản phẩm"
              optionsvalue={["id", "tenLoaiSanPham"]}
              onSelect={handleSelectLoaiSanPham}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Sản phẩm"
            name={["sanpham", "sanPham_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham ? ListSanPham : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "tenSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleSelectSanPham}
            />
          </FormItem>
          <FormItem
            label="Đơn vị tính"
            name={["sanpham", "sanPham_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham ? ListSanPham : []}
              placeholder="Đơn vị tính"
              optionsvalue={["id", "tenDonViTinh"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              disabled={true}
            />
          </FormItem>
          <FormItem
            label="Màu sắc"
            name={["sanpham", "mauSac_Id"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListMauSac ? ListMauSac : []}
              placeholder="Chọn màu sắc"
              optionsvalue={["mauSac_Id", "tenMauSac"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Số lượng"
            name={["sanpham", "soLuongNhap"]}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[1-9]\d*$/,
                message: "Số lượng không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Số lượng"></Input>
          </FormItem>

          <FormItem
            label="Ghi chú"
            name={["sanpham", "ghiChu"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Input placeholder="Ghi chú"></Input>
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

export default AddSanPhamModal;
