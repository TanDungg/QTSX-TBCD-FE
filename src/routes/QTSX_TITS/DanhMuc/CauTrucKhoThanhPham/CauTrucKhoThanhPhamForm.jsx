import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { Input, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";

const FormItem = Form.Item;

function CauTrucKhoThanhPhamForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const { loading, item } = useSelector(({ common }) => common).toJS();
  const [form] = Form.useForm();
  const { setFieldsValue, validateFields, resetFields } = form;
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);

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

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/${id}`,
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
        const newData = res.data;
        if (newData.tits_qtsx_CauTrucKho_Id === null) {
          newData.tits_qtsx_CauTrucKho_Id = "root";
        }
        setFieldsValue({
          cautruckhothanhpham: {
            ...newData,
            sucChua: newData.sucChua,
            viTri: newData.viTri,
          },
        });
      })
      .catch((error) => console.error(error));
  };

  const onFinish = (values) => {
    saveData(values.cautruckhothanhpham);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.cautruckhothanhpham, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (cautruckhothanhpham, saveQuit = false) => {
    if (type === "new") {
      cautruckhothanhpham.viTri =
        cautruckhothanhpham.viTri === undefined
          ? null
          : cautruckhothanhpham.viTri;
      cautruckhothanhpham.tits_qtsx_CauTrucKho_Id =
        cautruckhothanhpham.tits_qtsx_CauTrucKho_Id === "root"
          ? null
          : cautruckhothanhpham.tits_qtsx_CauTrucKho_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_CauTrucKho/cau-truc-kho-thanh-pham`,
            "POST",
            cautruckhothanhpham,
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
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const cautruckho = { id: id, ...item, ...cautruckhothanhpham };
      cautruckho.tits_qtsx_CauTrucKho_Id =
        cautruckho.tits_qtsx_CauTrucKho_Id === "root"
          ? (cautruckho.tits_qtsx_CauTrucKho_Id = null)
          : cautruckho.tits_qtsx_CauTrucKho_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_CauTrucKho/${id}`,
            "PUT",
            cautruckho,
            "EDIT",
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
              setFieldTouch(false);
              getInfo(id);
            }
          }
        })
        .catch((error) => console.log(error));
    }
  };

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
      ? "Thêm mới cấu trúc kho thành phẩm"
      : "Chỉnh sửa cấu trúc kho thành phẩm";

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
              label="Mã cấu trúc kho"
              name={["cautruckhothanhpham", "maCauTrucKho"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập mã cấu trúc kho"
              />
            </FormItem>
            <FormItem
              label="Tên cấu trúc kho"
              name={["cautruckhothanhpham", "tenCauTrucKho"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập tên cấu trúc kho"
              />
            </FormItem>
            <FormItem
              label="Sức chứa"
              name={["cautruckhothanhpham", "sucChua"]}
              rules={[]}
            >
              <Input
                type="number"
                className="input-item"
                placeholder="Nhập sức chứa"
              />
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

export default CauTrucKhoThanhPhamForm;
