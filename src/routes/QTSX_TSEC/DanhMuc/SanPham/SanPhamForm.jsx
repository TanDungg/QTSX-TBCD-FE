import { PlusOutlined } from "@ant-design/icons";
import { Card, Col, Form, Input, Upload, message } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API, DEFAULT_FORM_ADD_150PX } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";

const FormItem = Form.Item;

const SanPhamForm = ({ history, match, permission }) => {
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
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [ListDonViTinh, setListDonViTinh] = useState([]);
  const [ImageUrl, setImageUrl] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    getListLoaiSanPham();
    getListDonViTinh();
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
      } else if (permission && !permission.add) {
        history.push("/home");
      }
    } else {
      if (permission && permission.edit) {
        setType("edit");
        const { id } = match.params;
        setId(id);
        getInfo(id);
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListLoaiSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_LoaiSanPham/list-filter`,
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
          setListLoaiSanPham(res.data);
        } else {
          setListLoaiSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDonViTinh = () => {
    let param = convertObjectToUrlParams({
      DonVi_Id: INFO.donVi_Id,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonViTinh?${param}`,
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
          setListDonViTinh(res.data);
        } else {
          setListDonViTinh([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_SanPham/${id}`,
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
          if (data.hinhAnh) {
            convertToBase64(data.hinhAnh);
          }
          setFieldsValue({
            formsanpham: data,
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
    uploadFile(values.formsanpham);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.formsanpham, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (formsanpham, saveQuit) => {
    if (type === "new" && formsanpham.hinhAnh) {
      const formData = new FormData();
      formData.append("file", formsanpham.hinhAnh.file);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          formsanpham.hinhAnh = data.path;
          saveData(formsanpham, saveQuit);
        })
        .catch(() => {
          message.error("Tải hình ảnh không thành công.");
        });
    } else if (
      type === "edit" &&
      formsanpham.hinhAnh &&
      formsanpham.hinhAnh.file
    ) {
      const formData = new FormData();
      formData.append("file", formsanpham.hinhAnh.file);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          formsanpham.hinhAnh = data.path;
          saveData(formsanpham, saveQuit);
        })
        .catch(() => {
          message.error("Tải hình ảnh không thành công.");
        });
    } else {
      saveData(formsanpham, saveQuit);
    }
  };

  const saveData = (formsanpham, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_SanPham`,
            "POST",
            formsanpham,
            "ADD",
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
              resetFields();
              setFieldTouch(false);
              setImageUrl(null);
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...formsanpham,
        id: id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_SanPham/${id}`,
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
          if (res && res.status === 200) {
            if (saveQuit) {
              goBack();
            } else {
              getInfo(id);
              setFieldTouch(false);
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload hình ảnh
      </div>
    </button>
  );

  const convertToBase64 = async (imageUrl) => {
    try {
      const response = await fetch(BASE_URL_API + imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = reader.result;
        setImageUrl(base64Data);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Lỗi chuyển dữ liệu sang base64:", error);
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Vui lòng tải file ảnh!");
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setImageUrl(e.target.result);
      reader.readAsDataURL(file);
    }
    return false;
  };

  const formTitle = type === "new" ? "Thêm mới sản phẩm" : "Chỉnh sửa sản phẩm";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom"
        align="center"
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
              label="Mã sản phẩm"
              name={["formsanpham", "maSanPham"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 50,
                  message: "Mã sản phẩm không được quá 50 ký tự",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập mã sản phẩm" />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Tên sản phẩm"
              name={["formsanpham", "tenSanPham"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                  message: "Tên sản phẩm không được quá 250 ký tự",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập tên sản phẩm" />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Loại sản phẩm"
              name={["formsanpham", "tsec_qtsx_LoaiSanPham_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListLoaiSanPham ? ListLoaiSanPham : []}
                placeholder="Chọn loại sản phẩm"
                optionsvalue={["id", "tenLoaiSanPham"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
              />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Đơn vị tính"
              name={["formsanpham", "donViTinh_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListDonViTinh ? ListDonViTinh : []}
                placeholder="Chọn đơn vị tính"
                optionsvalue={["id", "tenDonViTinh"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
              />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Hình ảnh"
              name={["formsanpham", "hinhAnh"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Upload
                listType="picture-card"
                accept="image/*"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                style={{ width: "200px", height: "200px" }}
              >
                {ImageUrl ? (
                  <img
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                    src={ImageUrl}
                    alt="Hình ảnh đại diện chuyên đề"
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Ghi chú"
              name={["formsanpham", "moTa"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập ghi chú" />
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

export default SanPhamForm;
