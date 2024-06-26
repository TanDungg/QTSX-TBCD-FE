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
  maPhongBan: "",
  tenPhongBan: "",
  donVi_Id: "",
  phongBan_Id: "root",
};
const PhongBanHRMForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { maPhongBan, tenPhongBan, donVi_Id, phongBan_Id } = initialState;
  const [donViSelect, setDonViSelect] = useState([]);
  const [PhongBanTree, setPhongBanTree] = useState([]);

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
          `DonVi/don-vi-tree`,
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
        if (res && res.status === 200) {
          setDonViSelect(res.data);
        } else {
          setDonViSelect([]);
        }
      })
      .catch((error) => console.error(error));
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan/phong-ban-tree`,
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
        if (res && res.status === 200) {
          setPhongBanTree(
            res.data.map((dt) => {
              return {
                ...dt,
                name: dt.tenPhongBan + " - " + dt.tenDonVi,
              };
            })
          );
        } else {
          setDonViSelect([]);
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
        fetchStart(`PhongBan/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          const data = res.data;
          setFieldsValue({
            phongban: {
              ...data,
              phongBan_Id: data.phongBan_Id ? data.phongBan_Id : "root",
            },
          });
          setInfo(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Quay lại trang phòng ban
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
    saveData(values.phongban);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.phongban, true);
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
          fetchStart(`PhongBan`, "POST", newData, "ADD", "", resolve, reject)
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
      delete info.donVi;
      var newData = { ...info, ...user };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `PhongBan/${id}`,
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

  const formTitle =
    type === "new" ? "Thêm mới Ban/Phòng" : "Chỉnh sửa Ban/Phòng";
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
            label="Mã Ban/Phòng"
            name={["phongban", "maPhongBan"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 50,
                message: "Mã Ban/Phòng không được quá 50 ký tự",
              },
            ]}
            initialValue={maPhongBan}
          >
            <Input className="input-item" placeholder="Nhập mã Ban/Phòng" />
          </FormItem>
          <FormItem
            label="Tên Ban/Phòng"
            name={["phongban", "tenPhongBan"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 250,
                message: "Tên Ban/Phong không được quá 250 ký tự",
              },
            ]}
            initialValue={tenPhongBan}
          >
            <Input className="input-item" placeholder="Nhập tên Ban/Phong" />
          </FormItem>
          <FormItem
            label="Ban/Phòng cha"
            name={["donvi", "phongBan_Id"]}
            rules={[
              {
                type: "string",
              },
            ]}
            initialValue={phongBan_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={PhongBanTree ? PhongBanTree : []}
              placeholder="Ban/Phòng cha"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              optionFilterProp="name"
              showSearch
            />
          </FormItem>
          <FormItem
            label="Đơn vị"
            name={["phongban", "donVi_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={donVi_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={donViSelect ? donViSelect : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["id", "tenDonVi"]}
              style={{ width: "100%" }}
              optionFilterProp="name"
              showSearch
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

export default PhongBanHRMForm;
