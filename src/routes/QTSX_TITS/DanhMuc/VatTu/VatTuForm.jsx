import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
import { Input, Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";

const FormItem = Form.Item;

const initialState = {
  maVatTu: "",
  tenVatTu: "",
  tits_qtsx_LoaiVatTu_Id: "",
  thongSoKyThuat: "",
  tits_qtsx_MauSac_Id: "",
  donViTinh_Id: "",
  donViTinhQuyDoi_Id: "",
  tiLeQuyDoi: "",
};

function VatTuForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { loading } = useSelector(({ common }) => common).toJS();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListLoaiVatTu, setListLoaiVatTu] = useState([]);
  const [ListMauSac, setListMauSac] = useState([]);
  const [DonViTinhSelect, setDonViTinhSelect] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);
  const {
    maVatTu,
    tenVatTu,
    tits_qtsx_LoaiVatTu_Id,
    thongSoKyThuat,
    tits_qtsx_MauSac_Id,
    donViTinh_Id,
    donViTinhQuyDoi_Id,
    tiLeQuyDoi,
  } = initialState;
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
          `tits_qtsx_VatTu/${id}`,
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
            vattu: res.data,
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
          "tits_qtsx_LoaiVatTu?page=-1",
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
          setListLoaiVatTu(res.data);
        } else {
          setListLoaiVatTu([]);
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
        fetchStart(
          "tits_qtsx_MauSac?page=-1",
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
          setListMauSac(res.data);
        } else {
          setListMauSac([]);
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
          `DonViTinh?donVi_Id=${INFO.donVi_Id}&page=-1`,
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

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.vattu);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.vattu, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (vattu, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_VatTu`,
            "POST",
            vattu,
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
      vattu.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_VatTu/${id}`,
            "PUT",
            vattu,
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
   * Quay lại trang chức năng
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

  const formTitle = type === "new" ? "Thêm mới vật tư" : "Chỉnh sửa vật tư";

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
              name={["vattu", "maVatTu"]}
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
              <Input className="input-item" placeholder="Nhập mã vật tư" />
            </FormItem>
            <FormItem
              label="Tên vật tư"
              name={["vattu", "tenVatTu"]}
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
              <Input className="input-item" placeholder="Nhập tên vật tư" />
            </FormItem>
            <FormItem
              label="Loại vật tư"
              name={["vattu", "tits_qtsx_LoaiVatTu_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
              initialValue={tits_qtsx_LoaiVatTu_Id}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListLoaiVatTu ? ListLoaiVatTu : []}
                placeholder="Chọn loại vật tư"
                optionsvalue={["id", "tenLoaiVatTu"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Thông số kỹ thuật"
              name={["vattu", "thongSoKyThuat"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={thongSoKyThuat}
            >
              <Input placeholder="Nhập thông số kỹ thuật"></Input>
            </FormItem>
            <FormItem
              label="Màu sắc"
              name={["vattu", "tits_qtsx_MauSac_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={tits_qtsx_MauSac_Id}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListMauSac ? ListMauSac : []}
                placeholder="Chọn màu sắc"
                optionsvalue={["id", "tenMauSac"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Đơn vị tính"
              name={["vattu", "donViTinh_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
              initialValue={donViTinh_Id}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={DonViTinhSelect ? DonViTinhSelect : []}
                placeholder="Chọn đơn vị tính"
                optionsvalue={["id", "tenDonViTinh"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Đơn vị tính quy đổi"
              name={["vattu", "donViTinhQuyDoi_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={donViTinhQuyDoi_Id}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={DonViTinhSelect ? DonViTinhSelect : []}
                placeholder="Chọn đơn vị tính quy đổi"
                optionsvalue={["id", "tenDonViTinh"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Tỉ lệ quy đổi"
              name={["vattu", "tiLeQuyDoi"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={tiLeQuyDoi}
            >
              <Input className="input-item" placeholder="Nhập tỉ lệ quy đổi" />
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

export default VatTuForm;
