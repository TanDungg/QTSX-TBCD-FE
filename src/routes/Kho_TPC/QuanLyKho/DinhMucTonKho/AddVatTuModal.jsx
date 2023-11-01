import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";

const FormItem = Form.Item;

function AddVatTuModal({ openModalFS, openModal, loading, addVatTu }) {
  const dispatch = useDispatch();
  const [listVatTu, setListVatTu] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields } = form;

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
        } else {
          setListVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleSubmit = () => {
    validateFields()
      .then((values) => {
        const newData = values.addVatTu;
        listVatTu.forEach((vt) => {
          if (vt.id === newData.vatTu_Id) {
            newData.tenVatTu = vt.tenVatTu;
            newData.maVatTu = vt.maVatTu;
            newData.tenDonViTinh = vt.tenDonViTinh;
          }
        });
        addVatTu(newData);
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
            name={["addVatTu", "vatTu_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={listVatTu}
              placeholder="Chọn vật tư"
              optionsvalue={["id", "tenVatTu"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>

          <FormItem
            label="SL tồn kho tối thiểu"
            name={["addVatTu", "slTonKhoToiThieu"]}
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
            <Input
              className="input-item"
              placeholder="Nhập số lượng tồn kho tối thiểu"
              type="number"
            />
          </FormItem>

          <FormItem
            label="SL tồn kho tối đa"
            name={["addVatTu", "slTonKhoToiDa"]}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[1-9]\d*$/,
                message: "Số lượng không hợp lệ!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    !value ||
                    getFieldValue(["addVatTu", "slTonKhoToiThieu"]) < value
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "SL tồn kho tối đa phải lớn hơn SL tồn kho tối thiểu!"
                    )
                  );
                },
              }),
            ]}
          >
            <Input
              className="input-item"
              placeholder="Nhập số lượng tồn kho tối đa"
              type="number"
            />
          </FormItem>

          <FormItem
            label="Ghi chú"
            name={["addVatTu", "ghiChu"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Input className="input-item" placeholder="Nhập ghi chú" />
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
