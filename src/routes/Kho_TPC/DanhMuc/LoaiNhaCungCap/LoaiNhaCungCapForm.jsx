import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { Input, TreeSelect, FormSubmit } from "src/components/Common";
import {
  fetchStart,
  fetchReset,
  fetchResetItem,
} from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";

const FormItem = Form.Item;

const initialState = {
  maLoaiNhaCungCap: "",
  tenLoaiNhaCungCap: "",
  LoaiNhaCungCap_Id: "root",
};

function LoaiNhaCungCapForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading, item } = useSelector(({ common }) => common).toJS();

  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListLoaiNhaCungCap, setListLoaiNhaCungCap] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);
  const { maLoaiNhaCungCap, tenLoaiNhaCungCap, LoaiNhaCungCap_Id } =
    initialState;

  const { setFieldsValue, validateFields, resetFields } = form;
  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getInfo(match.params.id);
        }
      }
    }
    if (permission && (permission.add || permission.edit)) {
      // Lấy danh sách menu
      getListLoaiNhaCungCap();
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
        fetchStart(
          `LoaiNhaCungCap/${id}`,
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
        const newData = res.data;
        if (newData.LoaiNhaCungCap_Id === null)
          newData.LoaiNhaCungCap_Id = "root";
        setFieldsValue({
          LoaiNhaCungCap: newData,
        });
      })
      .catch((error) => console.error(error));
  };

  /**
   * Lấy danh sách menu
   *
   */
  const getListLoaiNhaCungCap = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "LoaiNhaCungCap/loai-nha-cung-cap-tree",
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        setListLoaiNhaCungCap([]);
        const newList = { id: "root", tenLoaiNhaCungCap: "Root", children: [] };
        setListLoaiNhaCungCap([newList, ...res.data]);
      })
      .catch((error) => console.error(error));
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.LoaiNhaCungCap);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.LoaiNhaCungCap, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (LoaiNhaCungCap, saveQuit = false) => {
    if (type === "new") {
      const newUser = LoaiNhaCungCap;
      newUser.LoaiNhaCungCap_Id =
        newUser.LoaiNhaCungCap_Id === "root" ? null : newUser.LoaiNhaCungCap_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `LoaiNhaCungCap`,
            "POST",
            newUser,
            "ADD",
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
            resetFields();
            setFieldTouch(false);
            getListLoaiNhaCungCap();
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const editUser = { ...item, ...LoaiNhaCungCap };
      editUser.LoaiNhaCungCap_Id =
        editUser.LoaiNhaCungCap_Id === "root"
          ? (editUser.LoaiNhaCungCap_Id = null)
          : editUser.LoaiNhaCungCap_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `LoaiNhaCungCap/${id}`,
            "PUT",
            editUser,
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
   * Quay lại trang loại nhà cung cấp
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
    type === "new"
      ? "Thêm mới loại nhà cung cấp"
      : "Chỉnh sửa loại nhà cung cấp";

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
              label="Mã loại nhà cung cấp"
              name={["LoaiNhaCungCap", "maLoaiNhaCungCap"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={maLoaiNhaCungCap}
            >
              <Input
                className="input-item"
                placeholder="Nhập loại nhà cung cấp"
              />
            </FormItem>
            <FormItem
              label="Tên loại nhà cung cấp"
              name={["LoaiNhaCungCap", "tenLoaiNhaCungCap"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={tenLoaiNhaCungCap}
            >
              <Input
                className="input-item"
                placeholder="Nhập tên nhà cung cấp"
              />
            </FormItem>
            <FormItem
              label="Chọn loại nhà cung cấp cha"
              name={["LoaiNhaCungCap", "LoaiNhaCungCap_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={LoaiNhaCungCap_Id}
            >
              <TreeSelect
                className="tree-select-item"
                datatreeselect={ListLoaiNhaCungCap}
                name="menu"
                options={["id", "tenLoaiNhaCungCap", "children"]}
                placeholder="Chọn menu cha"
                style={{ width: "100%" }}
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

export default LoaiNhaCungCapForm;
