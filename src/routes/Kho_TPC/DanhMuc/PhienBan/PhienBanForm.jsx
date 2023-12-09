import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Form, Input, Upload } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API, DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import Helpers from "src/helpers";
import { getLocalStorage, getTokenInfo } from "src/util/Common";

const FormItem = Form.Item;

const PhienBanForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  const [FileAPK, setFileAPK] = useState(null);
  const [DisableUpload, setDisableUpload] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    ref.current.focus();
    const load = () => {
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
          getInfo();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy thông tin
   *
   */
  const getInfo = () => {
    const { id } = match.params;
    setId(id);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`PhienBan/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          const data = res.data.data;
          setFieldsValue({
            phienban: data,
          });
          setFileAPK(data.fileUrl);
          setDisableUpload(true);
          setInfo(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Quay lại trang người dùng
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
    uploadFile(values.phienban);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.phienban, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (phienban, saveQuit) => {
    if (type === "new" && phienban.fileUrl) {
      const formData = new FormData();
      formData.append("file", phienban.fileUrl.file);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          phienban.fileUrl = data.path;
          saveData(phienban, saveQuit);
        })
        .catch(() => {
          console.log("upload failed.");
        });
    } else if (type === "edit" && phienban.fileUrl.file) {
      const formData = new FormData();
      formData.append("file", phienban.fileUrl.file);
      fetch(`${BASE_URL_API}/api/Upload?stringPath=${info.fileUrl}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          phienban.fileUrl = data.path;
          saveData(phienban, saveQuit);
        })
        .catch(() => {
          console.log("upload failed.");
        });
    } else {
      saveData(phienban, saveQuit);
    }
  };

  const saveData = (phienban, saveQuit = false) => {
    if (type === "new") {
      if (phienban.fileUrl) {
        const newData = {
          ...phienban,
          phanMem_Id: INFO.phanMem_Id,
        };
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(`PhienBan`, "POST", newData, "ADD", "", resolve, reject)
          );
        })
          .then((res) => {
            if (res.status !== 409) {
              if (saveQuit) {
                goBack();
              } else {
                resetFields();
                setFieldTouch(false);
                setFileAPK(null);
                setDisableUpload(false);
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
      } else {
        Helpers.alertError(`File không được để trống`);
        setFieldTouch(false);
      }
    }
    if (type === "edit") {
      phienban.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `PhienBan/${id}`,
            "PUT",
            phienban,
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
            getInfo();
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const props = {
    accept: ".apk",
    beforeUpload: (file) => {
      const isAPK = file.type === "application/vnd.android.package-archive";
      if (!isAPK) {
        Helpers.alertError(`${file.name} không phải tệp APK`);
        return false;
      } else {
        setFileAPK(file);
        setDisableUpload(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const handleDownloadAPK = () => {
    if (FileAPK) {
      if (FileAPK.name) {
        const url = URL.createObjectURL(FileAPK);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${FileAPK.name}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const link = document.createElement("a");
        link.href = BASE_URL_API + FileAPK;
        link.target = "_blank";
        link.download = { FileAPK };
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const formTitle =
    type === "new" ? "Thêm mới phiên bản" : "Chỉnh sửa phiên bản";

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
            label="Mã phiên bản"
            name={["phienban", "maPhienBan"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 50,
                message: "Mã phiên bản không được quá 50 ký tự",
              },
            ]}
          >
            <Input
              className="input-item"
              placeholder="Nhập mã phiên bản"
              ref={ref}
            />
          </FormItem>
          <FormItem
            label="Tên file"
            name={["phienban", "fileName"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 250,
                message: "Tên file không được quá 250 ký tự",
              },
            ]}
          >
            <Input className="input-item" placeholder="Nhập tên file" />
          </FormItem>
          <FormItem
            label="File url"
            name={["phienban", "fileUrl"]}
            rules={[
              {
                type: "file",
                required: true,
              },
            ]}
          >
            {!DisableUpload ? (
              <Upload {...props}>
                <Button
                  style={{
                    marginBottom: 0,
                  }}
                  icon={<UploadOutlined />}
                  disabled={type === "detail" ? true : false}
                >
                  Tải file apk
                </Button>
              </Upload>
            ) : FileAPK && FileAPK.name ? (
              <span>
                <span
                  style={{ color: "#0469B9", cursor: "pointer" }}
                  onClick={() => handleDownloadAPK()}
                >
                  {FileAPK.name}
                </span>{" "}
                {type === "new" ? (
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    disabled={type === "new" || type === "edit" ? false : true}
                    onClick={() => {
                      setFileAPK(null);
                      setDisableUpload(false);
                      setFieldsValue({
                        phienban: {
                          fileUrl: null,
                        },
                      });
                    }}
                  />
                ) : null}
              </span>
            ) : (
              <span
                style={{ color: "#0469B9", cursor: "pointer" }}
                onClick={() => handleDownloadAPK()}
              >
                {FileAPK && FileAPK.split("/")[5]}{" "}
                {type === "new" && (
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    disabled={type === "new" || type === "edit" ? false : true}
                    onClick={() => {
                      setFileAPK(null);
                      setDisableUpload(false);
                      setFieldsValue({
                        phienban: {
                          fileUrl: null,
                        },
                      });
                    }}
                  />
                )}
              </span>
            )}
          </FormItem>
          <FormItem
            label="Mô tả"
            name={["phienban", "moTa"]}
            rules={[
              {
                type: "string",
              },
              {
                max: 250,
                message: "Mô tả không được quá 250 ký tự",
              },
            ]}
          >
            <Input className="input-item" placeholder="Nhập mô tả" />
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

export default PhienBanForm;
