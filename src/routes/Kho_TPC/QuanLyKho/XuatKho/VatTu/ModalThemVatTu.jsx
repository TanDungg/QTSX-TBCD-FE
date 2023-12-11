import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { convertObjectToUrlParams } from "src/util/Common";
const FormItem = Form.Item;

function ModalThemVatTu({
  openModalFS,
  openModal,
  addVatTu,
  cauTrucKho_Id,
  infoVatTu,
}) {
  const [fieldTouch, setFieldTouch] = useState(false);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListVatTu, setListVatTu] = useState([]);

  useEffect(() => {
    if (openModal) {
      getVatTu(cauTrucKho_Id);
      if (infoVatTu) {
        setFieldsValue({
          addVatTu: {
            ...infoVatTu,
          },
        });
      }
    }
  }, [openModal]);
  const getVatTu = (cauTrucKho_Id) => {
    const params = convertObjectToUrlParams({
      cauTrucKho_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho/list-vi-tri-luu-kho-vat-tu?${params}`,
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
          const newData = res.data.map((sp) => {
            if (infoVatTu) {
              if (
                infoVatTu.lkn_ChiTietKhoVatTu_Id === sp.lkn_ChiTietKhoVatTu_Id
              ) {
                setFieldsValue({
                  addVatTu: {
                    soLuong: sp.soLuong,
                  },
                });
              }
            }
            return {
              ...sp,
              name:
                sp.maVatTu +
                " - " +
                sp.tenVatTu +
                "- SL: " +
                sp.soLuong +
                " - (" +
                (sp.tenNgan ? sp.tenNgan : sp.tenKe ? sp.tenKe : sp.tenKho) +
                ")",
              viTri: sp.tenNgan ? sp.tenNgan : sp.tenKe ? sp.tenKe : sp.tenKho,
            };
          });
          setListVatTu(newData);
        } else {
          setListVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleSubmit = () => {
    validateFields()
      .then((values) => {
        const newData = values.addVatTu;
        ListVatTu.forEach((k) => {
          if (k.lkn_ChiTietKhoVatTu_Id === newData.lkn_ChiTietKhoVatTu_Id) {
            newData.maVatTu = k.maVatTu;
            newData.vatTu_Id = k.vatTu_Id;
            newData.tenVatTu = k.tenVatTu;
            newData.tenNhomVatTu = k.tenNhomVatTu;
            newData.tenVatTu = k.tenVatTu;
            newData.tenDonViTinh = k.tenDonViTinh;
            newData.viTri = k.viTri;
            newData.soLuong = k.null;
            newData.chiTiet_LuuVatTus = [
              {
                SoLuong: k.soLuong,
                viTri: k.viTri,
                lkn_ChiTietKhoVatTu_Id: k.lkn_ChiTietKhoVatTu_Id,
              },
            ];
          }
        });
        infoVatTu ? addVatTu(newData, true) : addVatTu(newData, false);
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

  const handleSelectSanPham = (val) => {
    ListVatTu.forEach((sp) => {
      if (sp.lkn_ChiTietKhoVatTu_Id === val) {
        setFieldsValue({
          addVatTu: {
            soLuongThucXuat: sp.soLuong,
            soLuong: sp.soLuong,
            viTri: sp.viTri,
          },
        });
      }
    });
  };
  return (
    <AntModal
      title={infoVatTu ? "Chỉnh sửa thông tin vật tư" : "Thêm vật tư"}
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
            name={["addVatTu", "lkn_ChiTietKhoVatTu_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListVatTu}
              placeholder="Chọn vật tư"
              optionsvalue={["lkn_ChiTietKhoVatTu_Id", "name"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleSelectSanPham}
            />
          </FormItem>
          <FormItem label="Số lượng trong kho" name={["addVatTu", "soLuong"]}>
            <Input placeholder="Số lượng" disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Số lượng xuất"
            name={["addVatTu", "soLuongThucXuat"]}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^(0\.\d*[1-9]\d*|[1-9]\d*(\.\d+)?)$/,
                message: "Số lượng phải lớn hơn 0!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const soLuong = getFieldValue(["addVatTu", "soLuong"]);

                  if (value <= soLuong) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error(
                      "Số lượng xuất phải nhỏ hơn hoặc bằng số lượng trong kho!"
                    )
                  );
                },
              }),
            ]}
          >
            <Input placeholder="Số lượng" type="number"></Input>
          </FormItem>
          <FormItem
            label="Vị trí"
            name={["addVatTu", "viTri"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input placeholder="Vị trí" disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Ghi chú"
            name={["addVatTu", "ghiChu"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Input placeholder="Ghi chú"></Input>
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
            {infoVatTu ? "Lưu" : "Thêm"}
          </Button>
        </Row>
      </div>
    </AntModal>
  );
}

export default ModalThemVatTu;
