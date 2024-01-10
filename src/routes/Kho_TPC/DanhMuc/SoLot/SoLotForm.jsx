import { Card, Form, Input } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";

const FormItem = Form.Item;

const initialState = {
  tenLot: "",
};
const LotForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [ListPhienBanDinhMuc, setListPhienBanDinhMuc] = useState([]);
  const [form] = Form.useForm();
  const { tenLot } = initialState;
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getSanPham();
          getXuong();
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          getSanPham();
          getXuong();
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
  const getSanPham = () => {
    const params = convertObjectToUrlParams({ page: -1 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `SanPham?${params}`,
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
          setListSanPham(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  const getXuong = () => {
    const params = convertObjectToUrlParams({
      page: -1,
      donviid: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?${params}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        const xuong = [];
        res.data.forEach((x) => {
          if (x.tenPhongBan.toLowerCase().includes("xưởng")) {
            xuong.push(x);
          }
        });
        setListXuong(xuong);
      } else {
        setListXuong([]);
      }
    });
  };
  const getPhienBan = (SanPham_Id, phongBan_Id) => {
    const params = convertObjectToUrlParams({
      SanPham_Id,
      phongBan_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Lot/bom-by-san-pham-ckd?${params}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status === 200) {
        setListPhienBanDinhMuc(res.data.filter((d) => d.phienBan));
      } else {
        setListPhienBanDinhMuc([]);
      }
    });
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
        fetchStart(`Lot/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setFieldsValue({
            Lot: res.data,
          });
        }
        setInfo(res.data);
        getPhienBan(res.data.sanPham_Id, res.data.phongBan_Id);
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
    saveData(values.Lot);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.Lot, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      const newData = user;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Lot`, "POST", newData, "ADD", "", resolve, reject)
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
      const newData = { ...info, ...user };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Lot/${id}`, "PUT", newData, "EDIT", "", resolve, reject)
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

  const formTitle = type === "new" ? "Thêm mới số lot" : "Chỉnh sửa số lot";
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
            label="Số lot"
            name={["Lot", "soLot"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 250,
                message: "Số lot không được quá 250 ký tự",
              },
            ]}
            initialValue={tenLot}
          >
            <Input className="input-item" placeholder="Nhập số lot" />
          </FormItem>
          <FormItem
            label="Sản phẩm"
            name={["Lot", "sanPham_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham ? ListSanPham : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "tenSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={(val) => {
                const pb = form.getFieldValue("Lot").phongBan_Id;
                if (pb) {
                  getPhienBan(val, pb);
                }
              }}
            />
          </FormItem>
          <FormItem
            label="Số lượng"
            name={["Lot", "soLuong"]}
            rules={[
              {
                pattern: /^[1-9]\d*$/,
                required: true,
                message: "Số lượng phải lớn hơn 0!",
              },
            ]}
            initialValue={tenLot}
          >
            <Input
              className="input-item"
              type="number"
              placeholder="Nhập số lượng"
            />
          </FormItem>
          <FormItem
            label="Xưởng"
            name={["Lot", "phongBan_Id"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong ? ListXuong : []}
              placeholder="Chọn xưởng"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={(val) => {
                const sp = form.getFieldValue("Lot").sanPham_Id;
                if (sp) {
                  getPhienBan(sp, val);
                }
              }}
            />
          </FormItem>
          <FormItem
            label="Phiên bản định mức"
            name={["Lot", "lkn_DinhMucVatTu_Id"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListPhienBanDinhMuc ? ListPhienBanDinhMuc : []}
              placeholder="Chọn phiên bản định mức"
              optionsvalue={["id", "phienBan"]}
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
      </Card>
    </div>
  );
};

export default LotForm;
