import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { Input, Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
const FormItem = Form.Item;

const initialState = {
  maSP: "",
  tenSP: "",
  loaicongDoan_Id: "",
};

function DanhMucCongDoanForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };

  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [listDonVi, setListDonVi] = useState([]);

  const [fieldTouch, setFieldTouch] = useState(false);

  const { setFieldsValue, validateFields, resetFields } = form;
  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getData();
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getInfo(match.params.id);
          getData();
        }
      }
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
          `tits_qtsx_CongDoan/${id}`,
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
          res.data.thuTu = res.data.thuTu.toString();
          setFieldsValue({
            congDoan: res.data,
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const getData = () => {
    getDonVi();
  };
  /**
   * Lấy danh sách menu
   *
   */
  const getDonVi = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/${INFO.donVi_Id}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListDonVi([res.data]);
        } else {
          setListDonVi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const { maSP, tenSP, loaicongDoan_Id } = initialState;
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.congDoan);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.congDoan, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (congDoan, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_CongDoan`,
            "POST",
            congDoan,
            "ADD",
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
              resetFields();
              setFieldTouch(false);
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      congDoan.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_CongDoan/${id}`,
            "PUT",
            congDoan,
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
   * Quay lại trang công đoạn
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
    type === "new" ? "Thêm mới công đoạn" : "Chỉnh sửa công đoạn";

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
              label="Mã công đoạn"
              name={["congDoan", "maCongDoan"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={maSP}
            >
              <Input className="input-item" placeholder="Nhập mã công đoạn" />
            </FormItem>
            <FormItem
              label="Tên công đoạn"
              name={["congDoan", "tenCongDoan"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={tenSP}
            >
              <Input className="input-item" placeholder="Nhập tên công đoạn" />
            </FormItem>
            <FormItem
              label="Thứ tự"
              name={["congDoan", "thuTu"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Thứ tự không hợp lệ!",
                },
              ]}
            >
              <Input type="number" placeholder="Nhập thứ tự"></Input>
            </FormItem>
            <FormItem
              label="Ghi chú"
              name={["congDoan", "moTa"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập ghi chú" />
            </FormItem>
            <FormItem
              label="Đơn vị"
              name={["congDoan", "donVi_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={listDonVi ? listDonVi : []}
                placeholder="Chọn đơn vị"
                optionsvalue={["id", "tenDonVi"]}
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
        </Spin>
      </Card>
    </div>
  );
}

export default DanhMucCongDoanForm;
