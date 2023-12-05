import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";

const FormItem = Form.Item;

function ModalAddVatTu({ openModalFS, openModal, addChiTiet, ListChiTiet }) {
  const dispatch = useDispatch();
  const [listVatTu, setListVatTu] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
      getChiTiet();
      resetFields();
    }
  }, [openModal]);

  const getChiTiet = () => {
    const params = convertObjectToUrlParams({
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ChiTiet?${params}`,
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
          const newData = [];
          if (ListChiTiet) {
            res.data.forEach((ct) => {
              let check = false;
              ListChiTiet.forEach((lct) => {
                if (
                  ct.id.toLowerCase() ===
                  lct.tits_qtsx_VatTuChiTiet_Id.toLowerCase()
                ) {
                  check = true;
                }
              });
              if (!check) {
                newData.push({
                  ...ct,
                  name: ct.maChiTiet + " - " + ct.tenChiTiet,
                });
              }
            });
            setListVatTu(newData);
          } else {
            setListVatTu(
              res.data.map((ct) => {
                return {
                  ...ct,
                  name: ct.maChiTiet + " - " + ct.tenChiTiet,
                };
              })
            );
          }
        } else {
          setListVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };
  function isJsonObject(str) {
    try {
      const obj = JSON.parse(str);
      return typeof obj === "object" && obj !== null;
    } catch (e) {
      return false;
    }
  }
  const saveData = (vattu) => {
    const newData = {};
    newData.yeuCauGiao = vattu.yeuCauGiao;
    listVatTu.forEach((ct) => {
      if (ct.id === vattu.tits_qtsx_VatTuChiTiet_Id) {
        newData.tits_qtsx_VatTuChiTiet_Id = ct.id;
        newData.maVatTu = ct.maChiTiet;
        newData.tenVatTu = ct.tenChiTiet;
        newData.tenDonViTinh = ct.tenDonViTinh;
        newData.vatLieu = ct.vatLieu ? ct.vatLieu : "";
        if (isJsonObject(ct.thongSoKyThuat)) {
          const thongSo = JSON.parse(ct.thongSoKyThuat);
          newData.dai = thongSo.dai || thongSo.dai === 0 ? thongSo.dai : "";
          newData.rong = thongSo.rong || thongSo.rong === 0 ? thongSo.rong : "";
          newData.day = thongSo.day || thongSo.day === 0 ? thongSo.day : "";
          newData.dn = thongSo.dn || thongSo.dn === 0 ? thongSo.dn : "";
          newData.dt = thongSo.dt || thongSo.dt === 0 ? thongSo.dt : "";
          newData.chung =
            thongSo.chung || thongSo.chung === 0 ? thongSo.chung : "";
        }
      }
    });
    addChiTiet(newData);
    openModalFS(false);
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
    saveData(values.vatTu);
  };

  return (
    <AntModal
      title={"Thêm chi tiết"}
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
            label="Chi tiết"
            name={["vatTu", "tits_qtsx_VatTuChiTiet_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              placeholder="Chọn chi tiết"
              data={listVatTu}
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
            />
          </FormItem>
          <FormItem
            label="Yêu cầu giao"
            name={["vatTu", "yeuCauGiao"]}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[1-9]\d*$/,
                message: "Yêu cầu giao không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Yêu cầu giao" type="number"></Input>
          </FormItem>
          <Row justify={"center"}>
            <Button
              className="th-btn-margin-bottom-0"
              style={{ marginTop: 10, marginRight: 15 }}
              type="primary"
              htmlType="submit"
              disabled={!fieldTouch}
            >
              Thêm
            </Button>
          </Row>
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalAddVatTu;
