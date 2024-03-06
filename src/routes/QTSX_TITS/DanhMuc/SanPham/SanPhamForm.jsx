import React, { useState, useEffect } from "react";
import { Button, Card, Form, Image, Spin, Upload } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { Input, Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { BASE_URL_API, DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import Helpers from "src/helpers";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";

const FormItem = Form.Item;

function SanPhamForm({ match, permission, history }) {
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
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [ListDonViTinh, setListDonViTinh] = useState([]);
  const [FileHinhAnh, setFileHinhAnh] = useState(null);
  const [FileAnh, setFileAnh] = useState(null);
  const [OpenImage, setOpenImage] = useState(false);
  const [DisableUpload, setDisableUpload] = useState(false);
  const [FileThongSo, setFileThongSo] = useState(null);
  const [DisableUploadThongSo, setDisableUploadThongSo] = useState(false);
  const [info, setInfo] = useState(null);
  const [fieldTouch, setFieldTouch] = useState(false);
  const { setFieldsValue, validateFields, resetFields } = form;

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getDonViTinh();
        getLoaiSanPham();
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getInfo(match.params.id);
          getDonViTinh();

          getLoaiSanPham();
        }
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLoaiSanPham = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_LoaiSanPham?page=-1",
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
          setListLoaiSanPham(res.data);
        } else {
          setListLoaiSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
 
  const getDonViTinh = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonViTinh?donVi_Id=${INFO.donVi_Id}&page=-1`,
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
          setListDonViTinh(res.data);
        } else {
          setListDonViTinh([]);
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
          `tits_qtsx_SanPham/${id}`,
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
            sanpham: {
              ...res.data,
            },
          });
          if (res.data.thongSoKyThuat) {
            setFileThongSo(res.data.thongSoKyThuat);
            setDisableUploadThongSo(true);
          }
          if (res.data.hinhAnh) {
            setFileHinhAnh(res.data.hinhAnh);
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
    uploadFile(values.sanpham);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.sanpham, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  const XoaFile = (hinhAnh, thongSoKyThuat) => {
    const listStringPath = [];
    if (hinhAnh) {
      listStringPath.push({
        stringPath: hinhAnh,
      });
    }
    if (thongSoKyThuat) {
      listStringPath.push({
        stringPath: thongSoKyThuat,
      });
    }
    if (listStringPath.length > 0) {
      dispatch(
        fetchStart(`Upload/RemoveMulti`, "POST", listStringPath, "XOAFILE", "")
      );
    }
  };
  const CallAPIUpLoadFile = (
    sanpham,
    saveQuit,
    hinhAnh,
    thongSoKyThuat,
    stringPath
  ) => {
    const formData = new FormData();
    let url = `Upload${
      stringPath !== undefined ? `?stringPath=${stringPath}` : ""
    }`;
    if (hinhAnh !== undefined && thongSoKyThuat !== undefined) {
      formData.append("lstFiles", hinhAnh);
      formData.append("lstFiles", thongSoKyThuat);
      url = "Upload/Multi";
    } else if (hinhAnh !== undefined) {
      formData.append("file", hinhAnh);
    } else if (thongSoKyThuat !== undefined) {
      formData.append("file", thongSoKyThuat);
    }
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          url,
          "POST",
          formData,
          "UPLOADFILE",
          "",
          resolve,
          reject,
          true
        )
      );
    })
      .then((res) => {
        if (res && res.status === 200) {
          if (hinhAnh !== undefined && thongSoKyThuat !== undefined) {
            sanpham.hinhAnh = res.data[0].path;
            sanpham.thongSoKyThuat = res.data[1].path;
          } else if (thongSoKyThuat !== undefined) {
            sanpham.thongSoKyThuat = res.data.path;
          } else if (hinhAnh !== undefined) {
            sanpham.hinhAnh = res.data.path;
          }
          saveData(sanpham, saveQuit);
        }
      })
      .catch((error) => console.log(error));
  };

  const uploadFile = (sanpham, saveQuit) => {
    if (type === "new") {
      if (sanpham.hinhAnh && sanpham.thongSoKyThuat) {
        CallAPIUpLoadFile(
          sanpham,
          saveQuit,
          sanpham.hinhAnh.file,
          sanpham.thongSoKyThuat.file,
          undefined
        );
      } else if (sanpham.hinhAnh) {
        CallAPIUpLoadFile(
          sanpham,
          saveQuit,
          sanpham.hinhAnh.file,
          undefined,
          undefined
        );
      } else if (sanpham.thongSoKyThuat) {
        CallAPIUpLoadFile(
          sanpham,
          saveQuit,
          undefined,
          sanpham.thongSoKyThuat.file,
          undefined
        );
      } else {
        saveData(sanpham, saveQuit);
      }
    } else if (type === "edit") {
      if (sanpham.hinhAnh && sanpham.thongSoKyThuat) {
        if (sanpham.hinhAnh.file && sanpham.thongSoKyThuat.file) {
          XoaFile(info.hinhAnh, info.thongSoKyThuat);
          CallAPIUpLoadFile(
            sanpham,
            saveQuit,
            sanpham.hinhAnh.file,
            sanpham.thongSoKyThuat.file,
            undefined
          );
        } else if (sanpham.hinhAnh.file) {
          CallAPIUpLoadFile(
            sanpham,
            saveQuit,
            sanpham.hinhAnh.file,
            undefined,
            undefined
          );
        } else if (sanpham.thongSoKyThuat.file) {
          CallAPIUpLoadFile(
            sanpham,
            saveQuit,
            undefined,
            sanpham.thongSoKyThuat.file,
            undefined
          );
        } else {
          saveData(sanpham, saveQuit);
        }
      } else if (sanpham.hinhAnh && !sanpham.thongSoKyThuat) {
        if (sanpham.hinhAnh.file) {
          CallAPIUpLoadFile(
            sanpham,
            saveQuit,
            sanpham.hinhAnh.file,
            undefined,
            info.hinhAnh ? info.hinhAnh : undefined
          );
        } else {
          saveData(sanpham, saveQuit);
        }
        XoaFile(info.thongSoKyThuat);
      } else if (!sanpham.hinhAnh && sanpham.thongSoKyThuat) {
        XoaFile(info.hinhAnh);
        if (sanpham.thongSoKyThuat.file) {
          CallAPIUpLoadFile(
            sanpham,
            saveQuit,
            undefined,
            sanpham.thongSoKyThuat.file,
            info.thongSoKyThuat ? info.thongSoKyThuat : undefined
          );
        } else {
          saveData(sanpham, saveQuit);
        }
      } else {
        XoaFile(info.hinhAnh, info.thongSoKyThuat);
        saveData(sanpham, saveQuit);
      }
    }
  };

  const saveData = (sanpham, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_SanPham`,
            "POST",
            sanpham,
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
              setFieldTouch(false);
              setFileHinhAnh(null);
              setFileAnh(null);
              setDisableUpload(false);
              setFileThongSo(null);
              setDisableUploadThongSo(false);
            }
          }
        })
        .catch((error) => console.error(error));
    } else if (type === "edit") {
      sanpham.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_SanPham/${id}`,
            "PUT",
            sanpham,
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

  const propsthongso = {
    accept:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    beforeUpload: (file) => {
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        Helpers.alertError(`File ${file.name} không phải định dạng hỗ trợ`);
      } else {
        setFileThongSo(file);
        setDisableUploadThongSo(true);
      }

      return false;
    },
    showUploadList: false,
    maxCount: 1,
  };

  const props = {
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

  const handleViewFile = () => {
    setOpenImage(true);
  };

  const formTitle = type === "new" ? "Thêm mới sản phẩm" : "Chỉnh sửa sản phẩm";

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
              label="Mã sản phẩm"
              name={["sanpham", "maSanPham"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập mã sản phẩm" />
            </FormItem>
            <FormItem
              label="Tên sản phẩm"
              name={["sanpham", "tenSanPham"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập tên sản phẩm" />
            </FormItem>
            <FormItem
              label="Loại sản phẩm"
              name={["sanpham", "tits_qtsx_LoaiSanPham_Id"]}
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
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Đơn vị tính"
              name={["sanpham", "donViTinh_Id"]}
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
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Thông số kỹ thuật"
              name={["sanpham", "thongSoKyThuat"]}
              rules={[
                {
                  type: "file",
                  // required: true,
                },
              ]}
            >
              {!DisableUploadThongSo ? (
                <Upload {...propsthongso}>
                  <Button
                    style={{
                      marginBottom: 0,
                    }}
                    icon={<UploadOutlined />}
                    disabled={type === "detail" ? true : false}
                  >
                    File thông số kỹ thuật
                  </Button>
                </Upload>
              ) : FileThongSo && FileThongSo.name ? (
                <span>
                  <span
                    style={{
                      color: "#0469B9",
                      cursor: "pointer",
                      whiteSpace: "break-spaces",
                    }}
                    onClick={() => handleViewFile(FileThongSo)}
                  >
                    {FileThongSo.name}{" "}
                  </span>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    disabled={type === "new" || type === "edit" ? false : true}
                    onClick={() => {
                      setFileThongSo(null);
                      setDisableUploadThongSo(false);
                      setFieldTouch(true);
                      setFieldsValue({
                        sanpham: {
                          thongSoKyThuat: null,
                        },
                      });
                    }}
                  />
                </span>
              ) : (
                <span>
                  <a
                    target="_blank"
                    href={BASE_URL_API + FileThongSo}
                    rel="noopener noreferrer"
                    style={{
                      whiteSpace: "break-spaces",
                      wordBreak: "break-all",
                    }}
                  >
                    {FileThongSo && FileThongSo.split("/")[5]}{" "}
                  </a>
                  {(type === "new" || type === "edit") && (
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      onClick={() => {
                        setFileThongSo(null);
                        setDisableUploadThongSo(false);
                        setFieldTouch(true);
                        setFieldsValue({
                          sanpham: {
                            thongSoKyThuat: null,
                          },
                        });
                      }}
                    />
                  )}
                </span>
              )}
            </FormItem>
            <FormItem
              label="Hình ảnh"
              name={["sanpham", "hinhAnh"]}
              rules={[
                {
                  type: "file",
                  // required: true,
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
                    onClick={() => handleViewFile(FileHinhAnh)}
                  >
                    {FileHinhAnh.name}{" "}
                  </span>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    disabled={type === "new" || type === "edit" ? false : true}
                    onClick={() => {
                      setFileHinhAnh(null);
                      setDisableUpload(false);
                      setFieldTouch(true);
                      setFieldsValue({
                        sanpham: {
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
                  <Image
                    src={BASE_URL_API + FileHinhAnh}
                    alt="Hình ảnh"
                    style={{ maxWidth: 60, maxHeight: 60 }}
                  />{" "}
                  {(type === "new" || type === "edit") && (
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      onClick={() => {
                        setFileHinhAnh(null);
                        setDisableUpload(false);
                        setFieldTouch(true);
                        setFieldsValue({
                          sanpham: {
                            hinhAnh: null,
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

export default SanPhamForm;
