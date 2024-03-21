import React, { useState, useEffect } from "react";
import { Form, Input, Card, Col, Row, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions";
import { DEFAULT_FORM_ADD_2COL_200PX } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { isEmpty } from "lodash";
import moment from "moment";

const FormItem = Form.Item;

const CanBoNhanVienForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [form] = Form.useForm();
  const { validateFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListCapDoNhanSu, setListCapDoNhanSu] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [ListChucDanh, setListChucDanh] = useState([]);
  const [ListChucVu, setListChucVu] = useState([]);
  const [ListThanhPhan, setListThanhPhan] = useState([]);
  const [ListDonViTraLuong, setListDonViTraLuong] = useState([]);
  const [id, setId] = useState(undefined);

  useEffect(() => {
    if (permission && permission.edit) {
      const { id } = match.params;
      setId(id);
      getInfo(id);
      getListCapDoNhanSu();
      getListDonVi();
      getListChucDanh();
      getListChucVu();
      getListThanhPhan();
      getListDonViTraLuong();
    } else if (permission && !permission.edit) {
      history.push("/home");
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

  const getListCapDoNhanSu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/list-cap-do-nhan-su`,
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
          setListCapDoNhanSu(res.data);
        } else {
          setListCapDoNhanSu([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListPhongBan = (donVi_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/list-ma-phong-ban?donVi_Id=${donVi_Id}`,
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

  const getListChucDanh = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/list-chuc-danh`,
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
          setListChucDanh(res.data);
        } else {
          setListChucDanh([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListChucVu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/list-chuc-vu`,
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
          setListChucVu(res.data);
        } else {
          setListChucVu([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListThanhPhan = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/list-thanh-phan`,
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
          setListThanhPhan(res.data);
        } else {
          setListThanhPhan([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDonViTraLuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/list-don-vi-tra-luong`,
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
          setListDonViTraLuong(res.data);
        } else {
          setListDonViTraLuong([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Account/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          const data = res.data;
          getListPhongBan(data.donVi_Id);
          setFieldsValue({
            user: {
              ...data,
              ngaySinh: data.ngaySinh && moment(data.ngaySinh, "DD/MM/YYYY"),
              ngayVaoLam:
                data.ngayVaoLam && moment(data.ngayVaoLam, "DD/MM/YYYY"),
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const goBack = () => {
    history.push(`${match.url.replace(`/${match.params.id}/chinh-sua`, "")}`);
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
    const newData = {
      ...user,
      id: id,
      ngaySinh: user.ngaySinh && user.ngaySinh.format("DD/MM/YYYY"),
      ngayVaoLam: user.ngayVaoLam && user.ngayVaoLam.format("DD/MM/YYYY"),
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Account/${id}`, "PUT", newData, "EDIT", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.status === 409) {
          setFieldTouch(false);
        } else {
          if (saveQuit) {
            goBack();
          } else {
            getInfo(id);
            setFieldTouch(false);
          }
        }
      })
      .catch((error) => console.error(error));
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

  const handleSelectDonVi = (value) => {
    getListPhongBan(value);
    setFieldsValue({
      user: {
        maPhongBanHRM: null,
      },
    });
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader title={"Chỉnh sửa cán bộ nhân viên"} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_ADD_2COL_200PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Row align={width >= 1600 ? "" : "center"} style={{ width: "100%" }}>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
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
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
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
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
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
                <Input
                  className="input-item"
                  placeholder="Nhập địa chỉ email"
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
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
                <Input
                  className="input-item"
                  placeholder="Nhập số điện thoại"
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
              <FormItem
                label="Ngày sinh"
                name={["user", "ngaySinh"]}
                rules={[
                  {
                    type: "date",
                  },
                ]}
              >
                <DatePicker format={"DD/MM/YYYY"} allowClear={false} />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
              <FormItem
                label="Ngày vào làm"
                name={["user", "ngayVaoLam"]}
                rules={[
                  {
                    type: "date",
                  },
                ]}
              >
                <DatePicker format={"DD/MM/YYYY"} allowClear={false} />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
              <FormItem
                label="Chuyên môn"
                name={["user", "trinhDoChuyenMon"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập trình độ chuyên môn"
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
              <FormItem
                label="Cấp độ"
                name={["user", "capDoNhanSu_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListCapDoNhanSu ? ListCapDoNhanSu : []}
                  placeholder="Chọn cấp độ nhân sự"
                  optionsvalue={["id", "tenCapDoNhanSu"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
              <FormItem
                label="Trường"
                name={["user", "truong"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input className="input-item" placeholder="Nhập tên trường" />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
              <FormItem
                label="Email thông báo"
                name={["user", "emailThongBao"]}
                rules={[
                  {
                    type: "email",
                    message: "Không đúng định dạng email",
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập địa chỉ email thông báo"
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
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
                  onSelect={handleSelectDonVi}
                  showSearch
                  optionFilterProp={"name"}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
              <FormItem
                label="Phòng ban"
                name={["user", "maPhongBanHRM"]}
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
                  optionsvalue={["maPhongBanHRM", "tenPhongBan"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
              <FormItem
                label="Chức danh"
                name={["user", "chucDanh_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListChucDanh ? ListChucDanh : []}
                  placeholder="Chọn chức danh"
                  optionsvalue={["id", "tenChucDanh"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
              <FormItem
                label="Chức vụ"
                name={["user", "chucVu_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListChucVu ? ListChucVu : []}
                  placeholder="Chọn chức vụ"
                  optionsvalue={["id", "tenChucVu"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
              <FormItem
                label="Thành phần"
                name={["user", "thanhPhan_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListThanhPhan ? ListThanhPhan : []}
                  placeholder="Chọn bộ phận"
                  optionsvalue={["id", "tenThanhPhan"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
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
                  data={ListDonViTraLuong ? ListDonViTraLuong : []}
                  placeholder="Chọn đơn vị trả lương"
                  optionsvalue={["id", "tenDonViTraLuong"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={16}
              lg={22}
              md={22}
              sm={24}
              xs={24}
              style={{ marginBottom: "5px" }}
            >
              <FormItem
                label="Ghi chú"
                name={["user", "ghiChu"]}
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

export default CanBoNhanVienForm;
