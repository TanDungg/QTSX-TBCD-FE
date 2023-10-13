import { Modal as AntModal, Button, Row, Form, Input, Col } from "antd";
import { map, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";

const FormItem = Form.Item;

function ModalAddViTri({ openModalFS, openModal, refesh, vatTu }) {
  const dispatch = useDispatch();
  const [listVatTu, setListVatTu] = useState([]);
  const [ListKe, setListKe] = useState([]);
  const [ListTang, setListTang] = useState([]);
  const [ListNgan, setListNgan] = useState([]);
  const [require, setRequire] = useState(false);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
      getKe(vatTu.cauTrucKho_Id);
      resetFields();
      if (vatTu.ke_Id) {
        setFieldsValue({
          vatTu: {
            ke_Id: vatTu.ke_Id,
          },
        });
        getTang(vatTu.ke_Id);
      }
      if (vatTu.tang_Id) {
        setFieldsValue({
          vatTu: {
            tang_Id: vatTu.tang_Id,
          },
        });
        getNgan(vatTu.tang_Id);
      }
      if (vatTu.ngan_Id) {
        setFieldsValue({
          vatTu: {
            ngan_Id: vatTu.ngan_Id,
          },
        });
      }
      setFieldsValue({
        vatTu: {
          vatTu_Id: vatTu.vatTu_Id,
          soLuong: vatTu.soLuong,
        },
      });
      setListVatTu([
        {
          id: vatTu.vatTu_Id,
          name: `${vatTu.maVatTu} - ${vatTu.tenVatTu} - ${vatTu.thoiGianSuDung}`,
        },
      ]);
    }
  }, [openModal]);

  const getKe = (cauTrucKho_Id) => {
    const params = convertObjectToUrlParams({ cauTrucKho_Id, thuTu: 2 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?${params}`,
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
  const getTang = (cauTrucKho_Id) => {
    const params = convertObjectToUrlParams({ cauTrucKho_Id, thuTu: 3 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?${params}`,
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
  const getNgan = (cauTrucKho_Id) => {
    const params = convertObjectToUrlParams({ cauTrucKho_Id, thuTu: 4 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?${params}`,
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
      id: vatTu.chiTietKho_Id,
      ke_Id: vattu.ke_Id,
      tang_Id: vattu.tang_Id,
      ngan_Id: vattu.ngan_Id,
      soLuong: vattu.soLuong,
      vatTu_Id: vattu.vatTu_Id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho?id=${vatTu.chiTietKho_Id}`,
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
    saveData(values.vatTu);
  };
  const handleSelectKe = (val) => {
    getTang(val);
    setFieldsValue({
      vatTu: {
        tang_Id: null,
        ngan_Id: null,
      },
    });
  };
  const handleSelectTang = (val) => {
    getNgan(val);
    setFieldsValue({
      vatTu: {
        ngan_Id: null,
      },
    });
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
            label="Vật tư"
            name={["vatTu", "vatTu_Id"]}
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
            <Input placeholder="Số lượng" type="number" disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Kệ"
            name={["vatTu", "ke_Id"]}
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
            label="Tầng"
            name={["vatTu", "tang_Id"]}
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
              optionsvalue={["id", "tenCTKho"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleSelectTang}
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Ngăn"
            name={["vatTu", "ngan_Id"]}
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
              optionsvalue={["id", "tenCTKho"]}
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
              Thêm
            </Button>
          </Row>
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalAddViTri;
