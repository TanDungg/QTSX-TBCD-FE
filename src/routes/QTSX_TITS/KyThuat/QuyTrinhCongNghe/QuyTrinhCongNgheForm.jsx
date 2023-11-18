import React, { useState, useEffect } from "react";
import { Button, Card, DatePicker, Form, Spin, Upload } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { Input, Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { BASE_URL_API, DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { getDateNow, getLocalStorage, getTokenInfo } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import Helpers from "src/helpers";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import moment from "moment";

const FormItem = Form.Item;

const initialState = {
  maQuyTrinhCongNghe: "",
  tenQuyTrinhCongNghe: "",
  tits_qtsx_SanPham_Id: "",
  ngayBanHanh: "",
  ngayHieuLuc: "",
  file: "",
};

function QuyTrinhCongNgheForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { loading } = useSelector(({ common }) => common).toJS();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListSanPham, setListSanPham] = useState([]);
  const [FileThongSoKyThuat, setFileThongSoKyThuat] = useState(null);
  const [DisableUpload, setDisableUpload] = useState(false);
  const [info, setInfo] = useState(null);
  const [fieldTouch, setFieldTouch] = useState(false);
  const {
    maQuyTrinhCongNghe,
    tenQuyTrinhCongNghe,
    tits_qtsx_SanPham_Id,
    ngayBanHanh,
    ngayHieuLuc,
  } = initialState;
  const { setFieldsValue, validateFields, resetFields } = form;

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getListSanPham();
        setFieldsValue({
          quytrinhcongnghe: {
            ngayBanHanh: moment(getDateNow(), "DD/MM/YYYY"),
            ngayHieuLuc: moment(getDateNow(), "DD/MM/YYYY"),
          },
        });
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getInfo(match.params.id);
          getListSanPham();
        }
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPham?page=-1`,
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
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Lấy thông tin info
   *
   * @param {*} id
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhCongNghe/${id}`,
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
          setInfo(res.data);
          setFieldsValue({
            quytrinhcongnghe: {
              ...res.data,
              ngayBanHanh: moment(res.data.ngayBanHanh, "DD/MM/YYYY"),
              ngayHieuLuc: moment(res.data.ngayHieuLuc, "DD/MM/YYYY"),
            },
          });
          if (res.data.file) {
            setFileThongSoKyThuat(res.data.file);
            setDisableUpload(true);
          }
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    uploadFile(values.quytrinhcongnghe);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.quytrinhcongnghe, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (quytrinhcongnghe, saveQuit) => {
    if (quytrinhcongnghe.file) {
      if (type === "new") {
        const formData = new FormData();
        formData.append("file", quytrinhcongnghe.file.file);
        fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            quytrinhcongnghe.file = data.path;
            saveData(quytrinhcongnghe, saveQuit);
          })
          .catch(() => {
            console.log("upload failed.");
          });
      }
      if (type === "edit") {
        if (quytrinhcongnghe.file.file) {
          const formData = new FormData();
          formData.append("file", quytrinhcongnghe.file.file);
          fetch(
            info.file
              ? `${BASE_URL_API}/api/Upload?stringPath=${info.file}`
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
              quytrinhcongnghe.file = data.path;
              saveData(quytrinhcongnghe, saveQuit);
            })
            .catch(() => {
              console.log("upload failed.");
            });
        } else {
          saveData(quytrinhcongnghe, saveQuit);
        }
      }
    } else {
      Helpers.alertError(`File thông số kỹ thuật không được để trống`);
      setFieldTouch(false);
    }
  };

  const saveData = (quytrinhcongnghe, saveQuit = false) => {
    const newData = {
      ...quytrinhcongnghe,
      ngayBanHanh: quytrinhcongnghe.ngayBanHanh.format("DD/MM/YYYY"),
      ngayHieuLuc: quytrinhcongnghe.ngayHieuLuc.format("DD/MM/YYYY"),
    };
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_QuyTrinhCongNghe`,
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
          if (res && res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFileThongSoKyThuat(null);
              setFieldTouch(false);
              setDisableUpload(false);
              setFieldsValue({
                quytrinhcongnghe: {
                  ngayBanHanh: moment(getDateNow(), "DD/MM/YYYY"),
                  ngayHieuLuc: moment(getDateNow(), "DD/MM/YYYY"),
                },
              });
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...quytrinhcongnghe,
        id: id,
        ngayBanHanh: quytrinhcongnghe.ngayBanHanh.format("DD/MM/YYYY"),
        ngayHieuLuc: quytrinhcongnghe.ngayHieuLuc.format("DD/MM/YYYY"),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_QuyTrinhCongNghe/${id}`,
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
          if (res && res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              setFieldTouch(false);
              getInfo(id);
            }
          }
        })
        .catch((error) => console.log(error));
    }
  };

  /**
   * Quay lại trang sản phẩm
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

  const props = {
    accept: "application/pdf",
    beforeUpload: (file) => {
      const isPDF = file.type === "application/pdf";
      if (!isPDF) {
        Helpers.alertError(`${file.name} không phải là tệp PDF`);
      } else {
        setFileThongSoKyThuat(file);
        setDisableUpload(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const handleViewFile = (record) => {
    window.open(`${BASE_URL_API}/${record.fileUrl}`, "_blank");
  };

  const formTitle =
    type === "new"
      ? "Thêm mới quy trình công nghệ"
      : "Chỉnh sửa quy trình công nghệ";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Spin spinning={loading}>
          <Form
            {...DEFAULT_FORM_CUSTOM}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Mã quy trình"
              name={["quytrinhcongnghe", "maQuyTrinhCongNghe"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={maQuyTrinhCongNghe}
            >
              <Input
                className="input-item"
                placeholder="Nhập mã quy trình công nghệ"
              />
            </FormItem>
            <FormItem
              label="Tên quy trình"
              name={["quytrinhcongnghe", "tenQuyTrinhCongNghe"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={tenQuyTrinhCongNghe}
            >
              <Input
                className="input-item"
                placeholder="Nhập tên quy trình công nghệ"
              />
            </FormItem>
            <FormItem
              label="Sản phẩm"
              name={["quytrinhcongnghe", "tits_qtsx_SanPham_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={tits_qtsx_SanPham_Id}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListSanPham ? ListSanPham : []}
                placeholder="Chọn sản phẩm"
                optionsvalue={["id", "tenSanPham"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Ngày ban hành"
              name={["quytrinhcongnghe", "ngayBanHanh"]}
              rules={[
                {
                  required: true,
                },
              ]}
              initialValue={ngayBanHanh}
            >
              <DatePicker
                format={"DD/MM/YYYY"}
                allowClear={false}
                disabled={type === "detail" ? true : false}
              />
            </FormItem>
            <FormItem
              label="Ngày hiệu lực"
              name={["quytrinhcongnghe", "ngayHieuLuc"]}
              rules={[
                {
                  required: true,
                },
              ]}
              initialValue={ngayHieuLuc}
            >
              <DatePicker
                format={"DD/MM/YYYY"}
                allowClear={false}
                disabled={type === "detail" ? true : false}
              />
            </FormItem>
            <FormItem
              label="Thông số kỹ thuật"
              name={["quytrinhcongnghe", "file"]}
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
                    Tải file thông số kỹ thuật
                  </Button>
                </Upload>
              ) : FileThongSoKyThuat && FileThongSoKyThuat.name ? (
                <span>
                  <span
                    style={{ color: "#0469B9", cursor: "pointer" }}
                    onClick={() => handleViewFile(FileThongSoKyThuat)}
                  >
                    {FileThongSoKyThuat.name.length > 20
                      ? FileThongSoKyThuat.name.substring(0, 20) + "..."
                      : FileThongSoKyThuat.name}{" "}
                  </span>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    disabled={type === "new" || type === "edit" ? false : true}
                    onClick={() => {
                      setFileThongSoKyThuat(null);
                      setDisableUpload(false);
                      setFieldsValue({
                        quytrinhcongnghe: {
                          file: null,
                        },
                      });
                    }}
                  />
                </span>
              ) : (
                <span>
                  <a
                    target="_blank"
                    href={BASE_URL_API + FileThongSoKyThuat}
                    rel="noopener noreferrer"
                  >
                    {FileThongSoKyThuat && FileThongSoKyThuat.split("/")[5]}{" "}
                  </a>
                  {(type === "new" || type === "edit") && (
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      onClick={() => {
                        setFileThongSoKyThuat(null);
                        setDisableUpload(false);
                        setFieldsValue({
                          quytrinhcongnghe: {
                            file: null,
                          },
                        });
                      }}
                    />
                  )}
                </span>
              )}
            </FormItem>
            <FormSubmit
              goBack={goBack}
              saveAndClose={saveAndClose}
              disabled={fieldTouch}
            />
          </Form>
        </Spin>
      </Card>
    </div>
  );
}

export default QuyTrinhCongNgheForm;
