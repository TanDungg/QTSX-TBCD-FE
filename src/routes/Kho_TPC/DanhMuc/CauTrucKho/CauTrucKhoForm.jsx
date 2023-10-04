import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { Input, TreeSelect, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams, getLocalStorage } from "src/util/Common";

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
  const INFO = getLocalStorage("menu");
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [listCauTrucKho, setListCauTrucKho] = useState([]);
  const [listPhongBan, setListPhongBan] = useState([]);
  const [disableViTri, setDisableViTri] = useState(true);
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
      getPhongBan();
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
        if (newData.cauTrucKho_Id === null) {
          newData.cauTrucKho_Id = "root";
        } else {
          setDisableViTri(false);
        }
        setFieldsValue({
          CauTrucKho: { ...newData, sucChua: newData.sucChua.toString() },
        });
        getListCauTrucKho(newData.phongBan_Id);
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách CauTrucKho
   *
   */
  const getPhongBan = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Phongban/phong-ban-tree?donviid=${INFO.donVi_Id}`,
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
        if (res && res.data) {
          setListPhongBan(res.data);
        } else {
          setListPhongBan([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách CauTrucKho
   *
   */
  const getListCauTrucKho = async (phongBan_Id) => {
    const params = convertObjectToUrlParams({
      donviid: INFO.donVi_Id,
      phongBan_Id: phongBan_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-tree?${params}`,
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
    saveData(values.CauTrucKho);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.CauTrucKho, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (CauTrucKho, saveQuit = false) => {
    if (type === "new") {
      const newUser = CauTrucKho;
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
      const editUser = { ...item, ...CauTrucKho };
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
  const handleSelectPhongBan = (val) => {
    getListCauTrucKho(val);
  };

  /**
   * Quay lại trang cấu trúc kho
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
              name={["CauTrucKho", "sucChua"]}
              rules={[
                {
                  type: "string",
                },
                {
                  max: 250,
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập sức chứa" />
            </FormItem>
            <FormItem
              label="Ban/Phòng"
              name={["CauTrucKho", "phongBan_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <TreeSelect
                className="tree-select-item"
                datatreeselect={listPhongBan}
                name="PhongBan"
                options={["id", "tenPhongBan", "children"]}
                placeholder="Chọn Ban/Phòng"
                style={{ width: "100%" }}
                onSelect={handleSelectPhongBan}
              />
            </FormItem>
            <FormItem
              label="Cấu trúc kho cha"
              name={["CauTrucKho", "cauTrucKho_Id"]}
              rules={[
                {
                  type: "string",
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
                onSelect={(val) => {
                  if (val !== "root") setDisableViTri(false);
                }}
              />
            </FormItem>
            <FormItem
              label="Vị trí"
              name={["CauTrucKho", "viTri"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập vị trí"
                disabled={disableViTri}
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
