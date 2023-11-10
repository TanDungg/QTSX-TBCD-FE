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
  tits_qtsx_NhomThietBi_Id: "",
  tits_qtsx_Tram_Id: "",
  module: "",
  soSerial: "",
  diaChiIP: "",
  moTa: "",
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
    tits_qtsx_NhomThietBi_Id,
    tits_qtsx_Tram_Id,
    module,
    soSerial,
    diaChiIP,
    moTa,
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
          getListNhomThietBi();
          getListTram();
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
          getListNhomThietBi();
          getListTram();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListNhomThietBi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_NhomThietBi?page=-1`,
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
          setListNhomThietBi(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListTram = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Tram?page=-1`,
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
          setListTram(res.data);
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
    setId(id);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ThietBi/${id}`,
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
          setFieldsValue({
            thietbi: res.data,
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
    saveData(values.thietbi);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.thietbi, true);
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
          fetchStart(
            `tits_qtsx_ThietBi`,
            "POST",
            newData,
            "ADD",
            "",
            resolve,
            reject
          )
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
            `tits_qtsx_ThietBi/${id}`,
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
            name={["thietbi", "maThietBi"]}
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
            name={["thietbi", "tenThietBi"]}
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
            name={["thietbi", "tits_qtsx_NhomThietBi_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={tits_qtsx_NhomThietBi_Id}
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
            name={["thietbi", "tits_qtsx_Tram_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={tits_qtsx_Tram_Id}
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
            name={["thietbi", "module"]}
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
            name={["thietbi", "soSerial"]}
            rules={[
              {
                type: "string",
              },
              {
                max: 250,
                message: "Số seri không được quá 50 ký tự",
              },
            ]}
            initialValue={soSerial}
          >
            <Input className="input-item" placeholder="Nhập số seri" />
          </FormItem>
          <FormItem
            label="Địa chỉ IP"
            name={["thietbi", "diaChiIP"]}
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
          <FormItem
            label="Mô tả"
            name={["thietbi", "moTa"]}
            rules={[
              {
                type: "string",
              },
              {
                max: 250,
                message: "Mô tả không được quá 255 ký tự",
              },
            ]}
            initialValue={moTa}
          >
            <Input className="input-item" placeholder="Nhập mô tả" />
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
