import React, { useState, useEffect } from "react";
import { Form, Input, Card } from "antd";
import { useDispatch } from "react-redux";
import includes from "lodash/includes";
import { Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams, getLocalStorage } from "src/util/Common";
import { isEmpty } from "lodash";
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
  const INFO = getLocalStorage("menu");
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [chiTietId, setChiTietId] = useState(undefined);

  const [chucVuSelect, setChucVuSelect] = useState([]);
  const [boPhanSelect, setBoPhanSelect] = useState([]);
  const [CBNVSelect, setCBNVSelect] = useState([]);

  const [phongBanSelect, setPhongBanSelect] = useState([]);
  const [donViSelect, setDonViSelect] = useState([]);
  const [TapDoanSelect, setTapDoanSelect] = useState([]);

  const [fieldTouch, setFieldTouch] = useState(false);
  const [info, setInfo] = useState({});
  const [form] = Form.useForm();
  const {
    email,
    fullName,
    maNhanVien,
    phoneNumber,
    chucVu_Id,
    boPhan_Id,
    phongBan_Id,
    donVi_Id,
    donViTraLuong_Id,
    tapDoan_Id,
  } = initialState;
  const { validateFields, resetFields, setFieldsValue } = form;

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getData();
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          // Get info
          const param = match.params.id.split("_");
          setId(param[0]);
          setChiTietId(param[1]);
          getInfo(param);
          getData();
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
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`ChucVu?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setChucVuSelect(res.data);
        }
      })
      .catch((error) => console.error(error));
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `TapDoan/tap-doan-tree?donviid=${INFO.donVi_Id}`,
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
          setTapDoanSelect(res.data);
          setFieldsValue({
            user: {
              tapDoan_Id: res.data[0].id,
            },
          });
          getDonVi();
        } else {
          setTapDoanSelect([]);
        }
      })
      .catch((error) => console.error(error));
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?key=1`,
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
          setCBNVSelect(res.data);
        } else {
          setCBNVSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/don-vi-tree?donviid=${INFO.donVi_Id}`,
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
          setDonViSelect(res.data);
          getPhongBan(res.data[0].id);
          setFieldsValue({
            user: {
              donVi_Id: res.data[0].id,
              donViTraLuong_Id: res.data[0].id,
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };
  const getPhongBan = (donviid) => {
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
          setPhongBanSelect(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  const getBoPhan = (phongbanid) => {
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
          setBoPhanSelect(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy thông tin
   *
   */
  const getInfo = (param) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${param[0]}?id=${param[0]}&&chiTiet_id=${param[1]}`,
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
          getPhongBan(data.donVi_Id);
          getBoPhan(data.phongBan_Id);
          getDonVi(data.tapDoan_Id);
          setFieldsValue({
            user: data,
          });
          setInfo(data);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Quay lại trang danh sách cbnv
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
            tapDoan_Id: user.tapDoan_Id,
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
          if (saveQuit) {
            if (res.status !== 409) goBack();
          } else {
            resetFields();
            setFieldTouch(false);
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
            tapDoan_Id: user.tapDoan_Id,
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
            getInfo([id, chiTietId]);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };
  const handleSelectPhongBan = (val) => {
    getBoPhan(val);
    setFieldsValue({
      user: {
        boPhan_Id: null,
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
  const validateMaNhanVien = (rule, value, callback) => {
    const checkMaNhanVien = (val) => {
      CBNVSelect.forEach((d) => {
        if (d.maNhanVien === val) {
          callback("Mã nhân viên đã tồn tại");
        }
      });
    };
    if (!isEmpty(value)) {
      if (type === "add") {
        checkMaNhanVien(value);
      } else {
        if (info.maNhanVien === value) {
          callback();
        } else {
          checkMaNhanVien(value);
        }
      }
      callback();
    } else {
      callback();
    }
  };
  const validateEmail = (rule, value, callback) => {
    const checkEmail = (val) => {
      if (val.split("@")[1] === "thaco.com.vn") {
        CBNVSelect.forEach((d) => {
          if (d.email === val) {
            return callback("Email đã tồn tại");
          }
        });
      } else {
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
              { validator: validateMaNhanVien },
            ]}
            initialValue={maNhanVien}
          >
            <Input className="input-item" placeholder="Nhập mã nhân viên" />
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
              data={chucVuSelect ? chucVuSelect : []}
              placeholder="Chọn chức vụ"
              optionsvalue={["id", "tenChucVu"]}
              style={{ width: "100%" }}
            />
          </FormItem>
          <FormItem
            label="Tập đoàn"
            name={["user", "tapDoan_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
            initialValue={tapDoan_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={TapDoanSelect ? TapDoanSelect : []}
              placeholder="Chọn tập đoàn"
              optionsvalue={["id", "tenTapDoan"]}
              style={{ width: "100%" }}
            />
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
              data={donViSelect ? donViSelect : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["id", "tenDonVi"]}
              style={{ width: "100%" }}
            />
          </FormItem>
          <FormItem
            label="Phòng ban"
            name={["user", "phongBan_Id"]}
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
              data={phongBanSelect ? phongBanSelect : []}
              placeholder="Chọn phòng ban"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              onSelect={handleSelectPhongBan}
            />
          </FormItem>
          <FormItem
            label="Bộ phận"
            name={["user", "boPhan_Id"]}
            rules={[
              {
                type: "string",
              },
            ]}
            initialValue={boPhan_Id}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={boPhanSelect ? boPhanSelect : []}
              placeholder="Chọn bộ phận"
              optionsvalue={["id", "tenBoPhan"]}
              style={{ width: "100%" }}
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
              data={donViSelect ? donViSelect : []}
              placeholder="Chọn đơn vị trả lương"
              optionsvalue={["id", "tenDonVi"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
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

export default CanBoNhanVienForm;
