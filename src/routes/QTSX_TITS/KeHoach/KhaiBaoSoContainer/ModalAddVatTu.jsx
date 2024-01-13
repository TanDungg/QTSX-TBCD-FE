import { Modal as AntModal, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import { FormSubmit } from "src/components/Common";
import { convertObjectToUrlParams } from "src/util/Common";
const FormItem = Form.Item;

function ModalAddVatTu({ openModalFS, openModal, addSanPham, listVT }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListVatTu, setListVatTu] = useState([]);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
      getVatTu();
    }
  }, [openModal]);

  const getVatTu = () => {
    const params = convertObjectToUrlParams({
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_VatTu?${params}`,
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
              (item) => item.id === vt.tits_qtsx_VatTu_Id
            );
            if (phanTuB) {
              const index = res.data.indexOf(phanTuB);
              res.data.splice(index, 1);
            }
          });
          setListVatTu(
            res.data.map((d) => {
              return {
                ...d,
                name: d.maVatTu + " - " + d.tenVatTu,
              };
            })
          );
        } else {
          setListVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const saveData = (chitiet) => {
    ListVatTu.forEach((vt) => {
      if (vt.id === chitiet.tits_qtsx_VatTu_Id) {
        chitiet.tenVatTu = vt.tenVatTu;
        chitiet.maVatTu = vt.maVatTu;
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

  const title = "Thông tin vật tư";

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
            label="Vật tư"
            name={["chitiet", "tits_qtsx_VatTu_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListVatTu}
              placeholder="Chọn Vật tư"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={(val) => {
                ListVatTu.forEach((vt) => {
                  if (vt.id === val) {
                    setFieldsValue({
                      chitiet: {
                        tenDonViTinh: vt.tenDonViTinh,
                      },
                    });
                  }
                });
              }}
            />
          </FormItem>
          <FormItem
            label="Đơn vị tính"
            name={["chitiet", "tenDonViTinh"]}
            rules={[{ required: true }]}
          >
            <Input placeholder="Đơn vị tính" disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Số lượng"
            name={["chitiet", "soLuong"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input type="number" placeholder="Số lượng"></Input>
          </FormItem>

          <FormSubmit disabled={fieldTouch} />
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalAddVatTu;
