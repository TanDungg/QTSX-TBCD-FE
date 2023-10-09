import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { Input, TreeSelect, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";

const FormItem = Form.Item;

const initialState = {
  nhomVatTu_Id: "root",
};

function NhomVatTuForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading, item } = useSelector(({ common }) => common).toJS();

  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListNhomVatTu, setListNhomVatTu] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);
  const { nhomVatTu_Id } = initialState;

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
      getListNhomVatTu();
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
          `NhomVatTu/${id}`,
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
        if (newData.nhomVatTu_Id === null) newData.nhomVatTu_Id = "root";
        setFieldsValue({
          NhomVatTu: newData,
        });
      })
      .catch((error) => console.error(error));
  };

  /**
   * Lấy danh sách menu
   *
   */
  const getListNhomVatTu = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "NhomVatTu/nhom-vat-tu-tree",
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
        setListNhomVatTu([]);
        const newList = { id: "root", tenNhomVatTu: "Root", children: [] };
        setListNhomVatTu([newList, ...res.data]);
      })
      .catch((error) => console.error(error));
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.NhomVatTu);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.NhomVatTu, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (NhomVatTu, saveQuit = false) => {
    if (type === "new") {
      const newNhomVatTu = NhomVatTu;
      newNhomVatTu.nhomVatTu_Id =
        newNhomVatTu.nhomVatTu_Id === "root" ? null : newNhomVatTu.nhomVatTu_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `NhomVatTu`,
            "POST",
            newNhomVatTu,
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
            getListNhomVatTu();
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const editNhomVatTu = { ...item, ...NhomVatTu };
      editNhomVatTu.nhomVatTu_Id =
        editNhomVatTu.nhomVatTu_Id === "root"
          ? (editNhomVatTu.nhomVatTu_Id = null)
          : editNhomVatTu.nhomVatTu_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `NhomVatTu/${id}`,
            "PUT",
            editNhomVatTu,
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
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const formTitle =
    type === "new" ? "Thêm mới nhóm vật tư" : "Chỉnh sửa nhóm vật tư";

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
              label="Mã nhóm vật tư"
              name={["NhomVatTu", "maNhomVatTu"]}
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
              <Input className="input-item" placeholder="Nhập nhóm vật tư" />
            </FormItem>
            <FormItem
              label="Tên nhóm vật tư"
              name={["NhomVatTu", "tenNhomVatTu"]}
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
                placeholder="Nhập tên nhóm vật tư"
              />
            </FormItem>
            <FormItem
              label="Chọn nhóm vật tư cha"
              name={["NhomVatTu", "nhomVatTu_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={nhomVatTu_Id}
            >
              <TreeSelect
                className="tree-select-item"
                datatreeselect={ListNhomVatTu}
                name="menu"
                options={["id", "tenNhomVatTu", "children"]}
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

export default NhomVatTuForm;
