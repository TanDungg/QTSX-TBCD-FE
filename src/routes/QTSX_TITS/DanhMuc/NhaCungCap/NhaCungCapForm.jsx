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
  maNhaCungCap: "",
  tenNhaCungCap: "",
  nguoiLienHe: "",
  sdt: "",
  diaChi: "",
  maSoThue: "",
};

function NhaCungCapForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const { maNhaCungCap, tenNhaCungCap, nguoiLienHe, sdt, diaChi, maSoThue } =
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
          `tits_qtsx_NhaCungCap/${id}`,
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
            nhacungcap: res.data,
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
    saveData(values.nhacungcap);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.NhaCungCap, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (nhacungcap, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_NhaCungCap`,
            "POST",
            nhacungcap,
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
      nhacungcap.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_NhaCungCap/${id}`,
            "PUT",
            nhacungcap,
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
   * Quay lại trang nhà cung cấp
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
    type === "new" ? "Thêm mới nhà cung cấp" : "Chỉnh sửa nhà cung cấp";

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
              label="Mã nhà cung cấp"
              name={["nhacungcap", "maNhaCungCap"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 50,
                  message: "Mã nhà cung cấp tối đa 50 ký tự",
                },
              ]}
              initialValue={maNhaCungCap}
            >
              <Input
                className="input-item"
                placeholder="Nhập mã nhà cung cấp"
              />
            </FormItem>
            <FormItem
              label="Tên nhà cung cấp"
              name={["nhacungcap", "tenNhaCungCap"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                  message: "Tên nhà cung cấp tối đa 250 ký tự",
                },
              ]}
              initialValue={tenNhaCungCap}
            >
              <Input
                className="input-item"
                placeholder="Nhập tên nhà cung cấp"
              />
            </FormItem>
            <FormItem
              label="Người liên hệ"
              name={["nhacungcap", "nguoiLienHe"]}
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
              name={["nhacungcap", "sdt"]}
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
              <Input placeholder="Nhập só điện thoại"></Input>
            </FormItem>
            <FormItem
              label="Địa chỉ"
              name={["nhacungcap", "diaChi"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={diaChi}
            >
              <Input placeholder="Nhập địa chỉ"></Input>
            </FormItem>
            <FormItem
              label="Mã số thuế"
              name={["nhacungcap", "maSoThue"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={maSoThue}
            >
              <Input placeholder="Nhập mã số thuế"></Input>
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

export default NhaCungCapForm;
