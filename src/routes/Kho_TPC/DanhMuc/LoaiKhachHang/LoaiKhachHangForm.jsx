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
  maKhachHang: "",
  tenKhachHang: "",
  LoaiKhachHang_Id: "root",
};

function LoaiKhachHangForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading, item } = useSelector(({ common }) => common).toJS();

  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListLoaiKhachHang, setListLoaiKhachHang] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);
  const { maKhachHang, tenKhachHang, LoaiKhachHang_Id } = initialState;

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
      getListLoaiKhachHang();
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
          `LoaiKhachHang/${id}`,
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
        if (newData.LoaiKhachHang_Id === null)
          newData.LoaiKhachHang_Id = "root";
        setFieldsValue({
          LoaiKhachHang: newData,
        });
      })
      .catch((error) => console.error(error));
  };

  /**
   * Lấy danh sách menu
   *
   */
  const getListLoaiKhachHang = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "LoaiKhachHang/loai-khach-hang-tree",
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
        setListLoaiKhachHang([]);
        const newList = { id: "root", tenLoaiKhachHang: "Root", children: [] };
        setListLoaiKhachHang([newList, ...res.data]);
      })
      .catch((error) => console.error(error));
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.LoaiKhachHang);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.LoaiKhachHang, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (LoaiKhachHang, saveQuit = false) => {
    if (type === "new") {
      const newUser = LoaiKhachHang;
      newUser.LoaiKhachHang_Id =
        newUser.LoaiKhachHang_Id === "root" ? null : newUser.LoaiKhachHang_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `LoaiKhachHang`,
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
            getListLoaiKhachHang();
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const editUser = { ...item, ...LoaiKhachHang };
      editUser.LoaiKhachHang_Id =
        editUser.LoaiKhachHang_Id === "root"
          ? (editUser.LoaiKhachHang_Id = null)
          : editUser.LoaiKhachHang_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `LoaiKhachHang/${id}`,
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
    history.push("/danh-muc-kho-tpc/loai-khach-hang");
  };

  const formTitle =
    type === "new" ? "Thêm mới loại khách hàng" : "Chỉnh sửa loại khách hàng";

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
              label="Mã loại khách hàng"
              name={["LoaiKhachHang", "maLoaiKhachHang"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={maKhachHang}
            >
              <Input
                className="input-item"
                placeholder="Nhập loại khách hàng"
              />
            </FormItem>
            <FormItem
              label="Tên loại khách hàng"
              name={["LoaiKhachHang", "tenLoaiKhachHang"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={tenKhachHang}
            >
              <Input className="input-item" placeholder="Nhập tên khách hàng" />
            </FormItem>
            <FormItem
              label="Chọn loại khách hàng cha"
              name={["LoaiKhachHang", "LoaiKhachHang_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={LoaiKhachHang_Id}
            >
              <TreeSelect
                className="tree-select-item"
                datatreeselect={ListLoaiKhachHang}
                name="menu"
                options={["id", "tenLoaiKhachHang", "children"]}
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

export default LoaiKhachHangForm;
