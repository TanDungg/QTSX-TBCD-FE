import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { Input, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";

const FormItem = Form.Item;

function CauTrucKhoVatTuForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
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
        const data = res.data;
        setFieldsValue({
          cautruckhovattu: {
            ...data,
            viTri: data.viTri,
            tits_qtsx_CauTrucKho_ChungTus:
              data.chiTietChungTus &&
              JSON.parse(data.chiTietChungTus).map((ct) =>
                ct.tits_qtsx_ChungTu_Id.toLowerCase()
              ),
          },
        });
      })
      .catch((error) => console.error(error));
  };

  const onFinish = (values) => {
    saveData(values.cautruckhovattu);
  };
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.cautruckhovattu, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (cautruckhovattu, saveQuit = false) => {
    if (type === "new") {
      const cautruckho = {
        ...cautruckhovattu,
        viTri: !cautruckhovattu.viTri ? 0 : cautruckhovattu.viTri,
      };

      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_CauTrucKho/cau-truc-kho-vat-tu`,
            "POST",
            cautruckho,
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
      const cautruckho = {
        ...cautruckhovattu,
        id: id,
        viTri: !cautruckhovattu.viTri ? 0 : cautruckhovattu.viTri,
      };

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
    type === "new" ? "Thêm mới kho vật tư" : "Chỉnh sửa kho vật tư";

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
              label="Mã kho vật tư"
              name={["cautruckhovattu", "maCauTrucKho"]}
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
              <Input className="input-item" placeholder="Nhập mã kho vật tư" />
            </FormItem>
            <FormItem
              label="Tên kho vật tư"
              name={["cautruckhovattu", "tenCauTrucKho"]}
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
              <Input className="input-item" placeholder="Nhập tên kho vật tư" />
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

export default CauTrucKhoVatTuForm;
