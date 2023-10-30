import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
const FormItem = Form.Item;

function ModalThemKe({ openModalFS, openModal, ListKe, addKe }) {
  const [fieldTouch, setFieldTouch] = useState(false);
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [listLot, setListLot] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);

  useEffect(() => {
    if (openModal) {
    }
  }, [openModal]);
  const getSanPham = (ke_id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho/list-thanh-pham-in-ke-kho?ke_Id=${ke_id}`,
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
          res.data[0].soLuongXuat = res.data[0].soLuong;
          setListSanPham(res.data);
          setFieldsValue({
            addKe: {
              tenSanPham: res.data[0].tenSanPham,
              lot_Id: null,
            },
          });
          getLot(res.data[0].sanPham_Id);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getLot = (sanPham_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Lot/getlist-lot-by-san-pham?sanPham_Id=${sanPham_Id}`,
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
          setListLot(res.data);
        } else {
          setListLot([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const handleSubmit = () => {
    validateFields()
      .then((values) => {
        listLot.forEach((l) => {
          if (l.id === values.addKe.lot_Id) {
            ListSanPham[0].lot_Id = l.id;
            ListSanPham[0].soLot = l.soLot;
          }
        });
        addKe(ListSanPham);
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
  const handleSelectKe = (val) => {
    getSanPham(val);
  };
  return (
    <AntModal
      title="Chọn Kệ"
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
            label="Kệ"
            name={["addKe", "ke_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKe}
              placeholder="Chọn Kệ"
              optionsvalue={["ke_Id", "tenKe"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleSelectKe}
            />
          </FormItem>
          <FormItem
            label="Sản phẩm"
            name={["addKe", "tenSanPham"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input disabled={true} placeholder="Sản phẩm" />
          </FormItem>
          <FormItem
            label="Lot"
            name={["addKe", "lot_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={listLot}
              placeholder="Chọn Lot"
              optionsvalue={["id", "soLot"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
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

export default ModalThemKe;
