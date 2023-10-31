import { Card, Form, Input } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select, TreeSelect } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";

const FormItem = Form.Item;

const initialState = {
  maDonVi: "",
  tenDonVi: "",
  tapDoan_Id: "",
  donVi_Id: "root",
};
const DonViForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { maDonVi, tenDonVi, tapDoan_Id, donVi_Id } = initialState;
  const [tapDoanSelect, setTapDoanSelect] = useState([]);
  const [DonViSelect, setDonViSelect] = useState([]);

  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getData();
          setType("new");
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = () => {
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
        }
      })
      .catch((error) => console.error(error));
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/don-vi-tree?page=-1`,
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

  /**
   * Lấy thông tin
   *
   */
  const getInfo = () => {
    const { id } = match.params;
    getData();
    setId(id);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`DonVi/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          const data = res.data;
          setFieldsValue({
            donvi: data,
          });
          setInfo(...res.data, res.data.tapDoan);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Quay lại trang đơn vị
   *
   */
  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.donvi);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.donvi, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      const newData = user;
      newData.donVi_Id === "root"
        ? (newData.donVi_Id = null)
        : (newData.donVi_Id = newData.donVi_Id);
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`DonVi`, "POST", newData, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
            }
          } else {
            if (saveQuit) {
              goBack();
            } else {
              setFieldTouch(false);
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      delete info.tapDoan;
      var newData = { ...info, ...user };
      newData.donVi_Id === "root"
        ? (newData.donVi_Id = null)
        : (newData.donVi_Id = newData.donVi_Id);
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`DonVi/${id}`, "PUT", newData, "EDIT", "", resolve, reject)
        );
      })
        .then((res) => {
          if (saveQuit) {
            if (res.status !== 409) goBack();
          } else {
            getInfo();
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const formTitle = type === "new" ? "Thêm mới đơn vị" : "Chỉnh sửa đơn vị";
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem
            label="Mã đơn vị"
            name={["donvi", "maDonVi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 50,
                message: "Mã đơn vị không được quá 50 ký tự",
              },
            ]}
            initialValue={maDonVi}
          >
            <Input className="input-item" placeholder="Nhập mã đơn vị" />
          </FormItem>
          <FormItem
            label="Tên đơn vị"
            name={["donvi", "tenDonVi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 250,
                message: "Tên đơn vị không được quá 250 ký tự",
              },
            ]}
            initialValue={tenDonVi}
          >
            <Input className="input-item" placeholder="Nhập tên đơn vị" />
          </FormItem>
          <FormItem
            label="Đơn vị cha"
            name={["donvi", "donVi_Id"]}
            rules={[
              {
                type: "string",
              },
            ]}
            initialValue={donVi_Id}
          >
            <TreeSelect
              className="tree-select-item"
              datatreeselect={DonViSelect ? DonViSelect : []}
              name="menu"
              options={["id", "tenDonVi", "children"]}
              placeholder="Đơn vị cha"
              style={{ width: "100%" }}
            />
          </FormItem>
          <FormItem
            label="Tập đoàn"
            name={["donvi", "tapDoan_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={tapDoan_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={tapDoanSelect ? tapDoanSelect : []}
              placeholder="Chọn tập đoàn"
              optionsvalue={["id", "tenTapDoan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
    </div>
  );
};

export default DonViForm;
