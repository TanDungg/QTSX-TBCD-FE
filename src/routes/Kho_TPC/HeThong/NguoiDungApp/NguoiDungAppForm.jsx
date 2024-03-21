import { Form, Card } from "antd";
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
  roleNames: [],
};
function NguoiDungAppForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const INFO = getLocalStorage("menu");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { maNhanVien, roleNames } = initialState;
  const [roleSelect, setRoleSelect] = useState([]);
  const [UserSelect, setUserSelect] = useState();
  const { resetFields, setFieldsValue, validateFields } = form;
  const [id, setId] = useState();

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
          const { id } = match.params;
          setId(id);
          getRole(INFO);
          getInfo(id, INFO);
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
  const getUserActive = (donVi_Id, phanMemId) => {
    let param = convertObjectToUrlParams({ donVi_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_AppMobile_Menu/get-list-user-chua-kich-hoat?${param}`,
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
                ? `${d.maNhanVien} - ${d.tenNguoiDung} - ${d.email}`
                : `${d.maNhanVien} - ${d.tenNguoiDung}`,
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
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_AppMobile_Menu/get-list-appmobile-menu`,
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
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_AppMobile_Menu/get-menu-user/${id}`,
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
          const listRole = JSON.parse(res.data.lkn_ChiTiets).map((ct) => {
            return ct.lkn_AppMobile_Menu_Id.toLowerCase();
          });
          getUserInfo(res.data.user_Id);
          const newData = {
            id: res.data.user_Id,
            roleNames: listRole,
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
        user_Id: user.id,
        lkn_AppMobile_Menu_Users: user.roleNames.map((r) => {
          return { lkn_AppMobile_Menu_Id: r };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_AppMobile_Menu/post-appmobile-menu-user`,
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
            resetFields();
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    } else {
      const newData = user.roleNames.map((r) => {
        return { lkn_AppMobile_Menu_Id: r };
      });
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_AppMobile_Menu/put-appmobile-menu-user/${id}`,
            "POST",
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
              getInfo(id, INFO);
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
    type === "new"
      ? "Thêm mới người dùng app mobile"
      : "Chỉnh sửa người dùng app mobile";

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
              optionsvalue={["id", "maQuyenMobile"]}
              style={{ width: "100%" }}
              mode={"multiple"}
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
}

export default NguoiDungAppForm;
