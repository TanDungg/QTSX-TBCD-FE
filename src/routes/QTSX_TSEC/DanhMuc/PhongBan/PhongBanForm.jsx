import { Card, Col, Form, Input } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select, TreeSelect } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_ADD_150PX } from "src/constants/Config";

const FormItem = Form.Item;

const PhongBanForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [id, setId] = useState(undefined);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        getListDonVi();
        setType("new");
      } else if (permission && !permission.add) {
        history.push("/home");
      }
    } else {
      if (permission && permission.edit) {
        setType("edit");
        const { id } = match.params;
        setId(id);
        getInfo(id);
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/don-vi-by-user`,
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
          setListDonVi(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListPhongBan = (donVi_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan/phong-ban-tree?donviid=${donVi_Id}`,
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
          const root = { id: "root", tenPhongBan: "Root", children: [] };
          setListPhongBan([root, ...res.data]);
        } else {
          setListPhongBan([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`PhongBan/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          const data = res.data;
          getListDonVi();
          getListPhongBan();
          setFieldsValue({
            phongban: {
              ...data,
              phongBan_Id: data.phongBan_Id ? data.phongBan_Id : "root",
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const onFinish = (values) => {
    saveData(values.phongban);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.phongban, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (phongban, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...phongban,
        phongBan_Id:
          phongban.phongBan_Id === "root" ? null : phongban.phongBan_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`PhongBan`, "POST", newData, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              getListDonVi();
              getListPhongBan();
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...phongban,
        id: id,
        phongBan_Id:
          phongban.phongBan_Id === "root" ? null : phongban.phongBan_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `PhongBan/${id}`,
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
          if (res.status === 409 || !saveQuit) {
            setFieldTouch(false);
          } else {
            goBack();
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const formTitle =
    type === "new" ? "Thêm mới phòng ban" : "Chỉnh sửa phòng ban";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom"
        align="center"
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_150PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Mã Ban/Phòng"
              name={["phongban", "maPhongBan"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 50,
                  message: "Mã Ban/Phòng không được quá 50 ký tự",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập mã Ban/Phòng" />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Tên Ban/Phòng"
              name={["phongban", "tenPhongBan"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                  message: "Tên Ban/Phong không được quá 250 ký tự",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập tên Ban/Phong" />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Ban/Phòng cha"
              name={["phongban", "phongBan_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <TreeSelect
                className="tree-select-item"
                datatreeselect={ListPhongBan ? ListPhongBan : []}
                name="menu"
                options={["id", "tenPhongBan", "children"]}
                placeholder="Ban/Phòng cha"
                style={{ width: "100%" }}
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Đơn vị"
              name={["phongban", "donVi_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListDonVi ? ListDonVi : []}
                placeholder="Chọn đơn vị"
                optionsvalue={["id", "tenDonVi"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
              />
            </FormItem>
          </Col>
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

export default PhongBanForm;
