import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { Icon } from "@ant-design/compatible";

import { Input, TreeSelect, FormSubmit } from "src/components/Common";
import {
  fetchStart,
  fetchReset,
  fetchResetItem,
} from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams, getLocalStorage } from "src/util/Common";
const FormItem = Form.Item;

const initialState = {
  parent_Id: "root",
};

function ChucNangForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading, item } = useSelector(({ common }) => common).toJS();
  const INFO = getLocalStorage("menu");
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [icon, setIcon] = useState("file-unknown");
  const [listMenu, setListMenu] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);

  const { setFieldsValue, validateFields, resetFields, getFieldsValue } = form;
  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        getListMenu(INFO);
        setType("new");
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getListMenu(INFO);
          getInfo(match.params.id);
        }
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy thông tin info
   *
   * @param {*} id
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Menu/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        const newData = res.data;
        if (newData.parent_Id === null) newData.parent_Id = "root";
        setFieldsValue({
          chucNang: newData,
        });
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách menu
   *
   */
  const getListMenu = (info) => {
    const param = convertObjectToUrlParams({
      PhanMem_Id: info.phanMem_Id,
      DonVi_Id: info.donVi_Id,
    });

    dispatch(fetchResetItem("listMenu"));
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Menu/menu-tree?${param}`,
          "GET",
          null,
          "LIST",
          "listMenu",
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

  const { parent_Id } = initialState;
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.chucNang);
  };

  const onChangeIcon = (e) => {
    setIcon(e.target.value);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.chucNang, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (chucNang, saveQuit = false) => {
    if (type === "new") {
      chucNang.phanMem_Id = INFO.phanMem_Id;
      chucNang.donVi_Id = INFO.donVi_Id;
      const newChucNang = chucNang;
      newChucNang.parent_Id =
        newChucNang.parent_Id === "root" ? null : newChucNang.parent_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Menu`, "POST", newChucNang, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (saveQuit) {
            goBack();
          } else {
            resetFields();
            setFieldTouch(false);
            getListMenu(INFO);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const editChucNang = { id, ...item, ...chucNang };
      editChucNang.parent_Id =
        editChucNang.parent_Id === "root"
          ? (editChucNang.parent_Id = null)
          : editChucNang.parent_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Menu/${id}`,
            "PUT",
            editChucNang,
            "EDIT",
            "",
            resolve,
            reject
          )
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

  /**
   * Quay lại trang danh sách menu
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

  const formTitle =
    type === "new" ? "Thêm mới chức năng" : "Chỉnh sửa chức năng";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Spin spinning={loading}>
          <Form
            {...DEFAULT_FORM_CUSTOM}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Tên menu"
              name={["chucNang", "tenMenu"]}
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
            <FormItem
              label="Chọn menu cha"
              name={["chucNang", "parent_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={parent_Id}
            >
              <TreeSelect
                className="tree-select-item"
                datatreeselect={listMenu}
                name="menu"
                options={["id", "tenMenu", "children"]}
                placeholder="Chọn menu cha"
                style={{ width: "100%" }}
                // treeDefaultExpandAll
              />
            </FormItem>
            <FormItem
              label="Path"
              name={["chucNang", "url"]}
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
            <FormItem
              label="Icon"
              name={["chucNang", "icon"]}
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

export default ChucNangForm;
