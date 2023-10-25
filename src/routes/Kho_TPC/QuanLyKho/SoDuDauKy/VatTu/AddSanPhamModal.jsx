import { Modal as AntModal, Button, Row, Form, Input, Col } from "antd";
import { map, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import { DEFAULT_FORM_MODAL } from "src/constants/Config";
import { Select } from "src/components/Common";

const FormItem = Form.Item;

function AddSanPhamModal({ openModalFS, openModal, loading, addSanPham }) {
  const dispatch = useDispatch();
  const [listSanPham, setListSanPham] = useState([]);
  const [listMauSac, setListMauSac] = useState([]);

  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
      getSanPham();
    }
  }, [openModal]);
  const getSanPham = () => {
    const params = convertObjectToUrlParams({ page: -1 });
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
          const newData = res.data.map((dt) => {
            return {
              ...dt,
              name: dt.maSanPham + " - " + dt.tenSanPham,
            };
          });
          setListSanPham(newData);
        }
      })
      .catch((error) => console.error(error));
  };
  const getSanPhamMauSac = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`SanPham/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListMauSac(JSON.parse(res.data.mauSac));
        }
      })
      .catch((error) => console.error(error));
  };
  const handleSubmit = () => {
    validateFields()
      .then((values) => {
        listMauSac.forEach((ms) => {
          if (ms.mauSac_Id === values.vatTu.mauSac_Id) {
            values.vatTu.tenMauSac = ms.tenMauSac;
          }
        });
        listSanPham.forEach((sp) => {
          if (sp.id === values.vatTu.vatTu_Id) {
            values.vatTu.tenDonViTinh = sp.tenDonViTinh;
            values.vatTu.tenVatTu = sp.tenSanPham;
            values.vatTu.maVatTu = sp.maSanPham;
          }
        });
        addSanPham(values.vatTu);
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
      title="Thêm sản phẩm"
      open={openModal}
      width={`60%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Form
          {...DEFAULT_FORM_MODAL}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem
            label="Sản phẩm"
            name={["vatTu", "vatTu_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={listSanPham ? listSanPham : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={(val) => {
                getSanPhamMauSac(val);
              }}
            />
          </FormItem>
          <FormItem
            label="Màu sắc"
            name={["vatTu", "mauSac_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={listMauSac ? listMauSac : []}
              placeholder="Chọn màu sắc"
              optionsvalue={["mauSac_Id", "tenMauSac"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Số lượng"
            name={["vatTu", "soLuongNhap"]}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[1-9]\d*$/,
                message: "Số lượng phải là số và lớn hơn 0!",
              },
            ]}
          >
            <Input placeholder="Số lượng"></Input>
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
