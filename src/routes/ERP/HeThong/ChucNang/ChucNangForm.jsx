import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { Icon } from "@ant-design/compatible";

import { Input, TreeSelect, FormSubmit, Select } from "src/components/Common";
import {
  fetchStart,
  fetchReset,
  fetchResetItem,
} from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
const FormItem = Form.Item;

const initialState = {
  parent_Id: "root",
};

function ChucNangForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading, item } = useSelector(({ common }) => common).toJS();

  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [icon, setIcon] = useState("file-unknown");
  const [listMenu, setListMenu] = useState([]);
  const [PhanMemSelect, setPhanMemSelect] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);

  const { setFieldsValue, validateFields, resetFields } = form;
  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        getPhanMem();
        setType("new");
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          getPhanMem();
          setType("edit");
          setId(match.params.id);
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
        newData.nameId =
          newData.phanMem_Id +
          "_" +
          newData.tapDoan_Id +
          (newData.donVi_id ? "_" + newData.donVi_id : "") +
          (newData.phongBan_Id ? "_" + newData.phongBan_Id : "");
        getListMenu(newData.nameId);
        setFieldsValue({
          chucNang: newData,
        });
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy list phần mềm
   *
   */
  const getPhanMem = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem/phan-mem-for-menu`,
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
              name:
                dt.tenPhanMem +
                " - " +
                dt.maTapDoan +
                (dt.maDonVi ? " - " + dt.maDonVi : "") +
                (dt.maPhongBan ? " - " + dt.maPhongBan : ""),
              name_Id:
                dt.phanMem_Id +
                "_" +
                dt.TapDoan_Id +
                (dt.donVi_Id ? `_${dt.donVi_Id}` : "") +
                (dt.PhongBan_Id ? `_${dt.PhongBan_Id}` : ""),
            };
          });
          setPhanMemSelect(newData);
        } else {
          setPhanMemSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách menu
   *
   */
  const getListMenu = (nameId) => {
    const exp = nameId.split("_");
    let param = {};
    if (exp.length === 2) {
      param = convertObjectToUrlParams({
        PhanMem_Id: exp[0],
        TapDoan_Id: exp[1],
      });
    } else if (exp.length === 3) {
      param = convertObjectToUrlParams({
        PhanMem_Id: exp[0],
        TapDoan_Id: exp[1],
        DonVi_id: exp[2],
      });
    } else if (exp.length === 4) {
      param = convertObjectToUrlParams({
        PhanMem_Id: exp[0],
        TapDoan_Id: exp[1],
        DonVi_id: exp[2],
        PhongBan_id: exp[3],
      });
    }
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
    const exp = chucNang.nameId.split("_");
    if (exp.length === 2) {
      chucNang.phanMem_Id = exp[0];
      chucNang.tapDoan_Id = exp[1];
    } else if (exp.length === 3) {
      chucNang.phanMem_Id = exp[0];
      chucNang.tapDoan_Id = exp[1];
      chucNang.donVi_Id = exp[2];
    } else if (exp.length === 4) {
      chucNang.phanMem_Id = exp[0];
      chucNang.tapDoan_Id = exp[1];
      chucNang.donVi_Id = exp[2];
      chucNang.phongBan_Id = exp[3];
    }
    if (type === "new") {
      const newUser = chucNang;
      newUser.parent_Id =
        newUser.parent_Id === "root" ? null : newUser.parent_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Menu`, "POST", newUser, "ADD", "", resolve, reject)
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
      const editUser = { ...item, ...chucNang };
      editUser.parent_Id =
        editUser.parent_Id === "root"
          ? (editUser.parent_Id = null)
          : editUser.parent_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Menu/${id}`, "PUT", editUser, "EDIT", "", resolve, reject)
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
   * Quay lại trang chức năng
   *
   */
  const goBack = () => {
    history.push("/he-thong-erp/chuc-nang");
  };

  const formTitle =
    type === "new" ? "Thêm mới chức năng" : "Chỉnh sửa chức năng";
  const onSelectPhanMem = (values) => {
    getListMenu(values);
  };
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
              label="Phần mềm"
              name={["chucNang", "nameId"]}
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
                optionsvalue={["name_Id", "name"]}
                style={{ width: "100%" }}
                optionFilterProp={"name"}
                showSearch
                onSelect={onSelectPhanMem}
              />
            </FormItem>
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
