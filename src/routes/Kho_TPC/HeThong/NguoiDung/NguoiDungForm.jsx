import { Form, Card, Switch, Input } from "antd";
import React, { useEffect, useState } from "react";
import { FormSubmit } from "src/components/Common";
import { useDispatch } from "react-redux";
import { Select } from "src/components/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, getLocalStorage } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { includes } from "lodash";
const FormItem = Form.Item;
const initialState = {
  maNhanVien: "",
  isActive: true,
  roleNames: [],
};
function NguoiDungForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const INFO = getLocalStorage("menu");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { maNhanVien, isActive, roleNames } = initialState;
  const [roleSelect, setRoleSelect] = useState([]);
  const [UserSelect, setUserSelect] = useState();
  const { resetFields, setFieldsValue, validateFields } = form;
  const [info, setInfo] = useState();
  const [Role_Id, setRole_Id] = useState();

  const [type, setType] = useState("new");

  useEffect(() => {
    const load = () => {
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
          // Get info
          const params = match.params.id.split("_");
          setInfo(params);
          getUserInfo(params[0]);
          getRole(INFO);
          setRole_Id(params[1]);
          getInfo(params[0], params[1]);
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
   * Load danh sách người dùng chưa active của phần mềm và đơn vị
   * @param donviId
   * @param phanMemId
   */
  const getUserActive = (donviId, phanMemId) => {
    let param = convertObjectToUrlParams({ donviId, phanMemId });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/Get-NonActive-User?${param}`,
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
          const newData = [];
          res.data.forEach((d) => {
            newData.push({
              name: `${d.maNhanVien} - ${d.fullName} - ${d.email}`,
              ...d,
            });
          });
          setUserSelect(newData);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Load info người dùng
   * @param id
   */
  const getUserInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Account/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setUserSelect([
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
  const getInfo = (id, role_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/user-administrator?id=${id}&&role_Id=${role_Id}`,
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
          const newData = {
            id: res.data.id,
            roleNames: res.data.role_Id,
            isActive: res.data.isActive_Role,
          };
          setFieldsValue({ user: newData });
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.user, true);
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
        id: user.id,
        isActive: user.isActive,
        donVi_Id: INFO.donVi_Id,
        phanMem_Id: INFO.phanMem_Id,
        chiTietRoles: user.roleNames.map((r) => {
          return { role_Id: r };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Account/user-cbnv?id=${newData.id}`,
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
          if (saveQuit) {
            if (res.status !== 409) goBack();
          } else {
            if (res.status !== 409) {
              resetFields();
              setFieldTouch(false);
            }
          }
        })
        .catch((error) => console.error(error));
    } else {
      const newData = {
        id: user.id,
        isActive: user.isActive,
        donVi_Id: INFO.donVi_Id,
        phanMem_Id: INFO.phanMem_Id,
        chiTietRoles: [
          {
            role_Id: user.roleNames[0],
          },
        ],
        chiTietRolesOld: [
          {
            roleold_Id: info[1],
          },
        ],
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Account/user-cbnv`,
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
            if (res.status !== 409) {
              getInfo(info[0], Role_Id);
            }
          }
        })
        .catch((error) => console.error(error));
    }
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
  const titile =
    type === "new" ? "Thêm mới người dùng" : "Chỉnh sửa người dùng";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={titile} back={goBack} />

      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
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
            initialValue={maNhanVien}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={UserSelect ? UserSelect : []}
              placeholder="Tìm nhân viên"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              optionFilterProp={"name"}
              showSearch
              disabled={type === "edit" ? true : false}
            />
          </FormItem>
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
              mode={type === "edit" ? "none" : "multiple"}
            />
          </FormItem>

          <FormItem
            label="Hoạt động"
            name={["user", "isActive"]}
            valuePropName="checked"
            initialValue={isActive}
          >
            <Switch />
          </FormItem>
          <FormSubmit
            goBack={goBack}
            // saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
    </div>
  );
}

export default NguoiDungForm;
