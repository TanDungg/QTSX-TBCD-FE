import { Form, Card, Col, Switch } from "antd";
import React, { useEffect, useState } from "react";
import { FormSubmit } from "src/components/Common";
import { useDispatch } from "react-redux";
import { Select } from "src/components/Common";
import { DEFAULT_FORM_ADD_130PX } from "src/constants/Config";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { includes } from "lodash";

const FormItem = Form.Item;
const initialState = {
  isActive_Role: true,
  roleNames: [],
};

function NguoiDungForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { roleNames, isActive_Role } = initialState;
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue, validateFields } = form;
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [roleSelect, setRoleSelect] = useState([]);
  const [ListNguoiDung, setListNguoiDung] = useState();
  const [id, setId] = useState();

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getUserActive(INFO.donVi_Id, INFO.phanMem_Id);
        getRole(INFO);
      } else if (permission && !permission.add) {
        history.push("/home");
      }
    } else {
      if (permission && permission.edit) {
        setType("edit");
        const { id } = match.params;
        setId(id);
        getUserInfo(id);
        getRole(INFO);
        getInfo(id, INFO);
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserActive = (donvi_Id, phanMem_Id) => {
    let param = convertObjectToUrlParams({ donvi_Id, phanMem_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/list-cbnv-khong-co-quyen-trong-phan-mem?${param}`,
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
              name: `${dt.maNhanVien} - ${dt.fullName}${
                dt.email ? ` - ${dt.email}` : ""
              }`,
            };
          });
          setListNguoiDung(newData);
        }
      })
      .catch((error) => console.error(error));
  };

  const getUserInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Account/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListNguoiDung([
            {
              name: `${res.data.maNhanVien} - ${res.data.fullName} - ${res.data.email}`,
              id: res.data.id,
            },
          ]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getRole = (info) => {
    const param = convertObjectToUrlParams({
      DonVi_id: info.donVi_Id,
      PhanMem_Id: info.phanMem_Id,
    });

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Role?${param}`,
          "GET",
          null,
          "LIST",
          "listRole",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setRoleSelect(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id, info) => {
    const params = convertObjectToUrlParams({
      user_Id: id,
      donVi_Id: info.donVi_Id,
      phanMem_id: info.phanMem_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem/user-cbnv-role-by-id?${params}`,
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
          const listRole = JSON.parse(res.data[0].chiTietRoles).map((ct) => {
            return ct.role_Id.toLowerCase();
          });
          const newData = {
            id: res.data[0].user_Id,
            roleNames: listRole,
          };
          setFieldsValue({ user: newData });
        }
      })
      .catch((error) => console.error(error));
  };

  const onFinish = (values) => {
    saveData(values.user);
  };
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.user, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...user,
        donVi_Id: INFO.donVi_Id,
        phanMem_Id: INFO.phanMem_Id,
        chiTietRoles: user.roleNames.map((r) => {
          return { role_Id: r };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Account/role-cbnv?id=${user.id}`,
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
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    } else {
      const newData = {
        ...user,
        donVi_Id: INFO.donVi_Id,
        phanMem_Id: INFO.phanMem_Id,
        chiTietRoles: user.roleNames.map((r) => {
          return { role_Id: r };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Account/role-cbnv?id=${user.id}`,
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
            if (saveQuit) {
              goBack();
            } else {
              setFieldTouch(false);
              getInfo(id, INFO);
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };
  const titile =
    type === "new" ? "Thêm mới người dùng" : "Chỉnh sửa người dùng";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={titile} back={goBack} />

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
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Nhân viên"
              name={["user", "id"]}
              rules={[
                {
                  data: "string",
                  required: true,
                },
                {
                  max: 50,
                  message: "Mã thiết bị không được quá 50 ký tự",
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListNguoiDung ? ListNguoiDung : []}
                placeholder="Tìm nhân viên"
                optionsvalue={["id", "name"]}
                style={{ width: "100%" }}
                optionFilterProp={"name"}
                showSearch
                disabled={type === "edit" ? true : false}
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Vai trò"
              name={["user", "roleNames"]}
              rules={[
                {
                  type: "array",
                  required: true,
                },
              ]}
              initialValue={roleNames}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={roleSelect ? roleSelect : []}
                placeholder="Chọn vai trò"
                optionsvalue={["id", "name"]}
                style={{ width: "100%" }}
                mode={"multiple"}
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Hoạt động"
              name={["user", "isActive_Role"]}
              initialValue={isActive_Role}
              valuePropName="checked"
            >
              <Switch />
            </FormItem>
          </Col>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
    </div>
  );
}

export default NguoiDungForm;
