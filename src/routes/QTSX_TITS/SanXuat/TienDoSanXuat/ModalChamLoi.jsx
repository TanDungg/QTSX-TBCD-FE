import {
  Modal as AntModal,
  Button,
  Row,
  Form,
  Input,
  Col,
  Checkbox,
  Mentions,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, getTokenInfo } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
const FormItem = Form.Item;

function ModalChamLoi({ openModalFS, openModal, ViTri, ThemLoi, ListNoiDung }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [ListLoi, setListLoi] = useState([]);

  useEffect(() => {
    if (openModal) {
      getLoi();
      setFieldsValue({
        chiTietLoi: { nguoiThucHien: getTokenInfo().fullName },
      });
    }
  }, [openModal]);
  const getLoi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Loi?page=-1`,
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
          setListLoi(res.data);
        } else {
          setListLoi([]);
        }
      })
      .catch((error) => console.error(error));
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
    ThemLoi({
      tits_qtsx_Loi_Id: values.chiTietLoi.tits_qtsx_Loi_Id,
      moTa: values.chiTietLoi.moTa,
      viTri: JSON.stringify({ x: ViTri.x, y: ViTri.y }),
      isBoQua: values.chiTietLoi.isBoQua,
      tits_qtsx_SanPhamHinhAnh_Id: ViTri.tits_qtsx_SanPhamHinhAnh_Id,
      tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id:
        values.chiTietLoi.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id,
    });
    openModalFS(false);
  };

  return (
    <AntModal
      title={"Thông tin chi tiết lỗi"}
      open={openModal}
      width={`70%`}
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
            label="Mô tả lỗi"
            name={["chiTietLoi", "moTa"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Mentions rows={3} placeholder="Nhập mô tả lỗi" />
          </FormItem>
          <FormItem
            label="Người thực hiện"
            name={["chiTietLoi", "nguoiThucHien"]}
          >
            <Input disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Lỗi"
            name={["chiTietLoi", "tits_qtsx_Loi_Id"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLoi ? ListLoi : []}
              placeholder="Chọn lỗi"
              optionsvalue={["id", "tenLoi"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Nội dung lỗi"
            name={["chiTietLoi", "tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListNoiDung ? ListNoiDung : []}
              placeholder="Chọn nội dung lỗi"
              optionsvalue={[
                "tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id",
                "noiDungKiemTra",
              ]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Bỏ qua lỗi"
            name={["chiTietLoi", "isBoQua"]}
            valuePropName="checked"
          >
            <Checkbox />
          </FormItem>

          <Row justify={"center"}>
            <Button
              className="th-btn-margin-bottom-0"
              style={{ marginTop: 10, marginRight: 15 }}
              type="primary"
              htmlType="submit"
              disabled={!fieldTouch}
            >
              Lưu
            </Button>
          </Row>
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalChamLoi;
