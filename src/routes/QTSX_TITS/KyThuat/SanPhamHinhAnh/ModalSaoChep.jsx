import { Modal as AntModal, Form, Row, Button, Card, Divider } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Select } from "src/components/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
const FormItem = Form.Item;

function ModalSaoChep({ openModalFS, openModal, itemData, refesh }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { setFieldsValue, resetFields } = form;
  const [ListSanPhamGoc, setListSanPhamGoc] = useState([]);
  const [ListSanPhamCopy, setListSanPhamCopy] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListSanPham();
    }
  }, []);

  const getListSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_SanPham?page=-1",
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
          setListSanPhamGoc(res.data);
        } else {
          setListSanPhamGoc([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    const data = values.themhinhanh;
    saveData(data);
  };

  const saveData = (data) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPhamHinhAnh/san-pham-hinh-anh-copy`,
          "POST",
          data,
          "ADD",
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
  };

  const handleSelectSanPham = (value) => {
    setFieldsValue({
      themhinhanh: {
        tits_qtsx_SanPham_Id: null,
      },
    });
    const newData = ListSanPhamGoc.filter((d) => d.id !== value);
    setListSanPhamCopy(newData);
  };

  const handleCancel = () => {
    openModalFS(false);
    resetFields();
    refesh();
  };

  return (
    <AntModal
      title="Sao chép hình ảnh"
      open={openModal}
      width={`50%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom">
          <Form
            {...DEFAULT_FORM_CUSTOM}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Sản phẩm gốc"
              name={["themhinhanh", "tits_qtsx_SanPham_Copy_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListSanPhamGoc ? ListSanPhamGoc : []}
                placeholder="Chọn sản phẩm"
                optionsvalue={["id", "tenSanPham"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
                onSelect={handleSelectSanPham}
              />
            </FormItem>
            <FormItem
              label="Sản phẩm sao chép"
              name={["themhinhanh", "tits_qtsx_SanPham_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListSanPhamCopy ? ListSanPhamCopy : []}
                placeholder="Chọn sản phẩm"
                optionsvalue={["id", "tenSanPham"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <Divider />
            <Row justify={"center"}>
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
                Sao chép
              </Button>
            </Row>
          </Form>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalSaoChep;
