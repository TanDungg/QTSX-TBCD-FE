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
  maLoi: "",
  tenLoi: "",
  tits_qtsx_NhomLoi_Id: "",
  tits_qtsx_Tram_Id: "",
  module: "",
  soSerial: "",
  diaChiIP: "",
  moTa: "",
};
const LoiForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const {
    maLoi,
    tenLoi,
    tits_qtsx_NhomLoi_Id,
    tits_qtsx_Tram_Id,
    module,
    soSerial,
    diaChiIP,
    moTa,
  } = initialState;
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListNhomLoi, setListNhomLoi] = useState([]);
  const [info, setInfo] = useState({});

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getListNhomLoi();
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
          getListNhomLoi();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListNhomLoi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_NhomLoi?page=-1`,
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
          setListNhomLoi(res.data);
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
          `tits_qtsx_Loi/${id}`,
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
            loi: res.data,
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
    saveData(values.loi);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.loi, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (loi, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`tits_qtsx_Loi`, "POST", loi, "ADD", "", resolve, reject)
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
      loi.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_Loi/${id}`,
            "PUT",
            loi,
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

  const formTitle = type === "new" ? "Thêm mới lỗi" : "Chỉnh sửa lỗi";
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
            label="Mã lỗi"
            name={["loi", "maLoi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 50,
                message: "Mã lỗi không được quá 50 ký tự",
              },
            ]}
            initialValue={maLoi}
          >
            <Input className="input-item" placeholder="Nhập mã lỗi" />
          </FormItem>
          <FormItem
            label="Tên lỗi"
            name={["loi", "tenLoi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 250,
                message: "Tên lỗi không được quá 250 ký tự",
              },
            ]}
            initialValue={tenLoi}
          >
            <Input className="input-item" placeholder="Nhập tên lỗi" />
          </FormItem>
          <FormItem
            label="Nhóm lỗi"
            name={["loi", "tits_qtsx_NhomLoi_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={tits_qtsx_NhomLoi_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListNhomLoi ? ListNhomLoi : []}
              placeholder="Chọn nhóm lỗi"
              optionsvalue={["id", "tenNhomLoi"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Mô tả"
            name={["loi", "moTa"]}
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

export default LoiForm;
