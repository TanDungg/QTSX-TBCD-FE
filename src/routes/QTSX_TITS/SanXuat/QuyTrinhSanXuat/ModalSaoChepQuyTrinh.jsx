import { Modal as AntModal, Form, Row, Button, Card, Divider } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Select } from "src/components/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
const FormItem = Form.Item;

function ModalSaoChepQuyTrinh({ openModalFS, openModal, itemData, refesh }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;
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
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
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
    saveData(values.saochepquytrinh);
  };

  const saveData = (data) => {
    const newData = {
      ...data,
      tits_qtsx_QuyTrinhSanXuat_Id:
        itemData && itemData.tits_qtsx_QuyTrinhSanXuat_Id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhSanXuat/copy-quy-trinh`,
          "PUT",
          newData,
          "COPY",
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

  const handleCancel = () => {
    openModalFS(false);
    resetFields();
    refesh();
  };

  return (
    <AntModal
      title="Sao chép quy trình sản xuất"
      open={openModal}
      width={`50%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom">
          <h5
            style={{
              fontWeight: "bold",
              marginBottom: "30px",
            }}
          >
            SAO CHÉP QUY TRÌNH SẢN XUẤT CỦA{" "}
            {itemData && itemData.tenQuyTrinhSanXuat} CHO SẢN PHẨM:
          </h5>
          <Form
            {...DEFAULT_FORM_CUSTOM}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Sản phẩm"
              name={["saochepquytrinh", "tits_qtsx_SanPham_Id"]}
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
                placeholder="Chọn sản phẩm cần sao chép"
                optionsvalue={["id", "tenSanPham"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
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

export default ModalSaoChepQuyTrinh;
