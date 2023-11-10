import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { Input, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";

const FormItem = Form.Item;
const initialState = {
  maKhachHang: "",
  tenKhachHang: "",
  nguoiLienHe: "",
  sdt: "",
  diaChi: "",
  email: "",
};

function KhachHangForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const { maKhachHang, tenKhachHang, nguoiLienHe, sdt, diaChi, email } =
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
          `tits_qtsx_KhachHang/${id}`,
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
            khachhang: res.data,
          });
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.khachhang);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.khachhang, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (khachhang, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_KhachHang`,
            "POST",
            khachhang,
            "ADD",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      khachhang.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_KhachHang/${id}`,
            "PUT",
            khachhang,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              setFieldTouch(false);
              getInfo(id);
            }
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
    type === "new"
      ? "Thêm mới thông tin khách hàng"
      : "Chỉnh sửa thông tin khách hàng";

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
              label="Mã khách hàng"
              name={["khachhang", "maKhachHang"]}
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
              <Input className="input-item" placeholder="Nhập mã khách hàng" />
            </FormItem>
            <FormItem
              label="Tên khách hàng"
              name={["khachhang", "tenKhachHang"]}
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
              label="Người liên hệ"
              name={["khachhang", "nguoiLienHe"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
              initialValue={nguoiLienHe}
            >
              <Input placeholder="Nhập người liên hệ"></Input>
            </FormItem>
            <FormItem
              label="Số điện thoại"
              name={["khachhang", "sdt"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  pattern: /^\d+$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
              initialValue={sdt}
            >
              <Input placeholder="Nhập số điện thoại"></Input>
            </FormItem>
            <FormItem
              label="Địa chỉ"
              name={["khachhang", "diaChi"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
              initialValue={diaChi}
            >
              <Input placeholder="Nhập địa chỉ"></Input>
            </FormItem>
            <FormItem
              label="Email"
              name={["khachhang", "email"]}
              rules={[
                {
                  type: "email",
                },
              ]}
              initialValue={email}
            >
              <Input placeholder="Nhập email"></Input>
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

export default KhachHangForm;
