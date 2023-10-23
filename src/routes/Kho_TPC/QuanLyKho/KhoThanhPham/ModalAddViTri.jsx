import { Modal as AntModal, Button, Row, Form, Input } from "antd";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";

const FormItem = Form.Item;

function ModalAddViTri({ openModalFS, openModal, refesh, sanPham }) {
  const dispatch = useDispatch();
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListKe, setListKe] = useState([]);
  const [SucChua, setSucChua] = useState();
  const [DisableKe, setDisableKe] = useState(true);

  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
      console.log(sanPham);
      getKe(sanPham.cauTrucKho_Id);
      resetFields();
      if (sanPham.ke_Id) {
        setFieldsValue({
          sanPham: {
            ke_Id: sanPham.ke_Id,
          },
        });
      }
      setFieldsValue({
        sanPham: {
          sanPham_Id: sanPham.sanPham_Id,
          soLuong: sanPham.soLuong,
        },
      });
      setListSanPham([
        {
          id: sanPham.sanPham_Id,
          name: `${sanPham.maSanPham} - ${sanPham.tenSanPham} - ${sanPham.tenMauSac}`,
        },
      ]);
    }
  }, [openModal]);

  const getKe = (cauTrucKho_Id) => {
    const params = convertObjectToUrlParams({ cauTrucKho_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-ke-thanh-pham-chua-day?${params}`,
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
          setListKe(res.data);
        } else {
          setListKe([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const saveData = (sp) => {
    const newData = {
      id: sanPham.chiTietKho_Id,
      ke_Id: sp.ke_Id,
      soLuong: sp.soLuong,
      sanPham_Id: sanPham.sanPham_Id,
      mauSac_Id: sanPham.mauSac_Id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho/ke-thanh-pham?id=${sanPham.chiTietKho_Id}`,
          "PUT",
          newData,
          "ADD",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          resetFields();
          refesh();
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
    saveData(values.sanPham);
  };
  const handleSelectKe = (val) => {
    ListKe.forEach((k) => {
      if (k.id === val) {
        setSucChua(k.sucChua);
        setDisableKe(false);
        setFieldsValue({
          sanPham: {
            soLuong: sanPham.soLuong >= k.sucChua ? k.sucChua : sanPham.soLuong,
          },
        });
      }
    });
  };
  const validateSoLuong = (_, value) => {
    if (value && Number(value) > SucChua) {
      return Promise.reject(
        new Error(
          `Số phải nhỏ hơn hoặc bằng sức chứa của kệ (Sức chứa: ${SucChua})`
        )
      );
    }
    return Promise.resolve();
  };
  return (
    <AntModal
      title="Thêm vật tư"
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
            name={["sanPham", "sanPham_Id"]}
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
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              disabled={true}
            />
          </FormItem>
          <FormItem
            label="Kệ"
            name={["sanPham", "ke_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKe ? ListKe : []}
              placeholder="Chọn kệ"
              optionsvalue={["id", "tenCTKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleSelectKe}
            />
          </FormItem>
          <FormItem
            label="Số lượng"
            name={["sanPham", "soLuong"]}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[1-9]\d*$/,
                message: "Số lượng không hợp lệ!",
              },
              { validator: validateSoLuong },
            ]}
          >
            <Input
              placeholder="Số lượng"
              type="number"
              disabled={DisableKe}
            ></Input>
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

export default ModalAddViTri;
