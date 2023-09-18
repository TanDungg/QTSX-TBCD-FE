import { Card, Form, Input } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";

const FormItem = Form.Item;

const initialState = {
  maThietBi: "",
  tenThietBi: "",
  hangThietBi_Id: "",
  loaiThietbi_Id: "",
  donViTinh_Id: "",
};
const DanhMucThietBiForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const {
    maThietBi,
    tenThietBi,
    donViTinh_Id,
    hangThietBi_Id,
    loaiThietbi_Id,
  } = initialState;
  const [hangTBSelect, setHangTBSelect] = useState([]);
  const [loaiTBSelect, setLoaiTBSelect] = useState([]);
  const [donViTinhSelect, setDonViTinhSelect] = useState([]);
  const { validateFields, resetFields, setFieldsValue } = form;

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getData();
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `HangThietBi?page=-1`,
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
        if (res && res.data[0]) {
          setHangTBSelect(res.data);
        }
      })
      .catch((error) => console.error(error));
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `LoaiThietBi?page=-1`,
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
        if (res && res.data[0]) {
          setLoaiTBSelect(res.data);
        }
      })
      .catch((error) => console.error(error));
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonViTinh?page=-1`,
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
        if (res && res.data[0]) {
          setDonViTinhSelect(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Lấy thông tin
   *
   */
  const getInfo = () => {
    const { id } = match.params;
    getData();
    setId(id);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DanhMucThietBi/${id}`,
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
          const data = res.data[0];
          setFieldsValue({
            danhmucthietbi: data,
          });
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Quay lại trang người dùng
   *
   */
  const goBack = () => {
    history.push("/danh-muc/thiet-bi");
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.danhmucthietbi);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.danhmucthietbi, true);
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
            `DanhMucThietBi`,
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
      const newData = user;
      newData.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `DanhMucThietBi/${id}`,
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

  const formTitle = type === "new" ? "Thêm mới thiết bị" : "Chỉnh sửa thiết bị";
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
            label="Mã thiết bị"
            name={["danhmucthietbi", "maThietBi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 50,
                message: "Mã thiết bị không được quá 50 ký tự",
              },
            ]}
            initialValue={maThietBi}
          >
            <Input className="input-item" placeholder="Nhập mã thiết bị" />
          </FormItem>
          <FormItem
            label="Tên thiết bị"
            name={["danhmucthietbi", "tenThietBi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 250,
                message: "Tên thiết bị không được quá 250 ký tự",
              },
            ]}
            initialValue={tenThietBi}
          >
            <Input className="input-item" placeholder="Nhập tên thiết bị" />
          </FormItem>
          <FormItem
            label="Hãng thiết bị"
            name={["danhmucthietbi", "hangThietBi_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={hangThietBi_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={hangTBSelect ? hangTBSelect : []}
              placeholder="Chọn hãng thiết bị"
              optionsvalue={["id", "tenHang"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Loại thiết bị"
            name={["danhmucthietbi", "loaiThietbi_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={loaiThietbi_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={loaiTBSelect ? loaiTBSelect : []}
              placeholder="Chọn loại thiết bị"
              optionsvalue={["id", "tenLoaiThietBi"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Đơn vị tính"
            name={["danhmucthietbi", "donViTinh_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={donViTinh_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={donViTinhSelect ? donViTinhSelect : []}
              placeholder="Chọn loại thiết bị"
              optionsvalue={["id", "tenDonViTinh"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
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

export default DanhMucThietBiForm;
