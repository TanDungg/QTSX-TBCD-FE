import { Card, Form, Input } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";

const FormItem = Form.Item;

const initialState = {
  maPhanMemDonVi: "",
  tenPhanMemDonVi: "",
};
const PhanMemDonViForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { maPhanMemDonVi, tenPhanMemDonVi } = initialState;
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  const ref = useRef(null);

  useEffect(() => {
    ref.current.focus();
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          // Get info
          const { id } = match.params;
          setId(id);
          // getInfo();
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
   * Lấy thông tin
   *
   */
  const getInfo = () => {
    const { id } = match.params;
    setId(id);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMemDonVi/${id}`,
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
          setFieldsValue({
            PhanMemDonVi: res.data[0],
          });
          setInfo(res.data[0]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Quay lại trang người dùng
   *
   */
  const goBack = () => {
    history.push("/he-thong/phan-mem-don-vi");
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.PhanMemDonVi);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.PhanMemDonVi, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      const newData = user;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `PhanMemDonVi`,
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
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
            }
          } else {
            if (saveQuit) {
              goBack();
            } else {
              setFieldTouch(false);
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      var newData = { ...info, ...user };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `PhanMemDonVi/${id}`,
            "PUT",
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
            getInfo();
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };
  const formTitle =
    type === "new" ? "Thêm phần mềm đơn vị" : "Chỉnh sửa phần mềm đơn vị";
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem
            label="Đơn vị"
            name={["PhanMemDonVi", "tenPhanMemDonVi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 250,
                message: "Tên phần mềm không được quá 250 ký tự",
              },
            ]}
            initialValue={tenPhanMemDonVi}
          >
            <Input className="input-item" placeholder="Nhập tên phần mềm" />
          </FormItem>
          <FormItem
            label="Ban phòng"
            name={["PhanMemDonVi", "tenPhanMemDonVi"]}
            rules={[
              {
                type: "string",
              },
            ]}
            initialValue={tenPhanMemDonVi}
          >
            <Input className="input-item" placeholder="Nhập tên phần mềm" />
          </FormItem>
          <FormItem
            label="Phần mềm"
            name={["PhanMemDonVi", "maPhanMemDonVi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 50,
                message: "Phần mềm không được quá 50 ký tự",
              },
            ]}
            initialValue={maPhanMemDonVi}
          >
            <Input
              className="input-item"
              placeholder="Nhập phần mềm"
              ref={ref}
            />
          </FormItem>
          <FormItem
            label="Người quản trị"
            name={["PhanMemDonVi", "tenPhanMemDonVi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 250,
                message: "Người quản trị không được quá 250 ký tự",
              },
            ]}
            initialValue={tenPhanMemDonVi}
          >
            <Input className="input-item" placeholder="Nhập Người quản trị" />
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
};

export default PhanMemDonViForm;
