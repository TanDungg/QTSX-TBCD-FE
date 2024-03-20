import { PlusOutlined } from "@ant-design/icons";
import { Card, Col, Form, Input, Upload, message } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API, DEFAULT_FORM_ADD_150PX } from "src/constants/Config";
import Helpers from "src/helpers";
import { getLocalStorage, getTokenInfo } from "src/util/Common";

const FormItem = Form.Item;

const GiangVienForm = ({ history, match, permission }) => {
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
  const [ListDonViDaoTao, setListDonViDaoTao] = useState([]);
  const [ListLoaiGiangVien, setListLoaiGiangVien] = useState([]);
  const [ImageUrl, setImageUrl] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListDonViDaoTao();
        getListLoaiGiangVien();
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

  const getListDonViDaoTao = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_DonViDaoTao?page=-1`,
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
          setListDonViDaoTao(res.data);
        } else {
          setListDonViDaoTao([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListLoaiGiangVien = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_LoaiGiangVien?page=-1`,
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
          setListLoaiGiangVien(res.data);
        } else {
          setListLoaiGiangVien([]);
        }
      })
      .catch((error) => console.error(error));
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

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_GiangVien/${id}`,
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
          getListDonViDaoTao();
          getListLoaiGiangVien();
          if (data.hinhAnh) {
            convertToBase64(data.hinhAnh);
          }
          setFieldsValue({
            formgiangvien: data,
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
    uploadFile(values.formgiangvien);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.formgiangvien, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (formgiangvien, saveQuit) => {
    if (type === "new" && formgiangvien.hinhAnh) {
      const formData = new FormData();
      formData.append("file", formgiangvien.hinhAnh.file);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          formgiangvien.hinhAnh = data.path;
          saveData(formgiangvien, saveQuit);
        })
        .catch(() => {
          message.error("Tải hình ảnh không thành công.");
        });
    } else if (
      type === "edit" &&
      formgiangvien.hinhAnh &&
      formgiangvien.hinhAnh.file
    ) {
      const formData = new FormData();
      formData.append("file", formgiangvien.hinhAnh.file);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          formgiangvien.hinhAnh = data.path;
          saveData(formgiangvien, saveQuit);
        })
        .catch(() => {
          message.error("Tải hình ảnh không thành công.");
        });
    } else {
      saveData(formgiangvien, saveQuit);
    }
  };

  const saveData = (formgiangvien, saveQuit = false) => {
    if (formgiangvien.hinhAnh) {
      if (type === "new") {
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `vptq_lms_GiangVien`,
              "POST",
              formgiangvien,
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
                setImageUrl(null);
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
        const newData = {
          ...formgiangvien,
          id: id,
        };
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `vptq_lms_GiangVien/${id}`,
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
    } else {
      Helpers.alertError("Vui lòng tải file hình ảnh lên.");
    }
  };

  const formTitle =
    type === "new" ? "Thêm mới giảng viên" : "Chỉnh sửa giảng viên";
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
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Mã giảng viên"
              name={["formgiangvien", "maGiangVien"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 50,
                  message: "Mã giảng viên không được quá 50 ký tự",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập mã giảng viên" />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Tên giảng viên"
              name={["formgiangvien", "tenGiangVien"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                  message: "Tên giảng viên không được quá 250 ký tự",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập tên giảng viên" />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Đơn vị đào tạo"
              name={["formgiangvien", "vptq_lms_DonViDaoTao_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListDonViDaoTao ? ListDonViDaoTao : []}
                placeholder="Chọn đơn vị"
                optionsvalue={["id", "tenDonViDaoTao"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Giới thiệu"
              name={["formgiangvien", "gioiThieu"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập thông tin giới thiệu giảng viên"
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Loại giảng viên"
              name={["formgiangvien", "vptq_lms_LoaiGiangVien_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListLoaiGiangVien ? ListLoaiGiangVien : []}
                placeholder="Chọn loại giảng viên"
                optionsvalue={["id", "tenLoaiGiangVien"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Chuyên môn"
              name={["formgiangvien", "vptq_lms_ChuyenMon_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập chuyên môn" />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Hình ảnh"
              name={["formgiangvien", "hinhAnh"]}
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
                style={{ width: "250px", height: "250px" }}
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
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Ghi chú"
              name={["formgiangvien", "moTa"]}
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

export default GiangVienForm;
