import { Modal as AntModal, Button, Row, Form, Input, Divider } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";

const FormItem = Form.Item;

function ModalAddViTri({ openModalFS, openModal, refesh, itemData }) {
  const dispatch = useDispatch();
  const [ListKe, setListKe] = useState([]);
  const [ListTang, setListTang] = useState([]);
  const [ListNgan, setListNgan] = useState([]);
  const [require, setRequire] = useState(false);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
      getKe(itemData.tits_qtsx_CauTrucKho_Id);
      if (!itemData.tits_qtsx_Ke_Id) {
        setFieldsValue({
          addvitrivattu: {
            tenVatTu: itemData.tenVatTu,
            soLuong: itemData.soLuong,
          },
        });
      }
      if (itemData.tits_qtsx_Ke_Id) {
        getTang(itemData.tits_qtsx_Ke_Id);
        getNgan(itemData.tits_qtsx_Tang_Id);
        setFieldsValue({
          addvitrivattu: {
            tenVatTu: itemData.tenVatTu,
            soLuong: itemData.soLuong,
            tits_qtsx_Ke_Id:
              itemData.tits_qtsx_Ke_Id &&
              itemData.tits_qtsx_Ke_Id.toLowerCase(),
            tits_qtsx_Tang_Id:
              itemData.tits_qtsx_Tang_Id &&
              itemData.tits_qtsx_Tang_Id.toLowerCase(),
            tits_qtsx_Ngan_Id:
              itemData.tits_qtsx_Ngan_Id &&
              itemData.tits_qtsx_Ngan_Id.toLowerCase(),
          },
        });
      }
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
          setListNgan(res.data);
        } else {
          setListNgan([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  const onFinish = (values) => {
    const newData = {
      ...values.addvitrivattu,
      tits_qtsx_VatTu_Id: itemData.tits_qtsx_VatTu_Id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoVatTu/vi-tri-luu-kho-vat-tu?id=${itemData.tits_qtsx_ChiTietKhoVatTu_Id}`,
          "PUT",
          newData,
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
          refesh();
          openModalFS(false);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleSelectKe = (val) => {
    getTang(val);
    setListNgan([]);
    setFieldsValue({
      addvitrivattu: {
        tits_qtsx_Tang_Id: null,
        tits_qtsx_Ngan_Id: null,
      },
    });
  };

  const handleSelectTang = (val) => {
    getNgan(val);
    setFieldsValue({
      addvitrivattu: {
        tits_qtsx_Ngan_Id: null,
      },
    });
  };
  return (
    <AntModal
      title={
        itemData && !itemData.tits_qtsx_Ke_Id
          ? "Thêm vị trí"
          : "Chỉnh sửa vị trí"
      }
      open={openModal}
      width={`60%`}
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
            name={["addvitrivattu", "tenVatTu"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input
              className="input-item"
              placeholder="Tên vật tư"
              disabled={true}
            />
          </FormItem>
          <FormItem
            label="Số lượng"
            name={["addvitrivattu", "soLuong"]}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[0-9]\d*$/,
                message: "Số lượng không hợp lệ!",
              },
            ]}
          >
            <Input className="input-item" placeholder="Số lượng" />
          </FormItem>
          <FormItem
            label="Kệ"
            name={["addvitrivattu", "tits_qtsx_Ke_Id"]}
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
            name={["addvitrivattu", "tits_qtsx_Tang_Id"]}
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
            name={["addvitrivattu", "tits_qtsx_Ngan_Id"]}
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
          <Divider />
          <Row justify={"center"}>
            <Button
              className="th-btn-margin-bottom-0"
              type="primary"
              htmlType="submit"
              disabled={!fieldTouch}
            >
              {itemData && !itemData.tits_qtsx_Ke_Id ? "Thêm" : "Lưu"}
            </Button>
          </Row>
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalAddViTri;
