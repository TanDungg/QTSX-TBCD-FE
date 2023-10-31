import React, { useState, useEffect } from "react";
import { Card, Form, Spin, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { Input, Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import { getDateNow } from "src/util/Common";
const FormItem = Form.Item;

const initialState = {
  maVatTu: "",
  tenVatTu: "",
  nhomVatTu_Id: "",
};

function ThongTinVatTuForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading } = useSelector(({ common }) => common).toJS();

  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListNhaCungCap, setListNhaCungCap] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);

  const [fieldTouch, setFieldTouch] = useState(false);

  const { setFieldsValue, validateFields, resetFields } = form;
  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getData();
        setFieldsValue({
          thongTinVatTu: {
            ngayNhapVT_SP: moment(getDateNow(), "DD/MM/YYYY"),
            thoiGianSuDung: moment(getDateNow(), "DD/MM/YYYY"),
          },
        });
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
          `lkn_ThongTinVatTu_SanPham/${id}`,
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
            thongTinVatTu: {
              ...res.data,
              ngayNhapVT_SP: moment(res.data.ngayNhapVT_SP, "DD/MM/YYYY"),
              thoiGianSuDung: moment(res.data.thoiGianSuDung, "DD/MM/YYYY"),
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const getData = () => {
    getNhaCungCap();
    getVatTu();
  };

  /**
   * Lấy danh sách menu
   *
   */
  const getNhaCungCap = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "NhaCungCap?page=-1",
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
          setListNhaCungCap(res.data);
        } else {
          setListNhaCungCap([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getVatTu = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart("VatTu?page=-1", "GET", null, "LIST", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListVatTu(res.data);
        } else {
          setListVatTu([]);
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
    saveData(values.thongTinVatTu);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.thongTinVatTu, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (thongTinVatTu, saveQuit = false) => {
    thongTinVatTu.ngayNhapVT_SP = thongTinVatTu.ngayNhapVT_SP._i;
    thongTinVatTu.thoiGianSuDung = thongTinVatTu.thoiGianSuDung._i;
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_ThongTinVatTu_SanPham`,
            "POST",
            thongTinVatTu,
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
      thongTinVatTu.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_ThongTinVatTu_SanPham/${id}`,
            "PUT",
            thongTinVatTu,
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
   * Quay lại trang thông tin vật tư
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
    type === "new" ? "Thêm mới thông tin vật tư" : "Chỉnh sửa thông tin vật tư";

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
              label="Mã vật tư"
              name={["thongTinVatTu", "vatTu_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={maVatTu}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListVatTu ? ListVatTu : []}
                placeholder="Chọn mã vật tư"
                optionsvalue={["id", "maVatTu"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Tên vật tư"
              name={["thongTinVatTu", "vatTu_Id"]}
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
                data={ListVatTu ? ListVatTu : []}
                placeholder="Tên vật tư"
                optionsvalue={["id", "tenVatTu"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
                disabled={true}
              />
            </FormItem>
            <FormItem
              label="Nhà cung cấp"
              name={["thongTinVatTu", "nhaCungCap_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={nhomVatTu_Id}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListNhaCungCap ? ListNhaCungCap : []}
                placeholder="Chọn nhà cung cấp"
                optionsvalue={["id", "tenNhaCungCap"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Ngày nhập vật tư"
              name={["thongTinVatTu", "ngayNhapVT_SP"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <DatePicker
                format={"DD/MM/YYYY"}
                style={{ width: "100%" }}
                allowClear={false}
                disabled={type === "new" || type === "edit" ? false : true}
                onChange={(date, dateString) => {
                  setFieldsValue({
                    phieunhanhang: {
                      ngayNhapVT_SP: moment(dateString, "DD/MM/YYYY"),
                    },
                  });
                }}
              />
            </FormItem>
            <FormItem
              label="Thời gian sử dụng"
              name={["thongTinVatTu", "thoiGianSuDung"]}
            >
              <DatePicker
                format={"DD/MM/YYYY"}
                style={{ width: "100%" }}
                allowClear={false}
                disabled={type === "new" || type === "edit" ? false : true}
                onChange={(date, dateString) => {
                  setFieldsValue({
                    phieunhanhang: {
                      thoiGianSuDung: moment(dateString, "DD/MM/YYYY"),
                    },
                  });
                }}
              />
            </FormItem>
            <FormItem
              label="Ghi chú"
              name={["thongTinVatTu", "ghiChu"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input placeholder="Nhập ghi chú"></Input>
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

export default ThongTinVatTuForm;
