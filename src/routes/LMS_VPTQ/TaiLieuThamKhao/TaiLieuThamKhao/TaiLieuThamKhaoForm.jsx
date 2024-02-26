import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Upload } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API, DEFAULT_FORM_ADD_130PX } from "src/constants/Config";
import Helpers from "src/helpers";
import { getLocalStorage, getTokenInfo } from "src/util/Common";

const FormItem = Form.Item;

const TaiLieuThamKhaoForm = ({ history, match, permission }) => {
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
  const [ListKienThuc, setListKienThuc] = useState([]);
  const [FileTaiLieu, setFileTaiLieu] = useState(null);
  const [DisableUpload, setDisableUpload] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListKienThuc();
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

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_TaiLieuThamKhao/${id}`,
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
          if (res.data.fileTaiLieu) {
            setFileTaiLieu(res.data.fileTaiLieu);
            setDisableUpload(true);
          }
          setFieldsValue({
            formtailieuthamkhao: data,
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
    uploadFile(values.formtailieuthamkhao);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.formtailieuthamkhao, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (formtailieuthamkhao, saveQuit) => {
    if (type === "new") {
      if (!formtailieuthamkhao.fileTaiLieu) {
        Helpers.alertError("Vui lòng tải file tài liệu lên!");
      } else {
        const formData = new FormData();
        formData.append("file", formtailieuthamkhao.fileTaiLieu.file);
        fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            formtailieuthamkhao.fileTaiLieu = data.path;
            saveData(formtailieuthamkhao, saveQuit);
          })
          .catch(() => {
            console.log("Tải hình ảnh không thành công.");
          });
      }
    }
    if (type === "edit") {
      if (!formtailieuthamkhao.fileTaiLieu) {
        Helpers.alertError("Vui lòng tải file tài liệu lên!");
      } else if (
        formtailieuthamkhao.fileTaiLieu &&
        formtailieuthamkhao.fileTaiLieu.file
      ) {
        const formData = new FormData();
        formData.append("file", formtailieuthamkhao.fileTaiLieu.file);
        fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            formtailieuthamkhao.fileTaiLieu = data.path;
            saveData(formtailieuthamkhao, saveQuit);
          })
          .catch(() => {
            console.log("Tải hình ảnh không thành công.");
          });
      } else {
        saveData(formtailieuthamkhao, saveQuit);
      }
    }
  };

  const saveData = (formtailieuthamkhao, saveQuit = false) => {
    const newData = {
      ...formtailieuthamkhao,
      donVi_Id: INFO.donVi_Id,
    };
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_TaiLieuThamKhao`,
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
              setDisableUpload(false);
              setFileTaiLieu(null);
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
        ...formtailieuthamkhao,
        donVi_Id: INFO.donVi_Id,
        id: id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_TaiLieuThamKhao/${id}`,
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
          `${file.name} không phải là tệp PDF, Word hoặc PowerPoint`
        );
        return false;
      } else {
        setFileTaiLieu(file);
        setDisableUpload(true);
        return false;
      }
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
      ? "Thêm mới tài liệu tham khảo"
      : "Chỉnh sửa tài liệu tham khảo";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom"
        align="center"
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_130PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Tên tài liệu"
              name={["formtailieuthamkhao", "tenTaiLieu"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                  message: "Tên tài liệu không được quá 250 ký tự",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập tên tài liệu" />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Kiến thức"
              name={["formtailieuthamkhao", "vptq_lms_KienThuc_Id"]}
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
                placeholder="Chọn kiến thức"
                optionsvalue={["id", "tenKienThuc"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="File tài liệu"
              name={["formtailieuthamkhao", "fileTaiLieu"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              {!DisableUpload ? (
                <Upload {...propstailieu}>
                  <Button
                    className="th-margin-bottom-0"
                    style={{
                      marginBottom: 0,
                    }}
                    icon={<UploadOutlined />}
                    disabled={type === "detail" ? true : false}
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
                    disabled={type === "new" || type === "edit" ? false : true}
                    onClick={() => {
                      setFileTaiLieu(null);
                      setDisableUpload(false);
                      setFieldsValue({
                        formtailieuthamkhao: {
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
                  {(type === "new" || type === "edit") && (
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      onClick={() => {
                        setFileTaiLieu(null);
                        setDisableUpload(false);
                        setFieldsValue({
                          formtailieuthamkhao: {
                            fileTaiLieu: null,
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
              label="Mô tả"
              name={["formtailieuthamkhao", "moTa"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập mô tả tài liệu" />
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

export default TaiLieuThamKhaoForm;
