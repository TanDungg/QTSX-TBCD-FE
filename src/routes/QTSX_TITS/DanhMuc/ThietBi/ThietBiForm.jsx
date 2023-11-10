import { Card, Form, Input } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";

const FormItem = Form.Item;

const initialState = {
  maThietBi: "",
  tenThietBi: "",
  nhomThietBi_Id: "",
  tram_Id: "",
  module: "",
  soSeri: "",
  diaChiIP: "",
};
const ThietBiForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const {
    maThietBi,
    tenThietBi,
    nhomThietBi_Id,
    tram_Id,
    module,
    soSeri,
    diaChiIP,
  } = initialState;
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListNhomThietBi, setListNhomThietBi] = useState([]);
  const [ListTram, setListTram] = useState([]);
  const [info, setInfo] = useState({});

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          // Get info
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

  /**
   * Lấy thông tin
   *
   */
  const getInfo = () => {
    const { id } = match.params;
    setId(id);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`ThietBi/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setFieldsValue({
            ThietBi: res.data,
          });
        }
        setInfo(res.data);
      })
      .catch((error) => console.error(error));
  };

  /**
   * Quay lại trang người dùng
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
    saveData(values.ThietBi);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.ThietBi, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      const newData = user;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`ThietBi`, "POST", newData, "ADD", "", resolve, reject)
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
      const newData = { ...info, ...user };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `ThietBi/${id}`,
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

  const formTitle = type === "new" ? "Thêm mới thiết bị" : "Chỉnh sửa thiết bị";
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
            label="Mã thiết bị"
            name={["ThietBi", "maThietBi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 50,
                message: "Mã thiết bị không được quá 50 ký tự",
              },
            ]}
            initialValue={maThietBi}
          >
            <Input className="input-item" placeholder="Nhập mã thiết bị" />
          </FormItem>
          <FormItem
            label="Tên thiết bị"
            name={["ThietBi", "tenThietBi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 250,
                message: "Tên thiết bị không được quá 250 ký tự",
              },
            ]}
            initialValue={tenThietBi}
          >
            <Input className="input-item" placeholder="Nhập tên thiết bị" />
          </FormItem>
          <FormItem
            label="Nhóm thiết bị"
            name={["ThietBi", "nhomThietBi_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={nhomThietBi_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListNhomThietBi ? ListNhomThietBi : []}
              placeholder="Chọn nhóm thiết bị"
              optionsvalue={["id", "tenNhomThietBi"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Trạm"
            name={["ThietBi", "tram_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={tram_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListTram ? ListTram : []}
              placeholder="Chọn trạm"
              optionsvalue={["id", "tenTram"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Module"
            name={["ThietBi", "module"]}
            rules={[
              {
                type: "string",
              },
              {
                max: 50,
                message: "Module không được quá 50 ký tự",
              },
            ]}
            initialValue={module}
          >
            <Input className="input-item" placeholder="Nhập module" />
          </FormItem>
          <FormItem
            label="Số serial"
            name={["ThietBi", "soSeri"]}
            rules={[
              {
                type: "string",
              },
              {
                max: 250,
                message: "Số seri không được quá 50 ký tự",
              },
            ]}
            initialValue={soSeri}
          >
            <Input className="input-item" placeholder="Nhập số seri" />
          </FormItem>
          <FormItem
            label="Địa chỉ IP"
            name={["ThietBi", "diaChiIP"]}
            rules={[
              {
                type: "string",
              },
              {
                max: 250,
                message: "Địa chỉ IP không được quá 255 ký tự",
              },
            ]}
            initialValue={diaChiIP}
          >
            <Input className="input-item" placeholder="Nhập địa chỉ IP" />
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

export default ThietBiForm;
