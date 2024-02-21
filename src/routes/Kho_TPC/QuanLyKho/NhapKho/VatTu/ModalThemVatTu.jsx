import { Modal as AntModal, Button, Row, Form, Input, DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_MODAL } from "src/constants/Config";
import { Select } from "src/components/Common";
import dayjs from "dayjs";
import moment from "moment";

const FormItem = Form.Item;

function ModalThemVatTu({
  openModalFS,
  openModal,
  loading,
  addVatTu,
  cauTrucKho_Id,
  infoVatTu,
}) {
  const dispatch = useDispatch();
  const [listVatTu, setListVatTu] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [require, setRequire] = useState(false);
  const [ListKe, setListKe] = useState([]);
  const [ListTang, setListTang] = useState([]);
  const [ListNgan, setListNgan] = useState([]);
  useEffect(() => {
    if (openModal) {
      resetFields();
      getVatTu();
      getKe(cauTrucKho_Id);
      if (infoVatTu) {
        infoVatTu.ke_Id && getTang(infoVatTu.ke_Id);
        infoVatTu.tang_Id && getNgan(infoVatTu.tang_Id);
        setFieldsValue({
          vatTu: {
            ...infoVatTu,
            thoiGianSuDung: infoVatTu.thoiGianSuDung
              ? moment(infoVatTu.thoiGianSuDung, "DD/MM/YYYY")
              : null,
          },
        });
      }
    }
  }, [openModal]);
  const getVatTu = () => {
    const params = convertObjectToUrlParams({ page: -1 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `VatTu?${params}`,
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
          const newData = res.data.map((dt) => {
            return {
              ...dt,
              name: dt.maVatTu + " - " + dt.tenVatTu,
            };
          });
          setListVatTu(newData);
        } else {
          setListVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };

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
  const handleSubmit = () => {
    validateFields()
      .then((values) => {
        if (values.vatTu.ngan_Id) {
          ListNgan.forEach((n) => {
            if (n.id === values.vatTu.ngan_Id) {
              values.vatTu.tenNgan = n.tenCTKho;
            }
          });
        } else {
          ListKe.forEach((n) => {
            if (n.id === values.vatTu.ke_Id) {
              values.vatTu.tenKe = n.tenCTKho;
            }
          });
        }
        listVatTu.forEach((vt) => {
          if (vt.id === values.vatTu.vatTu_Id) {
            values.vatTu.maVatTu = vt.maVatTu;
            values.vatTu.tenVatTu = vt.tenVatTu;
            values.vatTu.tenDonViTinh = vt.tenDonViTinh;
          }
        });
        values.vatTu.thoiGianSuDung =
          values.vatTu.thoiGianSuDung && values.vatTu.thoiGianSuDung._i;
        values.vatTu.chiTiet_Id =
          values.vatTu.vatTu_Id +
          values.vatTu.ke_Id +
          (values.vatTu.ngan_Id ? values.vatTu.ngan_Id : "");

        infoVatTu
          ? addVatTu(values.vatTu, true)
          : addVatTu(values.vatTu, false);
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
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };
  const handleSelectKe = (val) => {
    getTang(val);
    setListNgan([]);
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
      width={`60%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Form
          {...DEFAULT_FORM_MODAL}
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
              data={listVatTu ? listVatTu : []}
              placeholder="Chọn vật tư"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>

          <FormItem
            label="Số lượng"
            name={["vatTu", "soLuongNhap"]}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^(0\.\d*[1-9]\d*|[1-9]\d*(\.\d+)?)$/,
                message: "Số lượng phải là số và lớn hơn 0!",
              },
            ]}
          >
            <Input placeholder="Số lượng" type="number"></Input>
          </FormItem>
          <FormItem
            label="Thời gian sử dụng"
            name={["vatTu", "thoiGianSuDung"]}
          >
            <DatePicker
              placeholder="Thời gian sử dụng"
              format={"DD/MM/YYYY"}
              disabledDate={disabledDate}
              onChange={(date, dateString) =>
                setFieldsValue({
                  vatTu: {
                    thoiGianSuDung: date
                      ? moment(dateString, "DD/MM/YYYY")
                      : null,
                  },
                })
              }
            />
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
          <FormItem
            label="Ghi chú"
            name={["vatTu", "ghiChu"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Input placeholder="Số lượng"></Input>
          </FormItem>
        </Form>
        <Row justify={"center"}>
          <Button
            className="th-margin-bottom-0"
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

export default ModalThemVatTu;
