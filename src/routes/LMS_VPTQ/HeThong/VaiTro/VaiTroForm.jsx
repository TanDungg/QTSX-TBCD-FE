import React, { useState, useEffect } from "react";
import { Form, Card, Spin, Col } from "antd";
import { useDispatch, useSelector } from "react-redux";
import includes from "lodash/includes";
import { Input, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_ADD_130PX } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { getLocalStorage, getTokenInfo } from "src/util/Common";

const FormItem = Form.Item;

function VaiTroForm({ history, match, permission }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { setFieldsValue, resetFields, validateFields } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);

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
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Role/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res.data) {
          setFieldsValue({
            vaitro: res.data,
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const onFinish = (values) => {
    saveData(values.vaitro);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.vaitro, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (vaitro, saveQuit = false) => {
    const newData = {
      ...vaitro,
      tapDoan_Id: INFO.tapDoan_Id,
      donVi_Id: INFO.donVi_Id,
      phanMem_Id: INFO.phanMem_Id,
    };
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Role`, "POST", newData, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (saveQuit) {
            if (res.status !== 409) goBack();
          } else {
            resetFields();
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...vaitro,
        id: id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Role/${id}`, "PUT", newData, "EDIT", "", resolve, reject)
        );
      })
        .then((res) => {
          if (saveQuit) {
            if (res.status !== 409) goBack();
          } else {
            getInfo(id);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${id}/chinh-sua`,
        ""
      )}`
    );
  };

  const formTitle = type === "new" ? "Thêm mới vai trò" : "Chỉnh sửa vai trò";
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
            {...DEFAULT_FORM_ADD_130PX}
            form={form}
            name="vai-tro-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
              <FormItem
                label="Mã quyền"
                name={["vaitro", "name"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                    max: 255,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="MAQUYEN_PHANMEM_DONVI"
                />
              </FormItem>
            </Col>
            <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
              <FormItem
                label="Tên quyền"
                name={["vaitro", "description"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                    max: 255,
                  },
                ]}
              >
                <Input className="input-item" placeholder="Nhập tên quyền" />
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

export default VaiTroForm;
