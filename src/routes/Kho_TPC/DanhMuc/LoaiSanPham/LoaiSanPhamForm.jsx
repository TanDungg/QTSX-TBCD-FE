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
  maLoaiSP: "",
  tenLoaiSP: "",
  loaiSanPham_Id: "root",
};

function LoaiSanPhamForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading, item } = useSelector(({ common }) => common).toJS();

  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);
  const { maLoaiSP, tenLoaiSP, loaiSanPham_Id } = initialState;

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
      getListLoaiSanPham();
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
          `LoaiSanPham/${id}`,
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
        if (newData.loaiSanPham_Id === null) newData.loaiSanPham_Id = "root";
        setFieldsValue({
          loaiSanPham: newData,
        });
      })
      .catch((error) => console.error(error));
  };

  /**
   * Lấy danh sách menu
   *
   */
  const getListLoaiSanPham = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "LoaiSanPham/loai-san-pham-tree",
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
        setListLoaiSanPham([]);
        const newList = { id: "root", tenLoaiSanPham: "Root", children: [] };
        setListLoaiSanPham([newList, ...res.data]);
      })
      .catch((error) => console.error(error));
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.loaiSanPham);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.loaiSanPham, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (loaiSanPham, saveQuit = false) => {
    if (type === "new") {
      const newUser = loaiSanPham;
      newUser.loaiSanPham_Id =
        newUser.loaiSanPham_Id === "root" ? null : newUser.loaiSanPham_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`LoaiSanPham`, "POST", newUser, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (saveQuit) {
            goBack();
          } else {
            resetFields();
            setFieldTouch(false);
            getListLoaiSanPham();
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const editUser = { ...item, ...loaiSanPham };
      editUser.loaiSanPham_Id =
        editUser.loaiSanPham_Id === "root"
          ? (editUser.loaiSanPham_Id = null)
          : editUser.loaiSanPham_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `LoaiSanPham/${id}`,
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
    history.push("/danh-muc-kho-tpc/loai-san-pham");
  };

  const formTitle =
    type === "new" ? "Thêm mới loại sản phẩm" : "Chỉnh sửa loại sản phẩm";

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
              label="Mã loại sản phẩm"
              name={["loaiSanPham", "maLoaiSanPham"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={maLoaiSP}
            >
              <Input className="input-item" placeholder="Nhập loại sản phẩm" />
            </FormItem>
            <FormItem
              label="Tên loại sản phẩm"
              name={["loaiSanPham", "tenLoaiSanPham"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={tenLoaiSP}
            >
              <Input className="input-item" placeholder="Nhập tên sản phẩm" />
            </FormItem>
            <FormItem
              label="Chọn loại sản phẩm cha"
              name={["loaiSanPham", "loaiSanPham_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={loaiSanPham_Id}
            >
              <TreeSelect
                className="tree-select-item"
                datatreeselect={ListLoaiSanPham}
                name="menu"
                options={["id", "tenLoaiSanPham", "children"]}
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

export default LoaiSanPhamForm;
