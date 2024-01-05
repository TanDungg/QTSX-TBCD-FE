import { Card, DatePicker, Form, Input } from "antd";
import dayjs from "dayjs";
import includes from "lodash/includes";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";

const FormItem = Form.Item;

const VatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListVatTu, setListVatTu] = useState([]);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getVatTu();
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          getVatTu();
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
  const getVatTu = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart("VatTu?page=-1", "GET", null, "LIST", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListVatTu(
            res.data.map((sp) => {
              return {
                ...sp,
                name: sp.maVatTu + " - " + sp.tenVatTu,
              };
            })
          );
        } else {
          setListVatTu([]);
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
    setId(id);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_QRCodeVatTu/${id}`,
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
            vattu: {
              ...res.data,
              hanSuDung: moment(res.data.hanSuDung, "DD/MM/YYYY"),
            },
          });
        }
        setInfo(res.data);
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy thông tin info
   *
   * @param {*} id
   */
  const getInfoVatTu = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`VatTu/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setFieldsValue({
            vattu: {
              tenDonViTinh: res.data.tenDonViTinh,
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Quay lại trang lot
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

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.vattu);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.vattu, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      user.hanSuDung = user.hanSuDung ? user.hanSuDung._i : null;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_QRCodeVatTu`,
            "POST",
            user,
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
      const newData = {
        ...info,
        ...user,
        hanSuDung: user.hanSuDung ? user.hanSuDung._i : null,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_QRCodeVatTu/${id}`,
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
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };
  const formTitle =
    type === "new"
      ? "Thêm mới mã Barcode vật tư"
      : "Chỉnh sửa mã Barcode vật tư";
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
            label="Vật tư"
            name={["vattu", "vatTu_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListVatTu ? ListVatTu : []}
              placeholder="Chọn vật tư"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={(val) => getInfoVatTu(val)}
            />
          </FormItem>
          <FormItem
            label="Đơn vị tính"
            name={["vattu", "tenDonViTinh"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input placeholder="Đơn vị tính" disabled={true} />
          </FormItem>
          <FormItem label="Hạn sử dụng" name={["vattu", "hanSuDung"]}>
            <DatePicker
              format={"DD/MM/YYYY"}
              placeholder="Chọn hạn sử dụng"
              style={{ width: 200 }}
              disabledDate={disabledDate}
              onChange={(date, dateString) => {
                if (dateString === "") {
                  setFieldsValue({
                    vattu: {
                      hanSuDung: null,
                    },
                  });
                } else {
                  setFieldsValue({
                    vattu: {
                      hanSuDung: moment(dateString, "DD/MM/YYYY"),
                    },
                  });
                }
              }}
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

export default VatTuForm;
