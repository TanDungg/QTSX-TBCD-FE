import { Modal as AntModal, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import { FormSubmit } from "src/components/Common";
import {
  convertObjectToUrlParams,
  xoaPhanTuTrungTheoId,
} from "src/util/Common";
const FormItem = Form.Item;

function ModalAddVatTu({ openModalFS, openModal, addSanPham, listVT }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListSoCont, setListSoCont] = useState([]);
  const [ListSoVIN, setListSoVIN] = useState([]);

  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
      getCont();
    }
  }, [openModal]);

  const getCont = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BienBanBanGiao/get-list-so-cont-chua-ban-giao`,
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
          listVT.forEach((vt) => {
            const phanTuB = res.data.find(
              (item) =>
                item.tits_qtsx_SoContainer_Id === vt.tits_qtsx_SoContainer_Id
            );
            if (phanTuB) {
              const index = res.data.indexOf(phanTuB);
              res.data.splice(index, 1);
            }
          });

          setListSoCont(res.data);
        } else {
          setListSoCont([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const saveData = (chitiet) => {
    ListSoCont.forEach((vt) => {
      if (vt.tits_qtsx_SoContainer_Id === chitiet.tits_qtsx_SoContainer_Id) {
        chitiet.list_ChiTiets = vt.list_chitiets;
        chitiet.tenDonHang = vt.tenDonHang;
        chitiet.tenDonViTinh = vt.tenDonHang;
        chitiet.soContainer = vt.soContainer;
      }
    });
    addSanPham(chitiet);
    resetFields();
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
    saveData(values.chitiet);
  };

  const title = "Thông tin bàn giao";

  return (
    <AntModal
      title={title}
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
            label="Số Booking:"
            name={["chitiet", "soBooking"]}
            rules={[{ type: "string", required: true }]}
          >
            <Input placeholder="Số Booking:"></Input>
          </FormItem>
          <FormItem
            label="Số Cont"
            name={["chitiet", "tits_qtsx_SoContainer_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSoCont}
              placeholder="Chọn số Cont"
              optionsvalue={["tits_qtsx_SoContainer_Id", "soContainer"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={(val) => {
                ListSoCont.forEach((vt) => {
                  if (vt.tits_qtsx_SoContainer_Id === val) {
                    setListSoVIN(vt.list_chitiets);
                    setFieldsValue({
                      chitiet: {
                        tenDonHang: vt.tenDonHang,
                        list_chitiets: vt.list_chitiets.map(
                          (ct) => ct.tits_qtsx_SoVin_Id
                        ),
                      },
                    });
                  }
                });
              }}
            />
          </FormItem>
          <FormItem
            label="Số đơn hàng"
            name={["chitiet", "tenDonHang"]}
            rules={[{ required: true }]}
          >
            <Input placeholder="Số đơn hàng" disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Số VIN"
            name={["chitiet", "list_chitiets"]}
            rules={[
              {
                type: "array",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading black-text"
              data={ListSoVIN ? ListSoVIN : []}
              placeholder="Số VIN"
              optionsvalue={["tits_qtsx_SoVin_Id", "maSoVin"]}
              style={{ width: "100%" }}
              mode={"multiple"}
              disabled={true}
            />
          </FormItem>
          <FormItem
            label="Ghi chú"
            name={["chitiet", "moTa"]}
            rules={[{ type: "string" }]}
          >
            <Input placeholder="Ghi chú"></Input>
          </FormItem>
          <FormSubmit disabled={fieldTouch} />
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalAddVatTu;
