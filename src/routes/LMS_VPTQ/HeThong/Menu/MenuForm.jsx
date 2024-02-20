import React, { useState, useEffect } from "react";
import { Card, Col, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { Icon } from "@ant-design/compatible";
import { Input, TreeSelect, FormSubmit } from "src/components/Common";
import {
  fetchStart,
  fetchReset,
  fetchResetItem,
} from "src/appRedux/actions/Common";
import { DEFAULT_FORM_ADD_150PX } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";

const FormItem = Form.Item;
const initialState = {
  parent_Id: "root",
};

function MenuForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { parent_Id } = initialState;
  const [form] = Form.useForm();
  const { setFieldsValue, validateFields, resetFields } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [icon, setIcon] = useState("file-unknown");
  const [ListMenu, setListMenu] = useState([]);
  const [id, setId] = useState(undefined);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        getListMenu();
        setType("new");
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getListMenu();
          getInfo(match.params.id);
        }
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Menu/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        setFieldsValue({
          menu: {
            ...res.data,
            parent_Id: res.data.parent_Id ? res.data.parent_Id : "root",
          },
        });
      })
      .catch((error) => console.error(error));
  };

  const getListMenu = () => {
    const param = convertObjectToUrlParams({
      PhanMem_Id: INFO.phanMem_Id,
      DonVi_Id: INFO.donVi_Id,
    });

    dispatch(fetchResetItem("ListMenu"));
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Menu/menu-tree?${param}`,
          "GET",
          null,
          "LIST",
          "ListMenu",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        setListMenu([]);
        const newList = { id: "root", tenMenu: "Root", children: [] };
        setListMenu([newList, ...res.data]);
      })
      .catch((error) => console.error(error));
  };

  const onFinish = (values) => {
    saveData(values.menu);
  };

  const onChangeIcon = (e) => {
    setIcon(e.target.value);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.menu, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (menu, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...menu,
        tapDoan_Id: INFO.tapDoan_Id,
        phanMem_Id: INFO.phanMem_Id,
        donVi_Id: INFO.donVi_Id,
        parent_Id: menu.parent_Id === "root" ? null : menu.parent_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Menu`, "POST", newData, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (saveQuit) {
            goBack();
          } else {
            resetFields();
            setFieldTouch(false);
            getListMenu();
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...menu,
        id: id,
        parent_Id: menu.parent_Id === "root" ? null : menu.parent_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Menu/${id}`, "PUT", newData, "EDIT", "", resolve, reject)
        );
      })
        .then((res) => {
          if (saveQuit) {
            goBack();
          } else {
            setFieldTouch(false);
            getInfo(id);
          }
        })
        .catch((error) => console.log(error));
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

  const formTitle =
    type === "new" ? "Thêm mới chức năng" : "Chỉnh sửa chức năng";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom"
        align="center"
        style={{ width: "100%" }}
      >
        <Spin spinning={loading}>
          <Form
            {...DEFAULT_FORM_ADD_150PX}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
              <FormItem
                label="Tên menu"
                name={["menu", "tenMenu"]}
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
                <Input className="input-item" placeholder="Nhập tên menu" />
              </FormItem>
            </Col>
            <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
              <FormItem
                label="Chọn menu cha"
                name={["menu", "parent_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
                initialValue={parent_Id}
              >
                <TreeSelect
                  className="tree-select-item"
                  datatreeselect={ListMenu}
                  name="menu"
                  options={["id", "tenMenu", "children"]}
                  placeholder="Chọn menu cha"
                  style={{ width: "100%" }}
                />
              </FormItem>
            </Col>
            <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
              <FormItem
                label="Path"
                name={["menu", "url"]}
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
                <Input className="input-item" placeholder="Nhập đường dẫn" />
              </FormItem>
            </Col>
            <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
              <FormItem
                label="Icon"
                name={["menu", "icon"]}
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
                <Input
                  className="input-item"
                  placeholder="Nhập tên icon"
                  addonAfter={<Icon type={icon} />}
                  onChange={onChangeIcon}
                />
              </FormItem>
            </Col>
            <FormSubmit
              goBack={goBack}
              saveAndClose={saveAndClose}
              disabled={fieldTouch}
            />
          </Form>
        </Spin>
      </Card>
    </div>
  );
}

export default MenuForm;
