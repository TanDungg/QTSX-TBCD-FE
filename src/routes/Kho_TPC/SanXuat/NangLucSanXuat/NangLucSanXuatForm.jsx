import { Card, Form, Input, Row, Col, DatePicker } from "antd";
import { includes } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";

const FormItem = Form.Item;

const NangLucSanXuatForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListThietBi, setListThietBi] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getUserLap(INFO);
          getThietBi();
          setType("new");
          getSanPham();
          setFieldsValue({
            nanglucsx: {
              ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
            },
          });
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else if (includes(match.url, "chinh-sua")) {
        if (permission && permission.edit) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserLap = (info, nguoiLap_Id) => {
    const params = convertObjectToUrlParams({
      id: nguoiLap_Id ? nguoiLap_Id : info.user_Id,
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${info.user_Id}?${params}`,
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
        setListUser([res.data]);
        setFieldsValue({
          nanglucsx: {
            userLap_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      } else {
      }
    });
  };

  const getSanPham = (id) => {
    if (id) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `SanPham/${id}`,
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
          setListSanPham([res.data]);
        } else {
          setListSanPham([]);
        }
      });
    } else {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `SanPham?page=-1`,
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
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      });
    }
  };
  const getThietBi = (id) => {
    if (id) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `ThietBi/${id}`,
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
          setListThietBi([res.data]);
        } else {
          setListThietBi([]);
        }
      });
    } else {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `ThietBi?page=-1`,
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
          setListThietBi(res.data);
        } else {
          setListThietBi([]);
        }
      });
    }
  };
  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `NangLucSanXuat/${id}`,
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
          const data = JSON.parse(res.data.chiTietNLSX)[0];
          getUserLap(INFO, res.data.nguoiLap_Id);
          setInfo(res.data);
          getSanPham();
          getThietBi();
          setFieldsValue({
            nanglucsx: {
              sanPham_Id: res.data.sanPham_Id,
              thietBi_Id: res.data.thietBi_Id,
              ngayYeuCau: moment(res.data.ngayLap, "DD/MM/YYYY"),
              nguoiLap_Id: res.data.nguoiLap_Id,
              slNhanSu: data.slnhanSu,
              nangXuat: data.nangXuat,
              soLuongSanPham: data.soLuongSanPham,
              thoiGian: data.thoiGian,
              ghiChu: data.ghiChu,
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Quay lại trang bộ phận
   *
   */
  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${id}/chinh-sua`,
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
    saveData(values.nanglucsx);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        saveData(values.nanglucsx, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (nanglucsx, saveQuit = false) => {
    const newData = {
      ...nanglucsx,
      chiTietNLSXs: [
        {
          thoiGian: nanglucsx.thoiGian,
          slNhanSu: Number(nanglucsx.slNhanSu),
          nangXuat: nanglucsx.nangXuat,
          soLuongSanPham: Number(nanglucsx.soLuongSanPham),
          ghiChu: nanglucsx.ghiChu,
        },
      ],
    };
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `NangLucSanXuat`,
            "POST",
            newData,
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
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      newData.id = id;
      //   newData.mananglucsx = info.mananglucsx;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `NangLucSanXuat/${id}`,
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
            getInfo(id);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const formTitle =
    type === "new" ? "Tạo năng lực sản xuất " : "Chỉnh sửa năng lực sản xuất";

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
          <Row>
            <Col span={12}>
              <FormItem
                label="Người lập"
                name={["nanglucsx", "userLap_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUser ? ListUser : []}
                  optionsvalue={["Id", "fullName"]}
                  style={{ width: "100%" }}
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Ban/Phòng"
                name={["nanglucsx", "tenPhongBan"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input className="input-item" disabled={true} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Sản phẩm"
                name={["nanglucsx", "sanPham_Id"]}
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
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Ngày lập"
                name={["nanglucsx", "ngayYeuCau"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  disabled={true}
                />
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                label="Thiết bị"
                name={["nanglucsx", "thietBi_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListThietBi ? ListThietBi : []}
                  placeholder="Chọn thiết bị"
                  optionsvalue={["id", "tenThietBi"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="SL nhân sự"
                name={["nanglucsx", "slNhanSu"]}
                rules={[
                  {
                    required: true,
                  },
                  {
                    pattern: /^[1-9]\d*$/,
                    message: "SL nhân sự phải là số và lớn hơn 0!",
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập số lượng nhân sự"
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="SL sản phẩm"
                name={["nanglucsx", "soLuongSanPham"]}
                rules={[
                  {
                    required: true,
                  },
                  {
                    pattern: /^[1-9]\d*$/,
                    message: "SL sản phẩm phải là số và lớn hơn 0!",
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập số lượng sản phẩm"
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Thời gian"
                name={["nanglucsx", "thoiGian"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input className="input-item" placeholder="Nhập thời gian" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Năng suất"
                name={["nanglucsx", "nangXuat"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input className="input-item" placeholder="Nhập năng suất" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Ghi chú"
                name={["nanglucsx", "ghiChu"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input className="input-item" placeholder="Nhập ghi chú" />
              </FormItem>
            </Col>
          </Row>

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

export default NangLucSanXuatForm;
