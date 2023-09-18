import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { Input, TreeSelect, FormSubmit, Select } from "src/components/Common";
import {
  fetchStart,
  fetchReset,
  fetchResetItem,
} from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";

const FormItem = Form.Item;

const initialState = {
  maCauTrucKho: "",
  tenCauTrucKho: "",
  cauTrucKho_Id: "root",
};

function CauTrucKhoForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading, item } = useSelector(({ common }) => common).toJS();

  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [listCauTrucKho, setListCauTrucKho] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);

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
      // Lấy danh sách CauTrucKho
      getListCauTrucKho();
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
          `CauTrucKho/${id}`,
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
        if (newData.cauTrucKho_Id === null) newData.cauTrucKho_Id = "root";
        setFieldsValue({
          chucNang: newData,
        });
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách CauTrucKho
   *
   */
  const getBoPhan = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart("CauTrucKho", "GET", null, "LIST", "", resolve, reject)
      );
    })
      .then((res) => {
        setListCauTrucKho([]);
        const newList = { id: "root", tenCauTrucKho: "Root", children: [] };
        setListCauTrucKho([newList, ...res.data]);
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách CauTrucKho
   *
   */
  const getListCauTrucKho = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart("CauTrucKho", "GET", null, "LIST", "", resolve, reject)
      );
    })
      .then((res) => {
        setListCauTrucKho([]);
        const newList = { id: "root", tenCauTrucKho: "Root", children: [] };
        setListCauTrucKho([newList, ...res.data]);
      })
      .catch((error) => console.error(error));
  };

  const { maCauTrucKho, tenCauTrucKho, cauTrucKho_Id } = initialState;
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.chucNang);
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
      const newUser = chucNang;
      newUser.cauTrucKho_Id =
        newUser.cauTrucKho_Id === "root" ? null : newUser.cauTrucKho_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`CauTrucKho`, "POST", newUser, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (saveQuit) {
            goBack();
          } else {
            resetFields();
            setFieldTouch(false);
            getListCauTrucKho();
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const editUser = { ...item, ...chucNang };
      editUser.cauTrucKho_Id =
        editUser.cauTrucKho_Id === "root"
          ? (editUser.cauTrucKho_Id = null)
          : editUser.cauTrucKho_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `CauTrucKho/${id}`,
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
   * Quay lại trang chức năng
   *
   */
  const goBack = () => {
    history.push("/danh-muc-kho-tpc/san-pham");
  };

  const formTitle =
    type === "new" ? "Thêm mới cấu trúc kho" : "Chỉnh sửa cấu trúc kho";

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
              label="Mã cấu trúc kho"
              name={["CauTrucKho", "maCauTrucKho"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={maCauTrucKho}
            >
              <Input
                className="input-item"
                placeholder="Nhập mã cấu trúc kho"
              />
            </FormItem>
            <FormItem
              label="Tên cấu trúc kho"
              name={["CauTrucKho", "tenCauTrucKho"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={tenCauTrucKho}
            >
              <Input
                className="input-item"
                placeholder="Nhập tên cấu trúc kho"
              />
            </FormItem>
            <FormItem
              label="Sức chứa"
              name={["CauTrucKho", "tenCauTrucKho"]}
              rules={[
                {
                  type: "string",
                },
                {
                  max: 250,
                },
              ]}
              initialValue={tenCauTrucKho}
            >
              <Input className="input-item" placeholder="Nhập sức chứa" />
            </FormItem>
            <FormItem
              label="Cấu trúc kho cha"
              name={["CauTrucKho", "cauTrucKho_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
              initialValue={cauTrucKho_Id}
            >
              <TreeSelect
                className="tree-select-item"
                datatreeselect={listCauTrucKho}
                name="CauTrucKho"
                options={["id", "tenCauTrucKho", "children"]}
                placeholder="Chọn cấu trúc kho cha"
                style={{ width: "100%" }}
              />
            </FormItem>
            <FormItem
              label="Bộ phận"
              name={["CauTrucKho", "boPhan_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={[]}
                placeholder="Chọn bộ phận"
                optionsvalue={["id", "tenBoPhan"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
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

export default CauTrucKhoForm;
