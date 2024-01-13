import { Modal as AntModal, Button, Row, Form } from "antd";
import React, { useEffect, useState } from "react";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { convertObjectToUrlParams } from "src/util/Common";
const FormItem = Form.Item;

function ModalThemKe({ openModalFS, openModal, addKe, cauTrucKho_Id }) {
  const [fieldTouch, setFieldTouch] = useState(false);
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const { validateFields, resetFields } = form;
  const [listLot, setListLot] = useState([]);

  const [ListSanPham, setListSanPham] = useState([]);

  useEffect(() => {
    if (openModal) {
      getSanPham(cauTrucKho_Id);
    }
  }, [openModal]);
  const getSanPham = (cauTrucKho_Id) => {
    const params = convertObjectToUrlParams({
      cauTrucKho_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho/list-vi-tri-luu-kho-thanh-pham?${params}`,
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
            return {
              ...sp,
              name:
                sp.maSanPham +
                " - " +
                sp.tenSanPham +
                " - (" +
                (sp.tenKe
                  ? sp.tenKe +
                    (sp.tenTang
                      ? " - " + sp.tenTang + " - " + sp.tenNgan + ")"
                      : ")")
                  : sp.tenKho + ")"),
              viTri: sp.tenKe
                ? sp.tenKe +
                  (sp.tenTang
                    ? " - " + sp.tenTang + " - " + sp.tenNgan + ""
                    : "")
                : sp.tenKho + "",
            };
          });
          setListSanPham(newData);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getLot = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Lot/getlist-lot-by-san-pham?sanPham_Id=${id}`,
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
        const newData = values.addKe;
        listLot.forEach((l) => {
          if (l.id === newData.lot_Id) {
            newData.soLot = l.soLot;
          }
        });
        ListSanPham.forEach((k) => {
          if (k.chiTietKho_Id === newData.chiTietKho_Id) {
            newData.lkn_ChiTietKhoThanhPham_Id = k.chiTietKho_Id;
            newData.tenKe = k.tenKe;
            newData.tenNgan = k.tenNgan;
            newData.tenKho = k.tenKho;
            newData.tenTang = k.tenTang;
            newData.tenMauSac = k.tenMauSac;
            newData.mauSac_Id = k.mauSac_Id;
            newData.ke_Id = k.ke_Id;
            newData.ngan_Id = k.ngan_Id;
            newData.tang_Id = k.tang_Id;
            newData.sanPham_Id = k.sanPham_Id;
            newData.tenSanPham = k.tenSanPham;
            newData.maSanPham = k.maSanPham;
            newData.tenDonViTinh = k.tenDonViTinh;
            newData.soLuongXuat = k.soLuong;
            newData.lkn_PhieuNhapKhoThanhPham_Id =
              k.lkn_PhieuNhapKhoThanhPham_Id;
          }
        });
        addKe(newData);
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
    ListSanPham.forEach((sp) => {
      if (sp.chiTietKho_Id === val) {
        getLot(sp.sanPham_Id);
      }
    });
  };
  return (
    <AntModal
      title="Chọn sản phẩm"
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
            label="Sản phẩm"
            name={["addKe", "chiTietKho_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham}
              placeholder="Chọn sản phẩm"
              optionsvalue={["chiTietKho_Id", "name"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleSelectSanPham}
            />
          </FormItem>
          <FormItem
            label="Lot"
            name={["addKe", "lot_Id"]}
            rules={[
              {
                type: "string",
                required: listLot.length > 0 ? true : false,
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

          <FormItem
            label="Vị trí"
            name={["addKe", "chiTietKho_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham}
              placeholder="Chọn vị trí"
              optionsvalue={["chiTietKho_Id", "viTri"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              disabled={true}
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
