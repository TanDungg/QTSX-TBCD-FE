import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { Input, FormSubmit, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

const FormItem = Form.Item;

function KhaiBaoSoContainerForm({ match, permission, history }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { setFieldsValue, validateFields, resetFields } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [ListSoVin, setListSoVin] = useState([]);
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getListSoVIN();
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

  const getListSoVIN = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SoContainer/list-so-VIN-chua-dong-cont`,
          "GET",
          null,
          "LIST",
          "listRole",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListSoVin(res.data);
        } else {
          setListSoVin([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Lấy thông tin info
   *
   * @param {*} id
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SoContainer/${id}`,
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
          setInfo(res.data);
          setFieldsValue({
            khaibaosocontainer: {
              ...res.data,
            },
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
    saveData(values.khaibaosocontainer);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.khaibaosocontainer, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (khaibaosocontainer, saveQuit = false) => {
    console.log(khaibaosocontainer);
    // if (type === "new") {
    //   new Promise((resolve, reject) => {
    //     dispatch(
    //       fetchStart(
    //         `tits_qtsx_SoContainer`,
    //         "POST",
    //         khaibaosocontainer,
    //         "ADD",
    //         "",
    //         resolve,
    //         reject
    //       )
    //     );
    //   })
    //     .then((res) => {
    //       if (res && res.status !== 409) {
    //         if (saveQuit) {
    //           goBack();
    //         } else {
    //           resetFields();
    //           setFieldTouch(false);
    //         }
    //       }
    //     })
    //     .catch((error) => console.error(error));
    // }
    if (type === "edit") {
      khaibaosocontainer.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_SoContainer/${id}`,
            "PUT",
            khaibaosocontainer,
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
   * Quay lại trang sản phẩm
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
    type === "new" ? "Thêm mới số container" : "Chỉnh sửa số container";

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
              label="Số container"
              name={["khaibaosocontainer", "soContainer"]}
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
              <Input className="input-item" placeholder="Nhập số container" />
            </FormItem>
            <FormItem
              label="Số seal"
              name={["khaibaosocontainer", "soSeal"]}
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
              <Input className="input-item" placeholder="Nhập số seal" />
            </FormItem>
            <FormItem
              label="Dimensions"
              name={["khaibaosocontainer", "dimensions"]}
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
              <Input className="input-item" placeholder="Nhập dimensions" />
            </FormItem>
            <FormItem
              label="List số VIN"
              name={["khaibaosocontainer", "list_ChiTiets"]}
              rules={[
                {
                  type: "array",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListSoVin ? ListSoVin : []}
                placeholder="Chọn số VIN"
                optionsvalue={["id", "tenSoLo"]}
                style={{ width: "100%" }}
                mode={"multiple"}
              />
            </FormItem>
            <FormItem
              label="Ghi chú"
              name={["khaibaosocontainer", "moTa"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập ghi chú" />
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

export default KhaiBaoSoContainerForm;
