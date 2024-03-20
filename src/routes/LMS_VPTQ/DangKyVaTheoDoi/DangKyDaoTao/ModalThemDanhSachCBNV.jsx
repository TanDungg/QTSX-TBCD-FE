import { Modal as AntModal, Form, Card, Col } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import { DEFAULT_FORM_ADD_130PX } from "src/constants/Config";
import { convertObjectToUrlParams } from "src/util/Common";

const FormItem = Form.Item;

function ModalThemDanhSachCBNV({
  openModalFS,
  openModal,
  donVi,
  list_cbnv,
  DataThemDanhSach,
}) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [ListCBNV, setListCBNV] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListDonVi();
      getListPhongBan(donVi);
      getListCBNV(donVi);
      setFieldsValue({
        modalthemdanhsachcbnv: {
          donVi_Id: donVi,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/don-vi-by-user`,
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
          setListDonVi(res.data);
        } else {
          setListDonVi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListPhongBan = (donVi_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan/phong-ban-tree?donviid=${donVi_Id}`,
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
          setListPhongBan(res.data);
        } else {
          setListPhongBan([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListCBNV = (donVi_Id, phongBan_Id) => {
    const param = convertObjectToUrlParams({ donVi_Id, phongBan_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_PhieuDangKyDaoTao/user-by-dv-pb?${param}`,
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
              cbnv: `${dt.maNhanVien} - ${dt.fullName} ${
                dt.tenChucDanh ? `(${dt.tenChucDanh})` : ``
              }`,
            };
          });
          if (list_cbnv.length) {
            const newListCauHoi = newData.filter((list) => {
              const findCBNV = list_cbnv.find(
                (cbnv) =>
                  cbnv.user_Id.toLowerCase() === list.user_Id.toLowerCase()
              );
              return !findCBNV;
            });

            setListCBNV(newListCauHoi);
          } else {
            setListCBNV(newData);
          }
        } else {
          setListCBNV([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onFinish = (values) => {
    ThemDanhSach(values.modalthemdanhsachcbnv);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        ThemDanhSach(values.modalthemdanhsachcbnv, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const ThemDanhSach = (modalthemdanhsachcbnv, saveQuit = false) => {
    const cbnv = ListCBNV.find(
      (list) => list.user_Id === modalthemdanhsachcbnv.user_Id
    );

    DataThemDanhSach(cbnv);
    setFieldsValue({
      modalthemdanhsachcbnv: {
        user_Id: null,
      },
    });

    const listcbnv = ListCBNV.filter(
      (list) => list.user_Id !== modalthemdanhsachcbnv.user_Id
    );
    setListCBNV(listcbnv);
    setFieldTouch(false);
    if (saveQuit) {
      handleCancel();
    }
  };

  const handleSelectPhongBan = (value) => {
    getListCBNV(donVi, value);
    setFieldsValue({
      modalthemdanhsachcbnv: {
        user_Id: null,
      },
    });
  };

  const handleClearPhongBan = () => {
    getListCBNV(donVi);
    setFieldsValue({
      modalthemdanhsachcbnv: {
        user_Id: null,
      },
    });
  };

  const handleCancel = () => {
    resetFields();
    openModalFS(false);
  };

  return (
    <AntModal
      title="Thêm danh sách CBNV"
      open={openModal}
      width={width > 1000 ? `60%` : `100%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card
        className="th-card-margin-bottom"
        align="center"
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_130PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Đơn vị"
              name={["modalthemdanhsachcbnv", "donVi_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListDonVi ? ListDonVi : []}
                placeholder="Chọn đơn vị"
                optionsvalue={["donVi_Id", "tenDonVi"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp={"name"}
                disabled
              />
            </FormItem>
          </Col>
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Phòng ban"
              name={["modalthemdanhsachcbnv", "phongBan_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListPhongBan ? ListPhongBan : []}
                placeholder="Chọn phòng ban"
                optionsvalue={["id", "tenPhongBan"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp={"name"}
                onSelect={handleSelectPhongBan}
                allowClear
                onClear={handleClearPhongBan}
              />
            </FormItem>
          </Col>
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="CBNV"
              name={["modalthemdanhsachcbnv", "user_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListCBNV ? ListCBNV : []}
                placeholder="Chọn CBNV"
                optionsvalue={["user_Id", "cbnv"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp={"name"}
              />
            </FormItem>
          </Col>
          <FormSubmit
            goBack={handleCancel}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
    </AntModal>
  );
}

export default ModalThemDanhSachCBNV;
