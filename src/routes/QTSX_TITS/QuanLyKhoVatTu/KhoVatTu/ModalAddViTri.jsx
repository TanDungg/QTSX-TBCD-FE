import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";

const FormItem = Form.Item;

function ModalAddViTri({ openModalFS, openModal, refesh, vatTu, key }) {
  const dispatch = useDispatch();
  const [listVatTu, setListVatTu] = useState([]);
  const [ListKe, setListKe] = useState([]);
  const [ListTang, setListTang] = useState([]);
  const [ListNgan, setListNgan] = useState([]);
  const [require, setRequire] = useState(false);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
      console.log(vatTu);
      getKe(vatTu.cauTrucKho_Id);
      resetFields();
      if (vatTu.tits_qtsx_Ke_Id) {
        setFieldsValue({
          vatTu: {
            tits_qtsx_Ke_Id: vatTu.tits_qtsx_Ke_Id,
          },
        });
        getTang(vatTu.tits_qtsx_Ke_Id);
      }
      if (vatTu.tits_qtsx_Tang_Id) {
        setFieldsValue({
          vatTu: {
            tits_qtsx_Tang_Id: vatTu.tits_qtsx_Tang_Id,
          },
        });
        getNgan(vatTu.tits_qtsx_Tang_Id);
      }
      if (vatTu.tits_qtsx_Ngan_Id) {
        setFieldsValue({
          vatTu: {
            tits_qtsx_Ngan_Id: vatTu.tits_qtsx_Ngan_Id,
          },
        });
      }
      setFieldsValue({
        vatTu: {
          tits_qtsx_VatTu_Id: vatTu.tits_qtsx_VatTu_Id,
          soLuong: vatTu.soLuong,
        },
      });
      setListVatTu([
        {
          id: vatTu.tits_qtsx_VatTu_Id,
          name: `${vatTu.maVatTu} - ${vatTu.tenVatTu}`,
        },
      ]);
    }
  }, [openModal]);

  const getKe = (tits_qtsx_CauTrucKho_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
      thuTu: 2,
      isThanhPham: false,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?${params}`,
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
  const getTang = (tits_qtsx_CauTrucKho_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
      thuTu: 3,
      isThanhPham: false,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?${params}`,
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
        if (res && res.data.length > 0) {
          setListTang(res.data);
          setRequire(true);
        } else {
          setListTang([]);
          setRequire(false);
        }
      })
      .catch((error) => console.error(error));
  };
  const getNgan = (tits_qtsx_CauTrucKho_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
      thuTu: 4,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?${params}`,
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
          setListNgan(res.data);
        } else {
          setListNgan([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const saveData = (vattu) => {
    const newData = {
      tits_qtsx_PhieuNhapKhoVatTuChiTiet_Id: vatTu.tits_qtsx_ChiTietKhoVatTu_Id,
      tits_qtsx_Ke_Id: vattu.tits_qtsx_Ke_Id,
      tits_qtsx_Tang_Id: vattu.tits_qtsx_Tang_Id,
      tits_qtsx_Ngan_Id: vattu.tits_qtsx_Ngan_Id,
      soLuong: vattu.soLuong,
      tits_qtsx_VatTu_Id: vattu.tits_qtsx_VatTu_Id,
      tits_qtsx_CauTrucKho_Id: vatTu.tits_qtsx_CauTrucKho_Id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoVatTu/vi-tri-luu-kho-vat-tu?id=${vatTu.tits_qtsx_ChiTietKhoVatTu_Id}`,
          "PUT",
          newData,
          key === "add" ? "ADD" : "EDIT",
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
    saveData(values.vatTu);
  };
  const handleSelectKe = (val) => {
    getTang(val);
    setListNgan([]);
    setFieldsValue({
      vatTu: {
        tits_qtsx_Tang_Id: null,
        tits_qtsx_Ngan_Id: null,
      },
    });
  };
  const handleSelectTang = (val) => {
    getNgan(val);
    setFieldsValue({
      vatTu: {
        tits_qtsx_Ngan_Id: null,
      },
    });
  };
  return (
    <AntModal
      title={key === "add" ? "Thêm vị trí" : "Chỉnh sửa vị trí"}
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
            name={["vatTu", "tits_qtsx_VatTu_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={listVatTu}
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              disabled={true}
            />
          </FormItem>
          <FormItem
            label="Số lượng"
            name={["vatTu", "soLuong"]}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[1-9]\d*$/,
                message: "Số lượng không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Số lượng" type="number"></Input>
          </FormItem>
          <FormItem
            label="Kệ"
            name={["vatTu", "tits_qtsx_Ke_Id"]}
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
              optionsvalue={["id", "tenCauTrucKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleSelectKe}
            />
          </FormItem>
          <FormItem
            label="Tầng"
            name={["vatTu", "tits_qtsx_Tang_Id"]}
            rules={[
              {
                type: "string",
                required: require,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListTang ? ListTang : []}
              placeholder="Chọn tầng"
              optionsvalue={["id", "tenCauTrucKho"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleSelectTang}
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Ngăn"
            name={["vatTu", "tits_qtsx_Ngan_Id"]}
            rules={[
              {
                type: "string",
                required: require,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListNgan ? ListNgan : []}
              placeholder="Chọn ngăn"
              optionsvalue={["id", "tenCauTrucKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <Row justify={"center"}>
            <Button
              className="th-btn-margin-bottom-0"
              style={{ marginTop: 10, marginRight: 15 }}
              type="primary"
              htmlType="submit"
              disabled={!fieldTouch}
            >
              {key === "add" ? "Thêm" : "Lưu"}
            </Button>
          </Row>
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalAddViTri;
