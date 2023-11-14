import { Card, Checkbox, Form, Input } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { getLocalStorage, getTokenInfo } from "src/util/Common";

const FormItem = Form.Item;
const initialState = {
  maNhomLoi: "",
  tenNhomLoi: "",
  tits_qtsx_CongDoan_Id: "",
  isSuDung: true,
  moTa: "",
};

const NhomLoiForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { maNhomLoi, tenNhomLoi, tits_qtsx_CongDoan_Id, isSuDung, moTa } =
    initialState;
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListCongDoan, setListCongDoan] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    ref.current.focus();
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getListCongDoan();
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo();
          getListCongDoan();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListCongDoan = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CongDoan?page=-1&donVi_Id=${INFO.donVi_Id}`,
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
          setListCongDoan(res.data);
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
          `tits_qtsx_NhomLoi/${id}`,
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
            nhomloi: res.data,
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
    saveData(values.nhomloi);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.nhomloi, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (nhomloi, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_NhomLoi`,
            "POST",
            nhomloi,
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
      nhomloi.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_NhomLoi/${id}`,
            "PUT",
            nhomloi,
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

  const formTitle = type === "new" ? "Thêm mới nhóm lỗi" : "Chỉnh sửa nhóm lỗi";
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
            label="Mã nhóm lỗi"
            name={["nhomloi", "maNhomLoi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 50,
                message: "Mã nhóm lỗi không được quá 50 ký tự",
              },
            ]}
            initialValue={maNhomLoi}
          >
            <Input
              className="input-item"
              placeholder="Nhập mã nhóm lỗi"
              ref={ref}
            />
          </FormItem>
          <FormItem
            label="Tên nhóm lỗi"
            name={["nhomloi", "tenNhomLoi"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 250,
                message: "Tên nhóm lỗi không được quá 250 ký tự",
              },
            ]}
            initialValue={tenNhomLoi}
          >
            <Input className="input-item" placeholder="Nhập tên nhóm lỗi" />
          </FormItem>
          <FormItem
            label="Công đoạn"
            name={["nhomloi", "tits_qtsx_CongDoan_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={tits_qtsx_CongDoan_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListCongDoan ? ListCongDoan : []}
              placeholder="Chọn công đoạn"
              optionsvalue={["id", "tenCongDoan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Sử dụng"
            name={["nhomloi", "isSuDung"]}
            valuePropName="checked"
            initialValue={isSuDung}
          >
            <Checkbox />
          </FormItem>
          <FormItem
            label="Ghi chú"
            name={["nhomloi", "moTa"]}
            rules={[
              {
                type: "string",
              },
              {
                max: 250,
                message: "Ghi chú không được quá 250 ký tự",
              },
            ]}
            initialValue={moTa}
          >
            <Input className="input-item" placeholder="Nhập ghi chú" />
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

export default NhomLoiForm;
