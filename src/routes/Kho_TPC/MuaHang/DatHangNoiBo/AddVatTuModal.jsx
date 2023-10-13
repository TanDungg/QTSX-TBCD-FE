import { Modal as AntModal, Button, Row, Form, Input, Col } from "antd";
import { map, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";

const FormItem = Form.Item;

function AddVatTuModal({ openModalFS, openModal, loading, addVatTu }) {
  const dispatch = useDispatch();
  const [listVatTu, setListVatTu] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
      getVatTu();
    }
  }, [openModal]);
  const getVatTu = () => {
    const params = convertObjectToUrlParams({ page: -1 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `VatTu?${params}`,
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
          setListVatTu(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleSubmit = () => {
    validateFields()
      .then((values) => {
        listVatTu.forEach((vt) => {
          if (vt.id === values.vatTu.vatTu_Id) {
            values.vatTu.tenNhomVatTu = vt.tenNhomVatTu;
            values.vatTu.tenDonViTinh = vt.tenDonViTinh;
            values.vatTu.tenVatTu = vt.tenVatTu;
          }
        });
        addVatTu(values.vatTu);
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
      title="Thêm vật tư"
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
            label="Vật tư"
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
              data={listVatTu ? listVatTu : []}
              placeholder="Chọn vật tư"
              optionsvalue={["id", "tenVatTu"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Nhóm vật tư"
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
              data={listVatTu ? listVatTu : []}
              placeholder="Nhóm vật tư"
              optionsvalue={["id", "tenNhomVatTu"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              disabled={true}
            />
          </FormItem>
          <FormItem
            label="Đơn vị tính"
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
              data={listVatTu ? listVatTu : []}
              placeholder="Đơn vị tính"
              optionsvalue={["id", "tenDonViTinh"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              disabled={true}
            />
          </FormItem>
          <FormItem
            label="Số lượng"
            name={["vatTu", "soLuong"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                pattern: /^[1-9]\d*$/,
                message: "Số lượng không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Số lượng" type="number"></Input>
          </FormItem>
          <FormItem
            label="Hạng mục sử dụng"
            name={["vatTu", "hangMucSuDung"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Input placeholder="Hạng mục sử dụng"></Input>
          </FormItem>

          <FormItem
            label="Ghi chú"
            name={["vatTu", "ghiChu"]}
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

export default AddVatTuModal;
