import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { convertObjectToUrlParams } from "src/util/Common";
const FormItem = Form.Item;

function ModalThemKe({ openModalFS, openModal, addKe, listSanPham }) {
  const [fieldTouch, setFieldTouch] = useState(false);
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const { validateFields, resetFields } = form;

  const [ListSanPham, setListSanPham] = useState([]);

  useEffect(() => {
    if (openModal) {
      getSanPham();
    }
  }, [openModal]);
  const getSanPham = () => {
    const params = convertObjectToUrlParams({
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `SanPham?${params}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          if (listSanPham.length === 0) {
            setListSanPham(
              res.data.map((sp) => {
                return {
                  ...sp,
                  name: sp.maSanPham + " - " + sp.tenSanPham,
                };
              })
            );
          } else {
            const newData = [];
            res.data.forEach((sp) => {
              let check = true;
              listSanPham.forEach((lsp) => {
                if (sp.id.toLowerCase() === lsp.sanPham_Id.toLowerCase()) {
                  check = false;
                }
              });
              if (check) {
                newData.push({
                  ...sp,
                  name: sp.maSanPham + " - " + sp.tenSanPham,
                });
              }
            });
            setListSanPham(newData);
          }
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleSubmit = () => {
    validateFields()
      .then((values) => {
        const newData = values.addKe;
        ListSanPham.forEach((k) => {
          if (k.id === newData.sanPham_Id) {
            newData.tenSanPham = k.tenSanPham;
            newData.maSanPham = k.maSanPham;
            newData.tenDonViTinh = k.tenDonViTinh;
          }
        });
        addKe(newData);
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
      title="Chọn sản phẩm"
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
            label="Sản phẩm"
            name={["addKe", "sanPham_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Số lượng"
            name={["addKe", "soLuong"]}
            rules={[
              {
                required: true,
                message: "Số lượng bắt buộc nhập",
              },
              {
                pattern: /^[1-9]\d*$/,
                message: "Số lượng không hợp lệ!",
              },
            ]}
          >
            <Input type="number" placeholder="Nhập số lượng"></Input>
          </FormItem>
        </Form>
        <Row justify={"center"}>
          <Button
            className="th-margin-bottom-0"
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

export default ModalThemKe;
