import { Modal as AntModal, Button, Row, Form, Input, Col } from "antd";
import { map, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";

const FormItem = Form.Item;

function AddDonViCBNV({ openModalFS, openModal, data, addVatTu }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [phongBanSelect, setPhongBanSelect] = useState([]);
  const [donViSelect, setDonViSelect] = useState([]);
  const [TapDoanSelect, setTapDoanSelect] = useState([]);
  const [chucVuSelect, setChucVuSelect] = useState([]);
  const [boPhanSelect, setBoPhanSelect] = useState([]);
  useEffect(() => {
    if (openModal) {
      setFieldsValue({
        user: {
          user_Id: data.maNhanVien + " - " + data.fullName,
        },
      });
      getData();
    }
  }, [openModal]);
  const getData = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`ChucVu?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setChucVuSelect(res.data);
        }
      })
      .catch((error) => console.error(error));
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `TapDoan?page=-1`,
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
          setTapDoanSelect(res.data);
        } else {
          setTapDoanSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getDonVi = (tapdoanid) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi?tapdoanid=${tapdoanid}&&page=-1`,
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
          setDonViSelect(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  const getPhongBan = (donviid) => {
    let param = convertObjectToUrlParams({ donviid, page: -1 });

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?${param}`,
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
          setPhongBanSelect(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  const getBoPhan = (phongbanid) => {
    let param = convertObjectToUrlParams({ phongbanid, page: -1 });

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `BoPhan?${param}`,
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
          setBoPhanSelect(res.data);
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
    values.user.user_Id = data.id;
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/add-don-vi-cbnv`,
          "POST",
          values.user,
          "ADD",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          openModalFS(false);
        }
      })
      .catch((error) => console.error(error));
  };
  const handleSelectPhongBan = (val) => {
    getBoPhan(val);
    setFieldsValue({
      user: {
        boPhan_Id: null,
      },
    });
  };
  const handleSelectDonVi = (val) => {
    getPhongBan(val);
    setFieldsValue({
      user: {
        phongBan_Id: null,
        boPhan_Id: null,
      },
    });
  };
  const handleSelectTapDoan = (val) => {
    getDonVi(val);
    setFieldsValue({
      user: {
        donVi_Id: null,
        phongBan_Id: null,
        boPhan_Id: null,
      },
    });
  };
  return (
    <AntModal
      title="Thêm đơn vị kiêm nhiệm"
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
            label="Cán bộ nhân viên"
            name={["user", "user_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Chức vụ"
            name={["user", "chucVu_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={chucVuSelect ? chucVuSelect : []}
              placeholder="Chọn chức vụ"
              optionsvalue={["id", "tenChucVu"]}
              style={{ width: "100%" }}
            />
          </FormItem>
          <FormItem
            label="Tập đoàn"
            name={["user", "tapDoan_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={TapDoanSelect ? TapDoanSelect : []}
              placeholder="Chọn tập đoàn"
              optionsvalue={["id", "tenTapDoan"]}
              style={{ width: "100%" }}
              onSelect={handleSelectTapDoan}
              showSearch
              optionFilterProp={"name"}
            />
          </FormItem>
          <FormItem
            label="Đơn vị"
            name={["user", "donVi_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={donViSelect ? donViSelect : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["id", "tenDonVi"]}
              style={{ width: "100%" }}
              onSelect={handleSelectDonVi}
              showSearch
              optionFilterProp={"name"}
            />
          </FormItem>
          <FormItem
            label="Phòng ban"
            name={["user", "phongBan_Id"]}
            rules={[
              {
                required: true,
                type: "string",
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={phongBanSelect ? phongBanSelect : []}
              placeholder="Chọn phòng ban"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              onSelect={handleSelectPhongBan}
            />
          </FormItem>
          <FormItem
            label="Bộ phận"
            name={["user", "boPhan_Id"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={boPhanSelect ? boPhanSelect : []}
              placeholder="Chọn bộ phận"
              optionsvalue={["id", "tenBoPhan"]}
              style={{ width: "100%" }}
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

export default AddDonViCBNV;
