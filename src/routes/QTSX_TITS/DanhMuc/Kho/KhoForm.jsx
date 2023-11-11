import React, { useState, useEffect } from "react";
import { Card, Form, Spin, Switch } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { Input, TreeSelect, FormSubmit, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams, getLocalStorage } from "src/util/Common";

const FormItem = Form.Item;

const initialState = {
  maCauTrucKho: "",
  tenCauTrucKho: "",
  isActive: false,
};

function KhoForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = getLocalStorage("menu");
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListChungTu, setListChungTu] = useState([]);
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
    if (permission && (permission.add || permission.edit)) {
      // Lấy danh sách CauTrucKho
      getChungTu();
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
        getChungTu();
        setFieldsValue({
          CauTrucKho: {
            ...newData,
            tits_qtsx_CauTrucKho_ChungTus: JSON.parse(
              newData.chiTietChungTus
            ).map((ct) => ct.tits_qtsx_ChungTu_Id.toLowerCase()),
          },
        });
      })
      .catch((error) => console.error(error));
  };
  const getChungTu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ChungTu?page=-1`,
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
          setListChungTu(res.data);
        } else {
          setListChungTu([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const { maCauTrucKho, tenCauTrucKho, isActive } = initialState;
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.CauTrucKho);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.CauTrucKho, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (CauTrucKho, saveQuit = false) => {
    if (type === "new") {
      let url = "";
      if (CauTrucKho.isThanhPham) {
        url = "tits_qtsx_CauTrucKho/cau-truc-kho-thanh-pham";
      } else {
        url = "tits_qtsx_CauTrucKho/cau-truc-kho-vat-tu";
      }
      const newUser = {
        ...CauTrucKho,
        tits_qtsx_CauTrucKho_ChungTus:
          CauTrucKho.tits_qtsx_CauTrucKho_ChungTus.map((ct) => {
            return {
              tits_qtsx_ChungTu_Id: ct,
            };
          }),
      };
      new Promise((resolve, reject) => {
        dispatch(fetchStart(url, "POST", newUser, "ADD", "", resolve, reject));
      })
        .then((res) => {
          if (saveQuit) {
            goBack();
          } else {
            resetFields();
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const editUser = { id, ...CauTrucKho };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_CauTrucKho/{id}/${id}`,
            "PUT",
            editUser,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (saveQuit) {
            goBack();
          } else {
            setFieldTouch(false);
            getInfo(id);
          }
        })
        .catch((error) => console.log(error));
    }
  };
  const handleSelectPhongBan = (val) => {
    setFieldsValue({
      CauTrucKho: {
        cauTrucKho_Id: null,
      },
    });
  };

  /**
   * Quay lại trang cấu trúc kho
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

  const formTitle = type === "new" ? "Thêm mới kho" : "Chỉnh sửa kho";

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
              label="Mã kho"
              name={["CauTrucKho", "maCauTrucKho"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={maCauTrucKho}
            >
              <Input className="input-item" placeholder="Nhập mã kho" />
            </FormItem>
            <FormItem
              label="Tên kho"
              name={["CauTrucKho", "tenCauTrucKho"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={tenCauTrucKho}
            >
              <Input className="input-item" placeholder="Nhập tên kho" />
            </FormItem>
            <FormItem
              label="Chứng từ"
              name={["CauTrucKho", "tits_qtsx_CauTrucKho_ChungTus"]}
              rules={[
                {
                  type: "array",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListChungTu ? ListChungTu : []}
                placeholder="Chọn chứng từ"
                optionsvalue={["id", "tenChungTu"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
                mode={"multiple"}
              />
            </FormItem>
            <FormItem
              label="Kho thành phẩm"
              name={["CauTrucKho", "isThanhPham"]}
              valuePropName="checked"
              initialValue={isActive}
            >
              <Switch />
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

export default KhoForm;
