import { Card, Form, Input, Upload, Button, Modal } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API, DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Icon } from "@ant-design/compatible";
import {
  LoadingOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Helpers from "src/helpers";

const FormItem = Form.Item;

const initialState = {
  maPhanMem: "",
  tenPhanMem: "",
};
const PhanMemForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const { loading } = useSelector(({ common }) => common).toJS();
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { maPhanMem, tenPhanMem } = initialState;
  const { validateFields, resetFields, setFieldsValue } = form;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [info, setInfo] = useState({});
  const [icon, setIcon] = useState("file-unknown");
  const [imageUrl, setImageUrl] = useState([]);
  useEffect(() => {
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
          // Get info
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
        fetchStart(`PhanMem/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setFieldsValue({
            PhanMem: res.data,
          });
          setInfo(res.data);
          res.data.hinhAnh &&
            setImageUrl([
              {
                uid: "1",
                name: res.data.hinhAnh,
                status: "done",
                url: BASE_URL_API + res.data.hinhAnh,
              },
            ]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Quay lại trang danh sách phần mềm
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
    if (imageUrl.length === 0 || imageUrl[0].name === info.hinhAnh) {
      if (imageUrl.length === 0 && info.hinhAnh) {
        DeleteFile(info.hinhAnh);
        values.PhanMem.hinhAnh = null;
        saveData(values.PhanMem);
      } else {
        saveData(values.PhanMem);
      }
    } else {
      UploadImage(values.PhanMem);
    }
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        if (imageUrl.length === 0 || imageUrl[0].name === info.hinhAnh) {
          if (info.hinhAnh) {
            DeleteFile(info.hinhAnh);
            values.PhanMem.hinhAnh = null;
            saveData(values.PhanMem);
          } else {
            saveData(values.PhanMem, true);
          }
        } else {
          UploadImage(values.PhanMem, true);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  
  const DeleteFile = (file) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Upload/delete-image?stringPath=${file}`,
          "POST",
          null,
          "",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {})
      .catch((error) => console.error(error));
  };

  const UploadImage = (data, saveQuit) => {
    const formData = new FormData();
    formData.append("file", imageUrl[0].file);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          type === "new" || (type === "edit" && !info.hinhAnh)
            ? `Upload`
            : `Upload?stringPath=${info.hinhAnh}`,
          "POST",
          formData,
          "",
          "",
          resolve,
          reject,
          true
        )
      );
    })
      .then((res) => {
        if (res.status === 200) {
          data.hinhAnh = res.data.path;
          saveData(data, saveQuit);
        }
      })
      .catch((error) => console.error(error));
  };

  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      const newData = user;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`PhanMem`, "POST", newData, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
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
    } else if (type === "edit") {
      var newData = { ...info, ...user };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `PhanMem/${id}`,
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
            getInfo();
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };
  
  const handlePreview = async (file) => {
    setPreviewOpen(true);
  };

  const handleRemove = async (file) => {
    setImageUrl([]);
  };

  const props = {
    accept: ".jpeg, .png",
    listType: "picture-card",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
      } else {
        const reader = new FileReader();
        reader.onload = (e) =>
          setImageUrl([
            {
              uid: "1",
              name: file.name,
              status: "done",
              url: e.target.result,
              file: file,
            },
          ]);
        reader.readAsDataURL(file);
        setFieldTouch(true);
        return false;
      }
    },
    fileList: imageUrl,
    maxCount: 1,
    onPreview: handlePreview,
    onRemove: handleRemove,
  };
  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );
  const handleCancel = () => setPreviewOpen(false);
  const formTitle = type === "new" ? "Thêm mới phần mềm" : "Chỉnh sửa phần mềm";
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
            label="Mã phần mềm"
            name={["PhanMem", "maPhanMem"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 50,
                message: "Mã phần mềm không được quá 50 ký tự",
              },
            ]}
            initialValue={maPhanMem}
          >
            <Input className="input-item" placeholder="Nhập mã phần mềm" />
          </FormItem>
          <FormItem
            label="Tên phần mềm"
            name={["PhanMem", "tenPhanMem"]}
            rules={[
              {
                type: "string",
                required: true,
              },
              {
                max: 250,
                message: "Tên phần mềm không được quá 250 ký tự",
              },
            ]}
            initialValue={tenPhanMem}
          >
            <Input className="input-item" placeholder="Nhập tên phần mềm" />
          </FormItem>
          <FormItem
            label="Icon"
            name={["PhanMem", "icon"]}
            rules={[
              {
                type: "string",
              },
              {
                max: 50,
                message: "Icon không được quá 50 ký tự",
              },
            ]}
          >
            <Input
              className="input-item"
              placeholder="Nhập icon"
              addonAfter={<Icon type={icon} />}
              onChange={(e) => setIcon(e.target.value)}
            />
          </FormItem>
          <FormItem
            label="Hình ảnh"
            name={["PhanMem", "fileUrl"]}
            rules={[
              {
                type: "file",
              },
            ]}
          >
            <Upload {...props}>
              {imageUrl.length > 0 ? null : uploadButton}
            </Upload>
            <Modal
              open={previewOpen}
              title={imageUrl.length > 0 && imageUrl[0].name}
              footer={null}
              onCancel={handleCancel}
            >
              <img
                alt="example"
                style={{
                  width: "100%",
                }}
                src={imageUrl.length > 0 && imageUrl[0].url}
              />
            </Modal>
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

export default PhanMemForm;
