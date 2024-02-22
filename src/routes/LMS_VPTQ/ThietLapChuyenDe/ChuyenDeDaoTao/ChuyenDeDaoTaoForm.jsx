import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Switch, Upload } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  BASE_URL_API,
  DAOTAO_ONLINE,
  DEFAULT_FORM_ADD_170PX,
  HINHTHUCDAOTAO_TUHOC,
} from "src/constants/Config";
import Helpers from "src/helpers";
import { getLocalStorage, getTokenInfo } from "src/util/Common";

const { TextArea } = Input;
const FormItem = Form.Item;

const ChuyenDeDaoTaoForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [ListKienThuc, setListKienThuc] = useState([]);
  const [ListGiangVien, setListGiangVien] = useState([]);
  const [ListHinhThuc, setListHinhThuc] = useState([]);
  const [HinhThucDaoTao, setHinhThucDaoTao] = useState(null);
  const [FileVideo, setFileVideo] = useState(null);
  const [DisableUploadVideo, setDisableUploadVideo] = useState(false);
  const [FileTaiLieu, setFileTaiLieu] = useState(null);
  const [DisableUploadTaiLieu, setDisableUploadTaiLieu] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListKienThuc();
        getListGiangVien();
        getListHinhThuc();
        setFieldsValue({
          formchuyendedaotao: {
            isSuDung: true,
          },
        });
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

  const getListKienThuc = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_KienThuc?page=-1`,
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
          setListKienThuc(res.data);
        } else {
          setListKienThuc([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListGiangVien = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_GiangVien?page=-1`,
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
          setListGiangVien(res.data);
        } else {
          setListGiangVien([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListHinhThuc = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HinhThucDaoTao?page=-1`,
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
          setListHinhThuc(res.data);
        } else {
          setListHinhThuc([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChuyenDeDaoTao/${id}`,
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
          getListKienThuc();
          getListGiangVien();
          getListHinhThuc();
          setHinhThucDaoTao(data.vptq_lms_HinhThucDaoTao_Id);
          if (data.fileVideo) {
            setDisableUploadVideo(true);
            setFileVideo(data.fileVideo);
          }
          if (data.fileTaiLieu) {
            setDisableUploadTaiLieu(true);
            setFileTaiLieu(data.fileTaiLieu);
          }
          setFieldsValue({
            formchuyendedaotao: data,
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
    uploadFile(values.formchuyendedaotao);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.formchuyendedaotao, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (formchuyendedaotao, saveQuit) => {
    if (type === "new") {
      if (HinhThucDaoTao === HINHTHUCDAOTAO_TUHOC) {
        if (!formchuyendedaotao.fileTaiLieu && !formchuyendedaotao.fileVideo) {
          saveData(formchuyendedaotao, saveQuit);
        } else if (
          formchuyendedaotao.fileTaiLieu ||
          formchuyendedaotao.fileVideo
        ) {
          const formData = new FormData();
          formchuyendedaotao.fileTaiLieu
            ? formData.append("file", formchuyendedaotao.fileTaiLieu.file)
            : formData.append("file", formchuyendedaotao.fileVideo.file);

          fetch(`${BASE_URL_API}/api/Upload`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Bearer ".concat(INFO.token),
            },
          })
            .then((res) => res.json())
            .then((data) => {
              formchuyendedaotao.fileTaiLieu
                ? (formchuyendedaotao.fileTaiLieu = data.path)
                : (formchuyendedaotao.fileVideo = data.path);
              saveData(formchuyendedaotao, saveQuit);
            })
            .catch(() => {
              Helpers.alertError("Tải file không thành công.");
            });
        } else {
          const formData = new FormData();
          formData.append("lstFiles", formchuyendedaotao.fileTaiLieu.file);
          formData.append("lstFiles", formchuyendedaotao.fileVideo.file);

          fetch(`${BASE_URL_API}/api/Upload/Multi`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Bearer ".concat(INFO.token),
            },
          })
            .then((res) => res.json())
            .then((data) => {
              formchuyendedaotao.fileTaiLieu = data[0].path;
              formchuyendedaotao.fileVideo = data[1].path;
              saveData(formchuyendedaotao, saveQuit);
            })
            .catch(() => {
              Helpers.alertError("Tải file không thành công.");
            });
        }
      } else if (HinhThucDaoTao === DAOTAO_ONLINE) {
        if (!formchuyendedaotao.fileVideo) {
          Helpers.alertError("Vui lòng tải file video lên.");
        } else if (!formchuyendedaotao.fileTaiLieu) {
          const formData = new FormData();
          formData.append("file", formchuyendedaotao.fileVideo.file);

          fetch(`${BASE_URL_API}/api/Upload`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Bearer ".concat(INFO.token),
            },
          })
            .then((res) => res.json())
            .then((data) => {
              formchuyendedaotao.fileVideo = data.path;
              saveData(formchuyendedaotao, saveQuit);
            })
            .catch(() => {
              Helpers.alertError("Tải file không thành công.");
            });
        } else {
          const formData = new FormData();
          formData.append("lstFiles", formchuyendedaotao.fileTaiLieu.file);
          formData.append("lstFiles", formchuyendedaotao.fileVideo.file);

          fetch(`${BASE_URL_API}/api/Upload/Multi`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Bearer ".concat(INFO.token),
            },
          })
            .then((res) => res.json())
            .then((data) => {
              formchuyendedaotao.fileTaiLieu = data[0].path;
              formchuyendedaotao.fileVideo = data[1].path;
              saveData(formchuyendedaotao, saveQuit);
            })
            .catch(() => {
              Helpers.alertError("Tải file không thành công.");
            });
        }
      } else {
        if (!formchuyendedaotao.fileTaiLieu) {
          Helpers.alertError("Vui lòng tải file tài liệu lên.");
        } else if (!formchuyendedaotao.fileVideo) {
          const formData = new FormData();
          formData.append("file", formchuyendedaotao.fileTaiLieu.file);

          fetch(`${BASE_URL_API}/api/Upload`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Bearer ".concat(INFO.token),
            },
          })
            .then((res) => res.json())
            .then((data) => {
              formchuyendedaotao.fileTaiLieu = data.path;
              saveData(formchuyendedaotao, saveQuit);
            })
            .catch(() => {
              Helpers.alertError("Tải file không thành công.");
            });
        } else {
          const formData = new FormData();
          formData.append("lstFiles", formchuyendedaotao.fileTaiLieu.file);
          formData.append("lstFiles", formchuyendedaotao.fileVideo.file);

          fetch(`${BASE_URL_API}/api/Upload/Multi`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Bearer ".concat(INFO.token),
            },
          })
            .then((res) => res.json())
            .then((data) => {
              formchuyendedaotao.fileTaiLieu = data[0].path;
              formchuyendedaotao.fileVideo = data[1].path;
              saveData(formchuyendedaotao, saveQuit);
            })
            .catch(() => {
              Helpers.alertError("Tải file không thành công.");
            });
        }
      }
    } else {
      if (HinhThucDaoTao === HINHTHUCDAOTAO_TUHOC) {
        if (
          (!formchuyendedaotao.fileTaiLieu && !formchuyendedaotao.fileVideo) ||
          (formchuyendedaotao.fileTaiLieu &&
            !formchuyendedaotao.fileTaiLieu.file) ||
          (formchuyendedaotao.fileVideo && !formchuyendedaotao.fileVideo.file)
        ) {
          saveData(formchuyendedaotao, saveQuit);
        } else if (
          (formchuyendedaotao.fileTaiLieu &&
            formchuyendedaotao.fileTaiLieu.file) ||
          (formchuyendedaotao.fileVideo && formchuyendedaotao.fileVideo.file)
        ) {
          const formData = new FormData();
          formchuyendedaotao.fileTaiLieu && formchuyendedaotao.fileTaiLieu.file
            ? formData.append("file", formchuyendedaotao.fileTaiLieu.file)
            : formData.append("file", formchuyendedaotao.fileVideo.file);

          fetch(`${BASE_URL_API}/api/Upload`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Bearer ".concat(INFO.token),
            },
          })
            .then((res) => res.json())
            .then((data) => {
              formchuyendedaotao.fileTaiLieu &&
              formchuyendedaotao.fileTaiLieu.file
                ? (formchuyendedaotao.fileTaiLieu = data.path)
                : (formchuyendedaotao.fileVideo = data.path);
              saveData(formchuyendedaotao, saveQuit);
            })
            .catch(() => {
              Helpers.alertError("Tải file không thành công.");
            });
        } else {
          const formData = new FormData();
          formData.append("lstFiles", formchuyendedaotao.fileTaiLieu.file);
          formData.append("lstFiles", formchuyendedaotao.fileVideo.file);

          fetch(`${BASE_URL_API}/api/Upload/Multi`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Bearer ".concat(INFO.token),
            },
          })
            .then((res) => res.json())
            .then((data) => {
              formchuyendedaotao.fileTaiLieu = data[0].path;
              formchuyendedaotao.fileVideo = data[1].path;
              saveData(formchuyendedaotao, saveQuit);
            })
            .catch(() => {
              Helpers.alertError("Tải file không thành công.");
            });
        }
      } else if (HinhThucDaoTao === DAOTAO_ONLINE) {
        if (!formchuyendedaotao.fileVideo) {
          Helpers.alertError("Vui lòng tải file video lên.");
        } else if (
          formchuyendedaotao.fileVideo &&
          formchuyendedaotao.fileVideo.file
        ) {
          if (
            !formchuyendedaotao.fileTaiLieu ||
            (formchuyendedaotao.fileTaiLieu &&
              !formchuyendedaotao.fileTaiLieu.file)
          ) {
            const formData = new FormData();
            formData.append("file", formchuyendedaotao.fileVideo.file);

            fetch(`${BASE_URL_API}/api/Upload`, {
              method: "POST",
              body: formData,
              headers: {
                Authorization: "Bearer ".concat(INFO.token),
              },
            })
              .then((res) => res.json())
              .then((data) => {
                formchuyendedaotao.fileVideo = data.path;
                saveData(formchuyendedaotao, saveQuit);
              })
              .catch(() => {
                Helpers.alertError("Tải file không thành công.");
              });
          } else {
            const formData = new FormData();
            formData.append("lstFiles", formchuyendedaotao.fileTaiLieu.file);
            formData.append("lstFiles", formchuyendedaotao.fileVideo.file);

            fetch(`${BASE_URL_API}/api/Upload/Multi`, {
              method: "POST",
              body: formData,
              headers: {
                Authorization: "Bearer ".concat(INFO.token),
              },
            })
              .then((res) => res.json())
              .then((data) => {
                formchuyendedaotao.fileTaiLieu = data[0].path;
                formchuyendedaotao.fileVideo = data[1].path;
                saveData(formchuyendedaotao, saveQuit);
              })
              .catch(() => {
                Helpers.alertError("Tải file không thành công.");
              });
          }
        } else {
          if (
            formchuyendedaotao.fileTaiLieu &&
            formchuyendedaotao.fileTaiLieu.file
          ) {
            const formData = new FormData();
            formData.append("file", formchuyendedaotao.fileTaiLieu.file);

            fetch(`${BASE_URL_API}/api/Upload`, {
              method: "POST",
              body: formData,
              headers: {
                Authorization: "Bearer ".concat(INFO.token),
              },
            })
              .then((res) => res.json())
              .then((data) => {
                formchuyendedaotao.fileTaiLieu = data.path;
                saveData(formchuyendedaotao, saveQuit);
              })
              .catch(() => {
                Helpers.alertError("Tải file không thành công.");
              });
          } else {
            saveData(formchuyendedaotao, saveQuit);
          }
        }
      } else {
        if (!formchuyendedaotao.fileTaiLieu) {
          Helpers.alertError("Vui lòng tải file tài liệu lên.");
        } else if (
          formchuyendedaotao.fileTaiLieu &&
          formchuyendedaotao.fileTaiLieu.file
        ) {
          if (
            !formchuyendedaotao.fileVideo ||
            (formchuyendedaotao.fileVideo && !formchuyendedaotao.fileVideo.file)
          ) {
            const formData = new FormData();
            formData.append("file", formchuyendedaotao.fileTaiLieu.file);

            fetch(`${BASE_URL_API}/api/Upload`, {
              method: "POST",
              body: formData,
              headers: {
                Authorization: "Bearer ".concat(INFO.token),
              },
            })
              .then((res) => res.json())
              .then((data) => {
                formchuyendedaotao.fileTaiLieu = data.path;
                saveData(formchuyendedaotao, saveQuit);
              })
              .catch(() => {
                Helpers.alertError("Tải file không thành công.");
              });
          } else {
            const formData = new FormData();
            formData.append("lstFiles", formchuyendedaotao.fileTaiLieu.file);
            formData.append("lstFiles", formchuyendedaotao.fileVideo.file);

            fetch(`${BASE_URL_API}/api/Upload/Multi`, {
              method: "POST",
              body: formData,
              headers: {
                Authorization: "Bearer ".concat(INFO.token),
              },
            })
              .then((res) => res.json())
              .then((data) => {
                formchuyendedaotao.fileTaiLieu = data[0].path;
                formchuyendedaotao.fileVideo = data[1].path;
                saveData(formchuyendedaotao, saveQuit);
              })
              .catch(() => {
                Helpers.alertError("Tải file không thành công.");
              });
          }
        } else {
          if (
            formchuyendedaotao.fileVideo &&
            formchuyendedaotao.fileVideo.file
          ) {
            const formData = new FormData();
            formData.append("file", formchuyendedaotao.fileVideo.file);

            fetch(`${BASE_URL_API}/api/Upload`, {
              method: "POST",
              body: formData,
              headers: {
                Authorization: "Bearer ".concat(INFO.token),
              },
            })
              .then((res) => res.json())
              .then((data) => {
                formchuyendedaotao.fileVideo = data.path;
                saveData(formchuyendedaotao, saveQuit);
              })
              .catch(() => {
                Helpers.alertError("Tải file không thành công.");
              });
          } else {
            saveData(formchuyendedaotao, saveQuit);
          }
        }
      }
    }
  };

  const saveData = (formchuyendedaotao, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...formchuyendedaotao,
        thoiLuongDaoTao: parseInt(formchuyendedaotao.thoiLuongDaoTao),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_ChuyenDeDaoTao`,
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
              setDisableUploadVideo(false);
              setFileVideo(null);
              setDisableUploadTaiLieu(false);
              setFileTaiLieu(null);
              setFieldsValue({
                formchuyendedaotao: {
                  isSuDung: true,
                },
              });
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
        ...formchuyendedaotao,
        id: id,
        thoiLuongDaoTao: parseInt(formchuyendedaotao.thoiLuongDaoTao),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_ChuyenDeDaoTao/${id}`,
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

  const handleSelectHinhThucDaoTao = (value) => {
    setHinhThucDaoTao(value);
  };

  const propsvideo = {
    accept: "video/*",
    beforeUpload: (file) => {
      const isVideo = file.type.startsWith("video/");
      if (!isVideo) {
        Helpers.alertError(`${file.name} không phải là định dạng video hợp lệ`);
        return false;
      } else {
        setFileVideo(file);
        setDisableUploadVideo(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const propstailieu = {
    accept: ".pdf, .doc, .docx, .ppt, .pptx",
    beforeUpload: (file) => {
      const allowedFileTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (!allowedFileTypes.includes(file.type)) {
        Helpers.alertError(
          `${file.name} không phải là tệp PDF, Word, hoặc PowerPoint`
        );
        return false;
      }

      setFileTaiLieu(file);
      setDisableUploadTaiLieu(true);
      return false;
    },
    showUploadList: false,
    maxCount: 1,
  };

  const handleOpenFile = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  const formTitle =
    type === "new"
      ? "Thêm mới chuyên đề đào tạo"
      : "Chỉnh sửa chuyên đề đào tạo";
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom"
        align={"center"}
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_170PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Tên chuyên đề"
              name={["formchuyendedaotao", "tenChuyenDeDaoTao"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                  message: "Tên chuyên đề đào tạo không được quá 250 ký tự",
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập tên chuyên đề đào tạo"
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Mô tả chuyên đề"
              name={["formchuyendedaotao", "moTa"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <TextArea
                rows={6}
                className="input-item"
                placeholder="Nhập mô tả chuyên đề đào tạo"
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Kiến thức"
              name={["formchuyendedaotao", "vptq_lms_KienThuc_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListKienThuc ? ListKienThuc : []}
                placeholder="Chọn chuyên đề đào tạo"
                optionsvalue={["id", "tenKienThuc"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Hình thức đào tạo"
              name={["formchuyendedaotao", "vptq_lms_HinhThucDaoTao_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListHinhThuc ? ListHinhThuc : []}
                placeholder="Chọn hình thức đào tạo"
                optionsvalue={["id", "tenHinhThucDaoTao"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
                onSelect={handleSelectHinhThucDaoTao}
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Giảng viên"
              name={["formchuyendedaotao", "vptq_lms_GiangVien_Id"]}
              rules={[
                {
                  type: "string",
                  required:
                    HinhThucDaoTao && HinhThucDaoTao === HINHTHUCDAOTAO_TUHOC
                      ? false
                      : true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListGiangVien ? ListGiangVien : []}
                placeholder="Chọn giảng viên đào tạo"
                optionsvalue={["id", "tenGiangVien"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
                disabled={type !== "new"}
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Thời lượng đào tạo"
              name={["formchuyendedaotao", "thoiLuongDaoTao"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input
                type="number"
                className="input-item"
                placeholder="Nhập thời lượng đào tạo (Phút)"
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Video đào tạo"
              name={["formchuyendedaotao", "fileVideo"]}
              rules={[
                {
                  type: "file",
                  required: HinhThucDaoTao && HinhThucDaoTao === DAOTAO_ONLINE,
                },
              ]}
            >
              {!DisableUploadVideo ? (
                <Upload {...propsvideo}>
                  <Button
                    className="th-margin-bottom-0"
                    style={{
                      marginBottom: 0,
                    }}
                    icon={<UploadOutlined />}
                  >
                    Tải file video
                  </Button>
                </Upload>
              ) : FileVideo && FileVideo.name ? (
                <span>
                  <span
                    style={{
                      color: "#0469B9",
                      cursor: "pointer",
                      whiteSpace: "break-spaces",
                    }}
                    onClick={() => handleOpenFile(FileVideo)}
                  >
                    {FileVideo.name}{" "}
                  </span>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => {
                      setFileVideo(null);
                      setDisableUploadVideo(false);
                      setFieldsValue({
                        formchuyendedaotao: {
                          fileVideo: null,
                        },
                      });
                    }}
                  />
                </span>
              ) : (
                <span>
                  <a
                    target="_blank"
                    href={BASE_URL_API + FileVideo}
                    rel="noopener noreferrer"
                  >
                    {FileVideo && FileVideo.split("/")[5]}{" "}
                  </a>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => {
                      setFieldTouch(true);
                      setFileVideo(null);
                      setDisableUploadVideo(false);
                      setFieldsValue({
                        formchuyendedaotao: {
                          fileVideo: null,
                        },
                      });
                    }}
                  />
                </span>
              )}
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="File tài liệu"
              name={["formchuyendedaotao", "fileTaiLieu"]}
              rules={[
                {
                  type: "file",
                  required:
                    HinhThucDaoTao && HinhThucDaoTao === HINHTHUCDAOTAO_TUHOC
                      ? false
                      : true,
                },
              ]}
            >
              {!DisableUploadTaiLieu ? (
                <Upload {...propstailieu}>
                  <Button
                    className="th-margin-bottom-0"
                    style={{
                      marginBottom: 0,
                    }}
                    icon={<UploadOutlined />}
                  >
                    Tải file tài liệu
                  </Button>
                </Upload>
              ) : FileTaiLieu && FileTaiLieu.name ? (
                <span>
                  <span
                    style={{
                      color: "#0469B9",
                      cursor: "pointer",
                      whiteSpace: "break-spaces",
                    }}
                    onClick={() => handleOpenFile(FileTaiLieu)}
                  >
                    {FileTaiLieu.name}{" "}
                  </span>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => {
                      setFileTaiLieu(null);
                      setDisableUploadTaiLieu(false);
                      setFieldsValue({
                        formchuyendedaotao: {
                          fileTaiLieu: null,
                        },
                      });
                    }}
                  />
                </span>
              ) : (
                <span>
                  <a
                    target="_blank"
                    href={BASE_URL_API + FileTaiLieu}
                    rel="noopener noreferrer"
                  >
                    {FileTaiLieu && FileTaiLieu.split("/")[5]}{" "}
                  </a>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => {
                      setFieldTouch(true);
                      setFileTaiLieu(null);
                      setDisableUploadTaiLieu(false);
                      setFieldsValue({
                        formchuyendedaotao: {
                          fileTaiLieu: null,
                        },
                      });
                    }}
                  />
                </span>
              )}
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Sử dụng"
              name={["formchuyendedaotao", "isSuDung"]}
              valuePropName="checked"
            >
              <Switch />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Ghi chú"
              name={["formchuyendedaotao", "ghiChu"]}
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

export default ChuyenDeDaoTaoForm;