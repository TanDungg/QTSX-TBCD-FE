import React, { useState, useEffect } from "react";
import { Form, Input, Card, DatePicker } from "antd";
import { useDispatch } from "react-redux";
import includes from "lodash/includes";
import { Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams, getDateNow } from "src/util/Common";
import { isEmpty } from "lodash";
import moment from "moment";
const FormItem = Form.Item;

const initialState = {
  email: "",
  fullName: "",
  userName: "",
  maNhanVien: "",
  phoneNumber: "",
  chucVu_Id: "",
  boPhan_Id: "",
  phongBan_Id: "",
  donVi_Id: "",
  donViTraLuong_Id: "",
  tapDoan_Id: "",
};
const CanBoNhanVienForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListDonViTraLuong, setListDonViTraLuong] = useState([]);
  const [ListChucVu, setListChucVu] = useState([]);
  const [ListChucDanh, setListChucDanh] = useState([]);
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListThanhPhan, setListThanhPhan] = useState([]);
  const [ListCapDoNhanSu, setListCapDoNhanSu] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [info, setInfo] = useState({});
  const [form] = Form.useForm();
  const {
    email,
    fullName,
    maNhanVien,
    phoneNumber,
    chucVu_Id,
    phongBan_Id,
    donVi_Id,
    donViTraLuong_Id,
  } = initialState;
  const { validateFields, resetFields, setFieldsValue } = form;

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getData();
          setType("new");
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          getData();
          const id = match.params.id;
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
  const getData = () => {
    getChucVu();
    getChucDanh();
    getDonVi();
    getDonViTraLuong();
    getThanhPham();
    getCapDoNhanSu();
  };
  const getChucVu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`ChucVu?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.status === 200) {
          setListChucVu(res.data);
        } else {
          setListChucVu([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getChucDanh = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `ChucDanh?page=-1`,
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
        if (res && res.status === 200) {
          setListChucDanh(res.data);
        } else {
          setListChucDanh([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`DonVi?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListDonVi(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  const getDonViTraLuong = () => {
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
        if (res && res.status === 200) {
          setListDonViTraLuong(res.data);
        } else {
          setListDonViTraLuong([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getThanhPham = () => {
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
        if (res && res.status === 200) {
          setListThanhPhan(res.data);
        } else {
          setListThanhPhan([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getCapDoNhanSu = () => {
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
        if (res && res.status === 200) {
          setListCapDoNhanSu(res.data);
        } else {
          setListCapDoNhanSu([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getPhongBan = (donVi_Id) => {
    let param = convertObjectToUrlParams({ donVi_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/list-ma-phong-ban?${param}`,
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
        if (res && res.status === 200) {
          setListPhongBan(
            res.data.map((pb) => {
              return {
                ...pb,
                name: pb.maPhongBanHRM + " - " + pb.tenPhongBan,
              };
            })
          );
        } else {
          setListPhongBan([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Account/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          const data = res.data;
          getPhongBan(data.donVi_Id);
          setFieldsValue({
            user: {
              ...data,
              ngaySinh: moment(data.ngaySinh, "DD/MM/YYYY"),
              ngayVaoLam: moment(data.ngayVaoLam, "DD/MM/YYYY"),
            },
          });
          setInfo(data);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Quay lại trang người dùng
   *
   */
  const goBack = () => {
    history.push("/he-thong-erp/can-bo-nhan-vien");
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    setFieldTouch(false);
    saveData(values.user);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        setFieldTouch(false);
        saveData(values.user, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...user,
        ngaySinh: user.ngaySinh.format("DD/MM/YYYY"),
        ngayVaoLam: user.ngayVaoLam.format("DD/MM/YYYY"),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Account`, "POST", newData, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (res.status === 200) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
            }
          } else {
            setFieldTouch(true);
          }
        })
        .catch((error) => console.error(error));
    } else if (type === "edit") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Account/${id}`,
            "PUT",
            {
              ...user,
              id: id,
              ngaySinh: user.ngaySinh.format("DD/MM/YYYY"),
              ngayVaoLam: user.ngayVaoLam.format("DD/MM/YYYY"),
            },
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res.status === 200) {
            if (saveQuit) {
              goBack();
            } else {
              getInfo(id);
              setFieldTouch(false);
            }
          } else {
            setFieldTouch(true);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleSelectDonVi = (val) => {
    getPhongBan(val);
    setFieldsValue({
      user: {
        maPhongBanHRM: null,
      },
    });
  };

  const validatePhoneNumber = (rule, value, callback) => {
    if (!isEmpty(value)) {
      const phoneNumberRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/g;
      if (phoneNumberRegex.test(value)) {
        callback(); // Validation passed
      } else {
        callback("Số điện thoại không hợp lệ."); // Validation failed
      }
    } else {
      callback();
    }
  };
  const validateEmail = (rule, value, callback) => {
    const checkEmail = (val) => {
      if (val.split("@")[1] !== "thaco.com.vn") {
        return callback("Email không phải là email THACO");
      }
    };
    if (!isEmpty(value)) {
      if (type === "add") {
        checkEmail(value);
      } else {
        if (info.email === value) {
          callback();
        } else {
          checkEmail(value);
        }
      }
      callback();
    } else {
      callback();
    }
  };
  const disabledDate = (current) => {
    return current && current > moment(getDateNow(), "DD/MM/YYYY").endOf("day");
  };
  const formTitle =
    type === "new" ? "Thêm mới cán bộ nhân viên" : "Chỉnh sửa cán bộ nhân viên";
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
            label="Địa chỉ email"
            name={["user", "email"]}
            rules={[
              {
                type: "email",
                message: "Không đúng định dạng email",
              },
              { validator: validateEmail },
            ]}
            initialValue={email}
          >
            <Input className="input-item" placeholder="Nhập địa chỉ email" />
          </FormItem>
          <FormItem
            label="Họ tên"
            name={["user", "fullName"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={fullName}
          >
            <Input className="input-item" placeholder="Nhập họ tên" />
          </FormItem>
          <FormItem
            label="Mã nhân viên"
            name={["user", "maNhanVien"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={maNhanVien}
          >
            <Input className="input-item" placeholder="Nhập mã nhân viên" />
          </FormItem>
          <FormItem
            label="Ngày sinh"
            name={["user", "ngaySinh"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <DatePicker
              format={"DD/MM/YYYY"}
              disabledDate={disabledDate}
              allowClear
              onChange={(date, dateString) => {
                if (dateString === "") {
                  setFieldsValue({
                    user: { ngaySinh: null },
                  });
                }
              }}
            />
          </FormItem>
          <FormItem
            label="Ngày vào làm"
            name={["user", "ngayVaoLam"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <DatePicker
              format={"DD/MM/YYYY"}
              disabledDate={disabledDate}
              allowClear
              onChange={(date, dateString) => {
                if (dateString === "") {
                  setFieldsValue({
                    user: { ngayVaoLam: null },
                  });
                }
              }}
            />
          </FormItem>
          <FormItem
            label="Số điện thoại"
            name={["user", "phoneNumber"]}
            rules={[
              {
                type: "string",
              },
              { validator: validatePhoneNumber },
            ]}
            initialValue={phoneNumber}
          >
            <Input className="input-item" placeholder="Nhập số điện thoại" />
          </FormItem>
          <FormItem
            label="Đơn vị"
            name={["user", "donVi_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={donVi_Id}
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
          <FormItem
            label="Đơn vị trả lương"
            name={["user", "donViTraLuong_Id"]}
            rules={[
              {
                required: true,
                type: "string",
              },
            ]}
            initialValue={donViTraLuong_Id}
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
          <FormItem
            label="Phòng ban"
            name={["user", "maPhongBanHRM"]}
            rules={[
              {
                required: true,
                type: "string",
              },
            ]}
            initialValue={phongBan_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListPhongBan ? ListPhongBan : []}
              placeholder="Chọn phòng ban"
              optionsvalue={["maPhongBanHRM", "name"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
            />
          </FormItem>
          <FormItem
            label="Chức danh"
            name={["user", "chucDanh_Id"]}
            rules={[
              {
                type: "string",
                required: true,
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
          <FormItem
            label="Chức vụ"
            name={["user", "chucVu_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={chucVu_Id}
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
          <FormItem
            label="Thành phần"
            name={["user", "thanhPhan_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListThanhPhan ? ListThanhPhan : []}
              placeholder="Chọn thành phần"
              optionsvalue={["id", "tenThanhPhan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
            />
          </FormItem>
          <FormItem
            label="Cấp độ nhân sự"
            name={["user", "capDoNhanSu_Id"]}
            rules={[
              {
                type: "string",
                required: true,
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
          <FormItem
            label="Trình độ chuyên môn"
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
          <FormItem
            label="Trường"
            name={["user", "truong"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Input className="input-item" placeholder="Nhập trường" />
          </FormItem>
          <FormItem
            label="Chuyên ngành"
            name={["user", "chuyenNganh"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Input className="input-item" placeholder="Nhập chuyên ngành" />
          </FormItem>
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
