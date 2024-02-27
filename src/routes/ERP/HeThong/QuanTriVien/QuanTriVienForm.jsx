import { Form, Card, Switch } from "antd";
import React, { useEffect, useState } from "react";
import { FormSubmit } from "src/components/Common";
import { useDispatch } from "react-redux";
import { Select } from "src/components/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { includes } from "lodash";
const FormItem = Form.Item;
const initialState = {
  maNhanVien: "",
  isActive: true,
  roleNames: [],
};
function QuanTriVienForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields } = form;
  const { maNhanVien, isActive, roleNames } = initialState;
  const [roleSelect, setRoleSelect] = useState([]);
  const [UserSelect, setUserSelect] = useState();
  const { resetFields, setFieldsValue } = form;
  const [PhanMemSelect, setPhanMemSelect] = useState([]);
  const [DonViSelect, setDonViSelect] = useState([]);
  const [Role_Id, setRole_Id] = useState();
  const [DonVi, setDonVi] = useState("");

  const [type, setType] = useState("new");

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getPhanMem();
          getUserActive();
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          // Get info
          const params = match.params.id.split("_");
          getUserActive();
          setRole_Id(params[1]);
          getInfo(params[0], params[1]);
          getDonVi(params[0]);
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
   * Lấy list phần mềm
   *
   */
  const getPhanMem = (donVi_Id) => {
    let param = convertObjectToUrlParams({ donVi_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem/list-phan-mem-by-donvi?${param}`,
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
          setPhanMemSelect(res.data);
        } else {
          setPhanMemSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   * @param pageSize
   */
  const getUserActive = () => {
    let param = convertObjectToUrlParams({ key: 1 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv-add-role?${param}`,
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
              name: d.email
                ? `${d.maNhanVien} - ${d.fullName} - ${d.email}`
                : `${d.maNhanVien} - ${d.fullName}`,
              ...d,
            });
          });
          setUserSelect(newData);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Load danh sách đơn vị theo user
   * @param id Id user
   */
  const getDonVi = (id) => {
    let param = convertObjectToUrlParams({ user_Id: id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem/list-don-vi-for-user?${param}`,
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
          const newData = JSON.parse(res.data.chitiet);
          setDonViSelect(newData);
        } else {
          setDonViSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getRole = (phanMemId, donViId) => {
    const param = convertObjectToUrlParams({
      PhanMem_Id: phanMemId,
      DonVi_id: donViId ? donViId : DonVi,
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
          const newData = [];
          res.data.forEach(
            (dt) =>
              dt.name.toLowerCase().includes("administrator") &&
              newData.push(dt)
          );
          setRoleSelect(newData);
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
            nameId: res.data.phanMem_Id,
            id: res.data.id,
            roleNames: res.data.role_Id,
            isActive: res.data.isActive_Role,
            donVi_Id: res.data.donVi_Id.toUpperCase(),
          };
          getPhanMem(res.data.donVi_Id);
          getRole(res.data.phanMem_Id, res.data.donVi_Id);
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
    const newData = {
      id: user.id,
      isActive: user.isActive,
      role_Id: user.roleNames,
      roleold_Id: Role_Id,
    };
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Account/user-administrator?id=${newData.id}`,
            "POST",
            [newData],
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
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Account/user-administrator`,
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
          // if (saveQuit) {
          if (res.status !== 409) goBack();
          // } else {
          //   if (res.status !== 409) {
          //     getInfo(id, Role_Id);
          //   }
          // }
        })
        .catch((error) => console.error(error));
    }
  };

  /**
   * Quay lại trang danh sách phần mềm
   *
   */
  const goBack = () => {
    history.push("/he-thong-erp/quan-tri-vien");
  };
  const titile =
    type === "new" ? "Thêm mới quản trị viên" : "Chỉnh sửa quản trị viên";
  const onSelectPhanMem = (values) => {
    getRole(values);
    setFieldsValue({ user: { roleNames: null } });
  };
  const hanleSelectUser = (val) => {
    getDonVi(val);
    setFieldsValue({ user: { roleNames: null, donVi_Id: null, nameId: null } });
  };
  const hanleSelectDonVi = (val) => {
    setDonVi(val);
    getPhanMem(val);
    setFieldsValue({ user: { roleNames: null, nameId: null } });
  };
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
              onSelect={hanleSelectUser}
              disabled={type === "edit" ? true : false}
            />
          </FormItem>
          <FormItem
            label="Đơn vị"
            name={["user", "donVi_Id"]}
            rules={[
              {
                data: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={DonViSelect ? DonViSelect : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["DonVi_Id", "tenDonVi"]}
              style={{ width: "100%" }}
              optionFilterProp={"name"}
              showSearch
              onSelect={hanleSelectDonVi}
            />
          </FormItem>
          <FormItem
            label="Phần mềm"
            name={["user", "nameId"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 250,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={PhanMemSelect ? PhanMemSelect : []}
              placeholder="Chọn phần mềm"
              optionsvalue={["phanMem_Id", "tenPhanMem"]}
              style={{ width: "100%" }}
              optionFilterProp={"name"}
              showSearch
              onSelect={onSelectPhanMem}
            />
          </FormItem>
          <FormItem
            label="Vai trò"
            name={["user", "roleNames"]}
            rules={[
              {
                type: "string",
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
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
    </div>
  );
}

export default QuanTriVienForm;
