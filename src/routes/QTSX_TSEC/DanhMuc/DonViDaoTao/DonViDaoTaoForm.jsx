import { Card, Col, Form, Input } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_ADD_170PX } from "src/constants/Config";

const FormItem = Form.Item;

const DonViDaoTaoForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [id, setId] = useState(undefined);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
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

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_DonViDaoTao/${id}`,
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
            formdonvidaotao: res.data,
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
    saveData(values.formdonvidaotao);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.formdonvidaotao, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (formdonvidaotao, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_DonViDaoTao`,
            "POST",
            formdonvidaotao,
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
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      var newData = { ...formdonvidaotao, id: id };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_DonViDaoTao/${id}`,
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
    type === "new" ? "Thêm mới đơn vị đào tạo" : "Chỉnh sửa đơn vị đào tạo";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom"
        align="center"
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_170PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Mã đơn vị đào tạo"
              name={["formdonvidaotao", "maDonViDaoTao"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 50,
                  message: "Mã đơn vị đào tạo không được quá 50 ký tự",
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập mã đơn vị đào tạo"
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Tên đơn vị đào tạo"
              name={["formdonvidaotao", "tenDonViDaoTao"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                  message: "Tên đơn vị đào tạo không được quá 250 ký tự",
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập tên đơn vị đào tạo"
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Ghi chú"
              name={["formdonvidaotao", "moTa"]}
              rules={[
                {
                  type: "string",
                },
                {
                  max: 250,
                  message: "Ghi chú không được quá 250 ký tự",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập ghi chú" />
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

export default DonViDaoTaoForm;
