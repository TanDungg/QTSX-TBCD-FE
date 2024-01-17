import { Modal as AntModal, Form, Input } from "antd";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { FormSubmit, Select } from "src/components/Common";
const FormItem = Form.Item;

function ModalAddViTriCauTruc({ openModalFS, openModal, refesh, sanPham }) {
  const dispatch = useDispatch();
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListKe, setListKe] = useState([]);
  const [ListTang, setListTang] = useState([]);
  const [ListNgan, setListNgan] = useState([]);
  // const [require, setRequire] = useState(true);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
      getKe(sanPham.cauTrucKho_Id, 102);
      resetFields();
      if (sanPham.ke_Id && sanPham.tang_Id && sanPham.ngan_Id) {
        getKe(sanPham.ke_Id, 103);
        getKe(sanPham.tang_Id, 104);
        setFieldsValue({
          sanPham: {
            ke_Id: sanPham.ke_Id,
            tang_Id: sanPham.tang_Id,
            ngan_Id: sanPham.ngan_Id,
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

  const getKe = (cauTrucKho_Id, thuTu) => {
    const params = convertObjectToUrlParams({ cauTrucKho_Id, thuTu });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho/get-ke-tang-ngan-thanh-pham?${params}`,
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
          if (thuTu === 102) {
            setListKe(res.data);
          } else if (thuTu === 103) {
            setListTang(res.data);
          } else if (thuTu === 104) {
            setListNgan(res.data);
          }
        } else {
          if (thuTu === 102) {
            setListKe([]);
          } else if (thuTu === 103) {
            setListTang([]);
          } else if (thuTu === 104) {
            setListNgan([]);
          }
        }
      })
      .catch((error) => console.error(error));
  };

  const saveData = (sp) => {
    const newData = {
      id: sanPham.chiTietKho_Id,
      ke_Id: sp.ke_Id,
      tang_Id: sp.tang_Id,
      ngan_Id: sp.ngan_Id,
      soLuong: sp.soLuong,
      sanPham_Id: sanPham.sanPham_Id,
      mauSac_Id: sanPham.mauSac_Id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho/kho-thanh-pham?id=${sanPham.chiTietKho_Id}`,
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
    getKe(val, 103);
    setFieldsValue({
      sanPham: {
        tang_Id: null,
        ngan_Id: null,
      },
    });
  };
  const validateSoLuong = (_, value) => {
    if (value && Number(value) > sanPham.soLuong) {
      return Promise.reject(
        new Error(`Số lượng sản phẩm lớn hơn hiện có ${sanPham.soLuong}`)
      );
    } else {
      return Promise.resolve();
    }
  };
  const handleSelectTang = (val) => {
    getKe(val, 104);
    setFieldsValue({
      sanPham: {
        ngan_Id: null,
      },
    });
  };
  return (
    <AntModal
      title="Thêm vị trí"
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
              optionsvalue={["cauTrucKho_Id", "tenCauTrucKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleSelectKe}
            />
          </FormItem>
          <FormItem
            label="Tầng"
            name={["sanPham", "tang_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListTang ? ListTang : []}
              placeholder="Chọn tầng"
              optionsvalue={["cauTrucKho_Id", "tenCauTrucKho"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleSelectTang}
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Ngăn"
            name={["sanPham", "ngan_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListNgan ? ListNgan : []}
              placeholder="Chọn ngăn"
              optionsvalue={["cauTrucKho_Id", "tenCauTrucKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
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
            <Input placeholder="Số lượng" type="number"></Input>
          </FormItem>

          <FormSubmit disabled={fieldTouch} />
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalAddViTriCauTruc;
