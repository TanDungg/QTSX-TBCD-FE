import {
  Modal as AntModal,
  Button,
  Row,
  Form,
  Input,
  Col,
  Checkbox,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;

function ModalHangMuc({ openModalFS, openModal }) {
  const dispatch = useDispatch();

  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
    }
  }, [openModal]);

  //   const getKe = (tits_qtsx_CauTrucKho_Id) => {
  //     const params = convertObjectToUrlParams({
  //       tits_qtsx_CauTrucKho_Id,
  //       thuTu: 2,
  //       isThanhPham: false,
  //     });
  //     new Promise((resolve, reject) => {
  //       dispatch(
  //         fetchStart(
  //           `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?${params}`,
  //           "GET",
  //           null,
  //           "DETAIL",
  //           "",
  //           resolve,
  //           reject
  //         )
  //       );
  //     })
  //       .then((res) => {
  //         if (res && res.data) {
  //           setListKe(res.data);
  //         } else {
  //           setListKe([]);
  //         }
  //       })
  //       .catch((error) => console.error(error));
  //   };
  //   const getTang = (tits_qtsx_CauTrucKho_Id) => {
  //     const params = convertObjectToUrlParams({
  //       tits_qtsx_CauTrucKho_Id,
  //       thuTu: 3,
  //       isThanhPham: false,
  //     });
  //     new Promise((resolve, reject) => {
  //       dispatch(
  //         fetchStart(
  //           `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?${params}`,
  //           "GET",
  //           null,
  //           "DETAIL",
  //           "",
  //           resolve,
  //           reject
  //         )
  //       );
  //     })
  //       .then((res) => {
  //         if (res && res.data.length > 0) {
  //           setListTang(res.data);
  //           setRequire(true);
  //         } else {
  //           setListTang([]);
  //           setRequire(false);
  //         }
  //       })
  //       .catch((error) => console.error(error));
  //   };
  //   const getNgan = (tits_qtsx_CauTrucKho_Id) => {
  //     const params = convertObjectToUrlParams({
  //       tits_qtsx_CauTrucKho_Id,
  //       thuTu: 4,
  //     });
  //     new Promise((resolve, reject) => {
  //       dispatch(
  //         fetchStart(
  //           `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?${params}`,
  //           "GET",
  //           null,
  //           "DETAIL",
  //           "",
  //           resolve,
  //           reject
  //         )
  //       );
  //     })
  //       .then((res) => {
  //         if (res && res.data) {
  //           setListNgan(res.data);
  //         } else {
  //           setListNgan([]);
  //         }
  //       })
  //       .catch((error) => console.error(error));
  //   };
  const saveData = (vattu) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoVatTu/vi-tri-luu-kho-vat-tu`,
          "PUT",
          [],
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          resetFields();

          openModalFS(false);
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
    // saveData(values.vatTu);
    console.log(values.hangMucKiemTra);
  };
  //   const handleSelectKe = (val) => {
  //     getTang(val);
  //     setListNgan([]);
  //     setFieldsValue({
  //       vatTu: {
  //         tits_qtsx_Tang_Id: null,
  //         tits_qtsx_Ngan_Id: null,
  //       },
  //     });
  //   };
  //   const handleSelectTang = (val) => {
  //     getNgan(val);
  //     setFieldsValue({
  //       vatTu: {
  //         tits_qtsx_Ngan_Id: null,
  //       },
  //     });
  //   };
  return (
    <AntModal
      title={"Danh sách hạng mục kiểm tra"}
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
          <FormItem label="Sản phẩm" name={["hangMucKiemTra", "sanPham"]}>
            <Input disabled={true}></Input>
          </FormItem>
          <FormItem label="Công đoạn" name={["hangMucKiemTra", "congDoan"]}>
            <Input disabled={true}></Input>
          </FormItem>
          <FormItem
            label=" Nhóm hạng mục kiểm tra"
            name={["hangMucKiemTra", "hangMucKiemTra"]}
          >
            <Checkbox value="A">A</Checkbox>
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

export default ModalHangMuc;
