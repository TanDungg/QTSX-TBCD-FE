import React, { useState, useEffect } from "react";
import { Form, Input, Card, Col } from "antd";
import { useDispatch } from "react-redux";
import includes from "lodash/includes";
import { Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions";
import { DEFAULT_FORM_ADD_150PX } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import { isEmpty } from "lodash";

const FormItem = Form.Item;

const CanBoNhanVienForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [ListBoPhan, setListBoPhan] = useState([]);
  const [id, setId] = useState(null);
  const [chiTietId, setChiTietId] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListDonVi();
        getListPhongBan();
        setFieldsValue({
          user: {
            donVi_Id: INFO.donVi_Id.toLowerCase(),
          },
        });
      } else if (permission && !permission.add) {
        history.push("/home");
      }
    } else {
      if (permission && permission.edit) {
        setType("edit");
        const id = match.params.id.split("_");
        setId(id[0]);
        setChiTietId(id[1]);
        getInfo(id);
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`DonVi?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListDonVi(res.data);
        } else {
          setListDonVi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListPhongBan = () => {
    let param = convertObjectToUrlParams({ donviid: INFO.donVi_Id, page: -1 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?${param}`,
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
          setListPhongBan(res.data);
        } else {
          setListPhongBan([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListBoPhan = (phongbanid) => {
    let param = convertObjectToUrlParams({ phongbanid, page: -1 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `BoPhan?${param}`,
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
          setListBoPhan(res.data);
        } else {
          setListBoPhan([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${id[0]}?chiTiet_id=${id[1]}`,
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
          const data = res.data;
          getListDonVi(data.tapDoan_Id);
          getListPhongBan(data.donVi_Id);
          getListBoPhan(data.phongBan_Id);
          setFieldsValue({
            user: data,
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const onFinish = (values) => {
    saveData(values.user);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.user, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        email: user.email ? user.email : null,
        fullName: user.fullName,
        maNhanVien: user.maNhanVien,
        phoneNumber: user.phoneNumber,
        donViTraLuong_Id: user.donViTraLuong_Id,
        chiTiet: [
          {
            chucVu_Id: user.chucVu_Id,
            donVi_Id: user.donVi_Id,
            phongBan_Id: user.phongBan_Id,
            boPhan_Id: user.boPhan_Id,
            tapDoan_Id: INFO.tapDoan_Id,
          },
        ],
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Account/post-cbnv`,
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
          if (res && res.status === 409) {
            setFieldTouch(false);
          } else {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              setFieldsValue({
                user: {
                  donVi_Id: INFO.donVi_Id.toLowerCase(),
                },
              });
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const Data = {
        email: user.email ? user.email : null,
        fullName: user.fullName,
        maNhanVien: user.maNhanVien,
        phoneNumber: user.phoneNumber,
        donViTraLuong_Id: user.donViTraLuong_Id,
        chiTiet: [
          {
            id: chiTietId,
            chucVu_Id: user.chucVu_Id,
            donVi_Id: user.donVi_Id,
            phongBan_Id: user.phongBan_Id,
            boPhan_Id: user.boPhan_Id,
            tapDoan_Id: INFO.tapDoan_Id,
            user_Id: id,
          },
        ],
      };
      const newData = { ...Data };
      newData.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Account/put-cbnv/${id}`,
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

  const validatePhoneNumber = (rule, value, callback) => {
    if (!isEmpty(value)) {
      const phoneNumberRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/g;
      if (phoneNumberRegex.test(value)) {
        callback();
      } else {
        callback("Số điện thoại không hợp lệ.");
      }
    } else {
      callback();
    }
  };

  const handleSelectPhongBan = (value) => {
    getListBoPhan(value);
    setFieldsValue({
      user: {
        boPhan_Id: null,
      },
    });
  };

  const formTitle =
    type === "new" ? "Thêm mới cán bộ nhân viên" : "Chỉnh sửa cán bộ nhân viên";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom"
        align={"center"}
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_150PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Họ tên"
              name={["user", "fullName"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập họ tên" />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Mã nhân viên"
              name={["user", "maNhanVien"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập mã nhân viên" />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Địa chỉ email"
              name={["user", "email"]}
              rules={[
                {
                  type: "email",
                  message: "Không đúng định dạng email",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập địa chỉ email" />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Số điện thoại"
              name={["user", "phoneNumber"]}
              rules={[
                {
                  type: "string",
                },
                { validator: validatePhoneNumber },
              ]}
            >
              <Input className="input-item" placeholder="Nhập số điện thoại" />
            </FormItem>
          </Col>
          {/* <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
              <FormItem
                label="Tập đoàn"
                name={["user", "tapDoan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListTapDoan ? ListTapDoan : []}
                  placeholder="Chọn tập đoàn"
                  optionsvalue={["id", "tenTapDoan"]}
                  style={{ width: "100%" }}
                  disabled
                  showSearch
                  optionFilterProp={"name"}
                />
              </FormItem>
            </Col> */}
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Đơn vị"
              name={["user", "donVi_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListDonVi ? ListDonVi : []}
                placeholder="Chọn đơn vị"
                optionsvalue={["id", "tenDonVi"]}
                style={{ width: "100%" }}
                disabled
              />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Phòng ban"
              name={["user", "phongBan_Id"]}
              rules={[
                {
                  required: true,
                  type: "string",
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListPhongBan ? ListPhongBan : []}
                placeholder="Chọn phòng ban"
                optionsvalue={["id", "tenPhongBan"]}
                style={{ width: "100%" }}
                onSelect={handleSelectPhongBan}
                showSearch
                optionFilterProp={"name"}
              />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Bộ phận"
              name={["user", "boPhan_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListBoPhan ? ListBoPhan : []}
                placeholder="Chọn bộ phận"
                optionsvalue={["id", "tenBoPhan"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp={"name"}
              />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Đơn vị trả lương"
              name={["user", "donViTraLuong_Id"]}
              rules={[
                {
                  required: true,
                  type: "string",
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListDonVi ? ListDonVi : []}
                placeholder="Chọn đơn vị trả lương"
                optionsvalue={["id", "tenDonVi"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp={"name"}
              />
            </FormItem>
          </Col>
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

export default CanBoNhanVienForm;
