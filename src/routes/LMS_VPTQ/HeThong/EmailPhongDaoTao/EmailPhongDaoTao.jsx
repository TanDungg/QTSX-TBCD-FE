import React, { useEffect, useState } from "react";
import { Card, Form, Input, Col, Divider, Button } from "antd";
import { useDispatch } from "react-redux";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_ADD_170PX } from "src/constants/Config";
import { FormSubmit } from "src/components/Common";
import {
  CloseCircleOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import ContainerHeader from "src/components/ContainerHeader";

const FormItem = Form.Item;

function EmailPhongDaoTao() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [data, setData] = useState();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [AcitveThayDoiEmail, setAcitveThayDoiEmail] = useState(false);
  const [disabledSave, setDisabledSave] = useState(false);
  const [newPassword, setnewPassword] = useState(null);

  useEffect(() => {
    getInfo();
    return () => dispatch(fetchReset());
  }, []);

  const getInfo = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_EmailPhongDaoTao`,
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
          setData(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const onFinish = (values) => {
    if (AcitveThayDoiEmail) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            "vptq_lms_EmailPhongDaoTao/email",
            "PUT",
            values.thaydoiemail,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status !== 409) {
            setFieldTouch(false);
            setAcitveThayDoiEmail(false);
            resetFields();
            getInfo();
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    } else {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            "vptq_lms_EmailPhongDaoTao/password",
            "PUT",
            values.thaydoimatkhau,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status !== 409) {
            setFieldTouch(false);
            setDisabledSave(false);
            resetFields();
            getInfo();
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setnewPassword(newPassword);

    const pattern =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{":;'?/>,<.\\])(?!.*\s).{6,25}$/;

    if (!newPassword.match(pattern)) {
      setDisabledSave(false);
    } else {
      setDisabledSave(true);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    if (newPassword && newPassword === newConfirmPassword) {
      setDisabledSave(true);
    } else {
      setDisabledSave(false);
    }
  };

  const addButtonRender = () => {
    return (
      !AcitveThayDoiEmail && (
        <Button
          icon={<EditOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={() => {
            setAcitveThayDoiEmail(true);
            resetFields();
          }}
        >
          Thay đổi email
        </Button>
      )
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Email phòng đào tạo"
        buttons={addButtonRender()}
      />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        style={{ width: "100%" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "0px 25px",
            }}
          >
            <span
              style={{
                width: "160px",
                fontWeight: "bold",
              }}
            >
              Email phòng đào tạo:
            </span>
            {data && (
              <span
                style={{
                  width: "calc(100% - 160px)",
                }}
              >
                {data}
              </span>
            )}
          </div>
          <Divider
            orientation="left"
            backgroundColor="none"
            style={{
              background: "none",
              fontWeight: "bold",
              marginBottom: "30px",
            }}
          >
            {AcitveThayDoiEmail
              ? "THAY ĐỔI EMAIL PHÒNG ĐÀO TẠO"
              : "THAY ĐỔI MẬT KHẨU"}
          </Divider>
          <div align="center" style={{ width: "100%" }}>
            {AcitveThayDoiEmail ? (
              <Form
                {...DEFAULT_FORM_ADD_170PX}
                form={form}
                name="tai-khoan-control"
                onFinish={onFinish}
                onFieldsChange={() => setFieldTouch(true)}
              >
                <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
                  <FormItem
                    label="Email"
                    name={["thaydoiemail", "email"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                      },
                    ]}
                  >
                    <Input
                      className="input-item"
                      placeholder="Nhập email mới"
                    />
                  </FormItem>
                </Col>
                <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
                  <FormItem
                    label="Mật khẩu"
                    name={["thaydoiemail", "password"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                      },
                    ]}
                  >
                    <Input
                      className="input-item"
                      placeholder="Nhập mật khẩu"
                      type="password"
                    />
                  </FormItem>
                </Col>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "10px",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Divider />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "10px",
                    }}
                  >
                    <Button
                      icon={<CloseCircleOutlined />}
                      className="th-margin-bottom-0"
                      type="danger"
                      onClick={() => {
                        setAcitveThayDoiEmail(false);
                        resetFields();
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      icon={<SaveOutlined />}
                      className="th-margin-bottom-0"
                      type="primary"
                      htmlType={"submit"}
                      disabled={!fieldTouch}
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>
              </Form>
            ) : (
              <Form
                {...DEFAULT_FORM_ADD_170PX}
                form={form}
                name="tai-khoan-control"
                onFinish={onFinish}
                onFieldsChange={() => setFieldTouch(true)}
              >
                <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
                  <FormItem
                    label="Mật khẩu cũ"
                    name={["thaydoimatkhau", "passwordOld"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                      },
                    ]}
                  >
                    <Input
                      className="input-item"
                      placeholder="Nhập mật khẩu cũ"
                      type="password"
                    />
                  </FormItem>
                </Col>
                <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
                  <FormItem
                    label="Mật khẩu mới"
                    name={["thaydoimatkhau", "passwordNew"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                        min: 6,
                        max: 25,
                      },
                      {
                        pattern:
                          /(?=^.{6,25}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{":;'?/>,<.\\])(?!.*\s).*$/,
                        message:
                          "Mật khẩu cần có ký tự hoa, ký tự đặc biệt và số",
                      },
                    ]}
                  >
                    <Input
                      className="input-item"
                      placeholder="Nhập mật khẩu mới"
                      type="password"
                      onChange={handlePasswordChange}
                    />
                  </FormItem>
                </Col>
                <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
                  <FormItem
                    label="Xác nhận mật khẩu"
                    name={["thaydoimatkhau", "confirmPasswordNew"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue(["thaydoimatkhau", "passwordNew"]) ===
                              value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Xác nhận mật khẩu không trùng khớp!")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input
                      className="input-item"
                      placeholder="Xác nhận mật khẩu"
                      type="password"
                      onChange={handleConfirmPasswordChange}
                    />
                  </FormItem>
                </Col>
                <FormSubmit disabled={fieldTouch && disabledSave} />
              </Form>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default EmailPhongDaoTao;
