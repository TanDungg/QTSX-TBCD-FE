import React, { useState, useEffect } from "react";
import { Form, Input, Card, Col, Row, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import includes from "lodash/includes";
import { Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions";
import { DEFAULT_FORM_ADD_2COL_200PX } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import { isEmpty } from "lodash";
import moment from "moment";

const FormItem = Form.Item;

const CanBoNhanVienForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [ListDonVi, setListDonVi] = useState([]);
  const [DonVi, setDonVi] = useState([]);
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [ListBoPhan, setListBoPhan] = useState([]);
  const [ListChucVu, setListChucVu] = useState([]);
  const [ListChuyenMon, setListChuyenMon] = useState([]);
  const [ListCapDoNhanSu, setListCapDoNhanSu] = useState([]);
  const [ListTruong, setListTruong] = useState([]);
  const [id, setId] = useState(undefined);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListDonVi();
        getListChucVu();
        getListChuyenMon();
        getListTruong();
        getListCapDoNhanSu();
      } else if (permission && !permission.add) {
        history.push("/home");
      }
    } else {
      if (permission && permission.edit) {
        setType("edit");
        const { id } = match.params;
        setId(id);
        setDonVi(history.location.state.itemData.donVi_Id);
        getInfo(id, history.location.state.itemData.donVi_Id);
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
        fetchStart(
          `DonVi/don-vi-by-user`,
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
          setListDonVi(res.data);
        } else {
          setListDonVi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListPhongBan = (donviid) => {
    let param = convertObjectToUrlParams({ donviid, page: -1 });
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

  const getListChucVu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChucDanhChucVu?page=-1`,
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

  const getListChuyenMon = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChuyenMon?page=-1`,
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
          setListChuyenMon(res.data);
        } else {
          setListChuyenMon([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListCapDoNhanSu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_CapDoNhanSu?page=-1`,
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

  const getListTruong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_Truong?page=-1`,
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
          setListTruong(res.data);
        } else {
          setListTruong([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (user_Id, donVi_Id) => {
    const param = convertObjectToUrlParams({ user_Id, donVi_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThongTinCBNV/${user_Id}?${param}`,
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
          getListChucVu();
          getListChuyenMon();
          getListCapDoNhanSu();
          getListTruong();
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
    const newData = {
      ...user,
      ngaySinh: user.ngaySinh && user.ngaySinh.format("DD/MM/YYYY"),
      ngayVaoLam: user.ngayVaoLam && user.ngayVaoLam.format("DD/MM/YYYY"),
    };
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_ThongTinCBNV`,
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
              setListPhongBan([]);
              setListBoPhan([]);
              setFieldTouch(false);
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...user,
        id: id,
        ngaySinh: user.ngaySinh && user.ngaySinh.format("DD/MM/YYYY"),
        ngayVaoLam: user.ngayVaoLam && user.ngayVaoLam.format("DD/MM/YYYY"),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_ThongTinCBNV/${id}`,
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
          if (res && res.status === 409) {
            setFieldTouch(false);
          } else {
            if (saveQuit) {
              goBack();
            } else {
              getInfo(id, DonVi);
              setFieldTouch(false);
            }
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

  const handleSelectDonVi = (value) => {
    getListPhongBan(value);
    setFieldsValue({
      user: {
        phongBan_Id: null,
        boPhan_Id: null,
      },
    });
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
                name={["user", "vptq_lms_ChuyenMon_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListChuyenMon ? ListChuyenMon : []}
                  placeholder="Chọn trình độ chuyên môn"
                  optionsvalue={["id", "tenChuyenMon"]}
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
                label="Cấp độ"
                name={["user", "vptq_lms_CapDoNhanSu_Id"]}
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
                name={["user", "vptq_lms_Truong_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListTruong ? ListTruong : []}
                  placeholder="Chọn trường tốt nghiệp"
                  optionsvalue={["id", "tenTruong"]}
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
                  data={ListDonVi ? ListDonVi : []}
                  placeholder="Chọn đơn vị trả lương"
                  optionsvalue={["id", "tenDonVi"]}
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
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListChucVu ? ListChucVu : []}
                  placeholder="Chọn chức vụ"
                  optionsvalue={["chucVu_Id", "tenChucVu"]}
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
                name={["user", "moTa"]}
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
