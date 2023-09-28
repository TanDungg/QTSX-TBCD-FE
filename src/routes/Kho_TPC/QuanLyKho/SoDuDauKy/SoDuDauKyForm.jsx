import React, { useState, useEffect } from "react";
import { Card, Form, Spin, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import moment from "moment/moment";
import { Input, Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import tree from "src/components/Common/Tree_Old";

const FormItem = Form.Item;

const initialState = {
  maVatTu: "",
  tenVatTu: "",
  nhomVatTu_Id: "",
};

function SoDuDauKyForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading, item } = useSelector(({ common }) => common).toJS();

  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [listMenu, setListMenu] = useState([]);
  const [NhomVatTuSelect, setNhomVatTuSelect] = useState([]);
  const [MauSacSelect, setMauSacSelect] = useState([]);
  const [DonViTinhSelect, setDonViTinhSelect] = useState([]);

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
        fetchStart(`VatTu/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setFieldsValue({
            VatTu: res.data,
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const getData = () => {
    getDonViTinh();
    getNhomVatTu();
    getMauSac();
  };

  /**
   * Lấy danh sách menu
   *
   */
  const getNhomVatTu = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "NhomVatTu?page=-1",
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
          setNhomVatTuSelect(res.data);
        } else {
          setNhomVatTuSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách menu
   *
   */
  const getMauSac = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart("MauSac?page=-1", "GET", null, "LIST", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setMauSacSelect(res.data);
        } else {
          setMauSacSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách menu
   *
   */
  const getDonViTinh = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "DonViTinh?page=-1",
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
          setDonViTinhSelect(res.data);
        } else {
          setDonViTinhSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const { maVatTu, tenVatTu, nhomVatTu_Id } = initialState;
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.VatTu);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.VatTu, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (VatTu, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`VatTu`, "POST", VatTu, "ADD", "", resolve, reject)
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
      VatTu.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`VatTu/${id}`, "PUT", VatTu, "EDIT", "", resolve, reject)
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
   * Quay lại trang thẻ kho
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
  const formTitle = type === "new" ? "Thêm mới thẻ kho" : "Chỉnh sửa thẻ kho";

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
              label="Tên sản phẩm"
              name={["VatTu", "tenVatTu"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={tenVatTu}
            >
             <Select
                className="heading-select slt-search th-select-heading"
                data={NhomVatTuSelect ? NhomVatTuSelect : []}
                placeholder="Chọn tên sản phẩm"
                optionsvalue={["id", "tenNhomVatTu"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Số lượng"
              name={["VatTu", "donViQuyDoi"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập số lượng" />
            </FormItem>
              <FormItem
                label="Hạn sử dụng"
                name={["dathangnoibo", "ngayYeuCau"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                style={{width: "100%"}}
                allowClear={false}
                  disabled={type === "new" || type === "edit" ? false : true}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      dathangnoibo: {
                        ngayYeuCau: moment(dateString, "DD/MM/YYYY"),
                      },
                    });
                  }}
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

export default SoDuDauKyForm;
