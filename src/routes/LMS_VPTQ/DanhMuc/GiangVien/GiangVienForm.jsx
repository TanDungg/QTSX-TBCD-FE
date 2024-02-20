import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Image, Input, Upload } from "antd";
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
  const [ListChuyenMon, setListChuyenMon] = useState([]);
  const [FileHinhAnh, setFileHinhAnh] = useState(null);
  const [FileAnh, setFileAnh] = useState(null);
  const [DisableUpload, setDisableUpload] = useState(false);
  const [OpenImage, setOpenImage] = useState(false);
  const [id, setId] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListDonViDaoTao();
        getListLoaiGiangVien();
        getListChuyenMon();
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
          setInfo(data);
          getListDonViDaoTao();
          getListLoaiGiangVien();
          getListChuyenMon();
          if (res.data.hinhAnh) {
            setFileHinhAnh(res.data.hinhAnh);
            setDisableUpload(true);
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
          console.log("Tải hình ảnh không thành công.");
        });
    } else if (
      type === "edit" &&
      formgiangvien.hinhAnh &&
      formgiangvien.hinhAnh.file
    ) {
      const formData = new FormData();
      formData.append("file", formgiangvien.hinhAnh.file);
      fetch(
        info.hinhAnh
          ? `${BASE_URL_API}/api/Upload?stringPath=${info.hinhAnh}`
          : `${BASE_URL_API}/api/Upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          formgiangvien.hinhAnh = data.path;
          saveData(formgiangvien, saveQuit);
        })
        .catch(() => {
          console.log("Tải hình ảnh không thành công.");
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
                setDisableUpload(false);
                setFileAnh(null);
                setFileHinhAnh(null);
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

  const propshinhanh = {
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
      } else {
        setFileHinhAnh(file);
        setDisableUpload(true);
        const reader = new FileReader();
        reader.onload = (e) => setFileAnh(e.target.result);
        reader.readAsDataURL(file);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
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
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListChuyenMon ? ListChuyenMon : []}
                placeholder="Chọn chuyên môn"
                optionsvalue={["id", "tenChuyenMon"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
              />
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
              {!DisableUpload ? (
                <Upload {...propshinhanh}>
                  <Button
                    className="th-margin-bottom-0"
                    style={{
                      marginBottom: 0,
                    }}
                    icon={<UploadOutlined />}
                    disabled={type === "detail" ? true : false}
                  >
                    Tải file hình ảnh
                  </Button>
                </Upload>
              ) : FileHinhAnh && FileHinhAnh.name ? (
                <span>
                  <span
                    style={{
                      color: "#0469B9",
                      cursor: "pointer",
                      whiteSpace: "break-spaces",
                    }}
                    onClick={() => setOpenImage(true)}
                  >
                    {FileHinhAnh.name}{" "}
                  </span>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    disabled={type === "new" || type === "edit" ? false : true}
                    onClick={() => {
                      setFileHinhAnh(null);
                      setDisableUpload(false);
                      setFieldsValue({
                        formgiangvien: {
                          hinhAnh: null,
                        },
                      });
                    }}
                  />
                  <Image
                    width={100}
                    src={FileAnh}
                    alt="preview"
                    style={{
                      display: "none",
                    }}
                    preview={{
                      visible: OpenImage,
                      scaleStep: 0.5,
                      src: FileAnh,
                      onVisibleChange: (value) => {
                        setOpenImage(value);
                      },
                    }}
                  />
                </span>
              ) : (
                <span>
                  <a
                    target="_blank"
                    href={BASE_URL_API + FileHinhAnh}
                    rel="noopener noreferrer"
                  >
                    {FileHinhAnh && FileHinhAnh.split("/")[5]}{" "}
                  </a>
                  {(type === "new" || type === "edit") && (
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      onClick={() => {
                        setFileHinhAnh(null);
                        setDisableUpload(false);
                        setFieldsValue({
                          formgiangvien: {
                            hinhAnh: null,
                          },
                        });
                      }}
                    />
                  )}
                </span>
              )}
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
