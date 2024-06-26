import React, { useEffect, useState } from "react";
import { Card, Form, Input, Row, Col, Divider } from "antd";
import { useDispatch } from "react-redux";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { getTokenInfo, setCookieValue } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { FormSubmit } from "src/components/Common";
import Helpers from "src/helpers";
const FormItem = Form.Item;

function TaiKhoan() {
  const dispatch = useDispatch();
  const [data, setData] = useState();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;

  useEffect(() => {
    getInfo();
    return () => dispatch(fetchReset());
  }, []);
  const getInfo = () => {
    const userInfo = getTokenInfo();
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/${userInfo.id}`,
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
  /**
   * Submit thay đổi mật khẩu
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "Account/ChangePassword",
          "POST",
          values.user,
          "CHANGEPASSWORD",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (!res.data) resetFields();
        setFieldTouch(false);
        if (res.status === 200) {
          // Change tokenInfo
          resetFields();
          let tokenInfo = getTokenInfo();
          tokenInfo.mustChangePass = false;
          const maxAge = new Date(tokenInfo.expires);
          setCookieValue("tokenInfo", tokenInfo, {
            path: "/",
            maxAge: maxAge.getTime(),
          });
          Helpers.alertSuccessMessage("Thay đổi mật khẩu thành công!!!");
          setTimeout(() => {
            window.location.href = "/home";
          }, 3000);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin tài khoản"}
      >
        <Row
          style={{
            padding: "20px 20px 20px 50px",
          }}
        >
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            className="title-span"
            style={{
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
              }}
            >
              Họ và tên:
            </span>
            {data && <span>{data.fullName}</span>}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            className="title-span"
            style={{
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
              }}
            >
              MSNV:
            </span>
            {data && <span>{data.maNhanVien}</span>}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            className="title-span"
            style={{
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
              }}
            >
              Email:
            </span>
            {data && <span>{data.email}</span>}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            className="title-span"
            style={{
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
              }}
            >
              Chức danh:
            </span>
            {data && <span>{data.tenChucDanh}</span>}
          </Col>

          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            className="title-span"
            style={{
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
              }}
            >
              Phòng ban:
            </span>
            {data && <span>{data.tenPhongBan}</span>}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            className="title-span"
            style={{
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
              }}
            >
              Đơn vị:
            </span>
            {data && <span>{data.tenDonVi}</span>}
          </Col>
        </Row>
        <Divider
          orientation="left"
          backgroundColor="none"
          style={{
            background: "none",
            fontWeight: "bold",
            marginBottom: "30px",
          }}
        >
          THAY ĐỔI MẬT KHẨU
        </Divider>
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="tai-khoan-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem
            label="Mật khẩu cũ"
            name={["user", "password"]}
            rules={[
              {
                required: true,
                type: "string",
              },
            ]}
            initialValue=""
          >
            <Input
              className="input-item"
              placeholder="Nhập mật khẩu cũ"
              type="password"
            />
          </FormItem>
          <FormItem
            label="Mật khẩu mới"
            name={["user", "newPassword"]}
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
                message: "Mật khẩu cần có Ký tự hoa, ký tự đặc biệt và số",
              },
            ]}
            initialValue=""
          >
            <Input
              className="input-item"
              placeholder="Nhập mật khẩu mới"
              type="password"
            />
          </FormItem>
          <FormItem
            label="Xác nhận mật khẩu"
            name={["user", "confirmNewPassword"]}
            rules={[
              {
                required: true,
                type: "string",
                min: 6,
              },
              {
                pattern:
                  /(?=^.{6,25}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{":;'?/>,<.\\])(?!.*\s).*$/,
                message: "Mật khẩu cần có Ký tự hoa, ký tự đặc biệt và số",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    !value ||
                    getFieldValue(["user", "newPassword"]) === value
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Hai mật khẩu không giống nhau!")
                  );
                },
              }),
            ]}
            initialValue=""
          >
            <Input
              className="input-item"
              placeholder="Nhập Xác nhận mật khẩu"
              type="password"
            />
          </FormItem>
          <FormSubmit disabled={fieldTouch} />
        </Form>
      </Card>
      {/* <Card>
        <PageHeader title="Thông tin tài khoản" subTitle="Chi tiết">
          <Descriptions>
            <Descriptions.Item label="Email">
              <strong>{data && data.email}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Họ tên">
              <strong>{data && data.fullName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Chức vụ">
              <strong>{data && data.tenChucVu}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Bộ phận">
              <strong>{data && data.tenBoPhan}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Phòng ban" span={2}>
              <strong>{data && data.tenPhongBan}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị">
              <strong>{data && data.tenDonVi}</strong>
            </Descriptions.Item>
          </Descriptions>
        </PageHeader>
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="tai-khoan-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem
            label="Mật khẩu cũ"
            name={["user", "password"]}
            rules={[
              {
                required: true,
                type: "string",
              },
            ]}
            initialValue=""
          >
            <Input
              className="input-item"
              placeholder="Nhập mật khẩu cũ"
              type="password"
            />
          </FormItem>
          <FormItem
            label="Mật khẩu mới"
            name={["user", "newPassword"]}
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
                message: "Mật khẩu cần có Ký tự hoa, ký tự đặc biệt và số",
              },
            ]}
            initialValue=""
          >
            <Input
              className="input-item"
              placeholder="Nhập mật khẩu mới"
              type="password"
            />
          </FormItem>
          <FormItem
            label="Xác nhận mật khẩu"
            name={["user", "confirmNewPassword"]}
            rules={[
              {
                required: true,
                type: "string",
                min: 6,
              },
              {
                pattern:
                  /(?=^.{6,25}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{":;'?/>,<.\\])(?!.*\s).*$/,
                message: "Mật khẩu cần có Ký tự hoa, ký tự đặc biệt và số",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    !value ||
                    getFieldValue(["user", "newPassword"]) === value
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Hai mật khẩu không giống nhau!")
                  );
                },
              }),
            ]}
            initialValue=""
          >
            <Input
              className="input-item"
              placeholder="Nhập Xác nhận mật khẩu"
              type="password"
            />
          </FormItem>
          <FormSubmit disabled={fieldTouch} />
        </Form>
      </Card> */}
    </>
  );
}

export default TaiKhoan;
