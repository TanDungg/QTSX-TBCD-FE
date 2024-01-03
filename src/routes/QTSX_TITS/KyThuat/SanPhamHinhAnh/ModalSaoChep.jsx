import { Modal as AntModal, Form, Row, Button, Card, Divider } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { Select } from "src/components/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
const FormItem = Form.Item;

function ModalSaoChep({ openModalFS, openModal, itemData, refesh }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [SanPhamGoc, setSanPhamGoc] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListSanPham();
    }
  }, [openModal]);

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
          const newData = res.data.filter(
            (dt) => dt.id.toLowerCase() === itemData.toLowerCase()
          );
          setSanPhamGoc(newData[0].tenSanPham);

          const newListSanPham = res.data.filter(
            (dt) => dt.id.toLowerCase() !== itemData.toLowerCase()
          );
          setListSanPham(newListSanPham);
        } else {
          setSanPhamGoc(null);
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onFinish = (values) => {
    const data = {
      ...values.saochephinhanh,
      tits_qtsx_SanPham_Copy_Id: itemData,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPhamHinhAnh/san-pham-hinh-anh-copy`,
          "POST",
          data,
          "SAOCHEP",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          openModalFS(false);
          setSanPhamGoc(null);
          setListSanPham([]);
          resetFields();
          refesh();
        }
      })
      .catch((error) => console.error(error));
  };

  const handleCancel = () => {
    openModalFS(false);
    setSanPhamGoc(null);
    setListSanPham([]);
    resetFields();
    refesh();
  };

  return (
    <AntModal
      title={`Sao chép hình ảnh của sản phẩm ${SanPhamGoc}`}
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
              label="Sản phẩm sao chép"
              name={["saochephinhanh", "tits_qtsx_SanPham_Id"]}
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
