import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { Input, Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";

const FormItem = Form.Item;

const initialState = {
  maKhachHang: "",
  tenKhachHang: "",
  loaiKhachHang_Id: "",
};

function KhachHangForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading } = useSelector(({ common }) => common).toJS();

  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [LoaiKhachHangSelect, setLoaiKhachHangSelect] = useState([]);

  const [fieldTouch, setFieldTouch] = useState(false);

  const { setFieldsValue, validateFields, resetFields } = form;
  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getData();
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getInfo(match.params.id);
          getData();
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
          `KhachHang/${id}`,
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
            KhachHang: res.data,
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const getData = () => {
    getLoaiKhachHang();
  };

  /**
   * Lấy danh sách menu
   *
   */
  const getLoaiKhachHang = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "LoaiKhachHang?page=-1",
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
          setLoaiKhachHangSelect(res.data);
        } else {
          setLoaiKhachHangSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const { maKhachHang, tenKhachHang, loaiKhachHang_Id } = initialState;
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.KhachHang);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.KhachHang, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (KhachHang, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`KhachHang`, "POST", KhachHang, "ADD", "", resolve, reject)
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
      KhachHang.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `KhachHang/${id}`,
            "PUT",
            KhachHang,
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
    type === "new" ? "Thêm mới khách hàng" : "Chỉnh sửa khách hàng";

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
              name={["KhachHang", "maKhachHang"]}
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
              name={["KhachHang", "tenKhachHang"]}
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
              label="Loại khách hàng"
              name={["KhachHang", "loaiKhachHang_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
              initialValue={loaiKhachHang_Id}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={LoaiKhachHangSelect ? LoaiKhachHangSelect : []}
                placeholder="Chọn loại khách hàng"
                optionsvalue={["id", "tenLoaiKhachHang"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Địa chỉ"
              name={["KhachHang", "diaChi"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input placeholder="Nhập địa chỉ"></Input>
            </FormItem>
            <FormItem
              label="Số điện thoại"
              name={["KhachHang", "soDienThoai"]}
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
            >
              <Input placeholder="Nhập số điện thoại"></Input>
            </FormItem>
            <FormItem
              label="Email"
              name={["KhachHang", "email"]}
              rules={[
                {
                  type: "email",
                },
              ]}
            >
              <Input placeholder="Nhập email"></Input>
            </FormItem>
            <FormItem
              label="Mã số thuế"
              name={["KhachHang", "maSoThue"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input placeholder="Nhập mã số thuế"></Input>
            </FormItem>
            <FormItem
              label="Người liên hệ"
              name={["KhachHang", "nguoiLienHe"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input placeholder="Nhập người liên hệ"></Input>
            </FormItem>
            <FormItem
              label="Fax"
              name={["KhachHang", "fax"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input placeholder="Nhập fax"></Input>
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
