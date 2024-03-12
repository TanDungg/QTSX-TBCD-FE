import { Card, Col, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_ADD_130PX } from "src/constants/Config";

const FormItem = Form.Item;

const ChucVuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { validateFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListChucDanh, setListChucDanh] = useState([]);
  const [id, setId] = useState(undefined);

  useEffect(() => {
    if (permission && permission.edit) {
      const { id } = match.params;
      setId(id);
      getListChucDanh();
      getInfo(id);
    } else if (permission && !permission.edit) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListChucDanh = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChucDanh?page=-1`,
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
          setListChucDanh(res.data);
        } else {
          setListChucDanh([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChucDanhChucVu/${id}`,
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
            chucvuchucdanh: res.data,
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const goBack = () => {
    history.push(`${match.url.replace(`/${match.params.id}/chinh-sua`, "")}`);
  };

  const onFinish = (values) => {
    saveData(values.chucvuchucdanh);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.chucvuchucdanh, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (chucvuchucdanh, saveQuit = false) => {
    var newData = { ...chucvuchucdanh, chucVu_Id: id };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChucDanhChucVu/${id}`,
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
          getInfo(id);
          setFieldTouch(false);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader title={"Chỉnh sửa chức vụ"} back={goBack} />
      <Card
        className="th-card-margin-bottom"
        align="center"
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_130PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Mã chức vụ"
              name={["chucvuchucdanh", "maChucVu"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 50,
                  message: "Mã chức vụ không được quá 50 ký tự",
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập mã chức vụ"
                disabled
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Tên chức vụ"
              name={["chucvuchucdanh", "tenChucVu"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                  message: "Tên chức vụ không được quá 250 ký tự",
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập tên chức vụ"
                disabled
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Chức danh"
              name={["chucvuchucdanh", "vptq_lms_ChucDanh_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListChucDanh ? ListChucDanh : []}
                placeholder="Chọn chức danh"
                optionsvalue={["id", "tenChucDanh"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Ghi chú"
              name={["chucvuchucdanh", "moTa"]}
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

export default ChucVuForm;
