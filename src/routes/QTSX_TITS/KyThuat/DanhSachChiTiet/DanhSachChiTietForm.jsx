import React, { useState, useEffect } from "react";
import { Button, Card, Form, Image, Spin, Upload } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { Input, Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { BASE_URL_API, DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { getLocalStorage, getTokenInfo, renderPDF } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import Helpers from "src/helpers";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";

const FormItem = Form.Item;

function DanhSachChiTietForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { setFieldsValue, validateFields, resetFields } = form;
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { loading } = useSelector(({ common }) => common).toJS();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListCongDoan, setListCongDoan] = useState([]);
  const [ListChiTiet, setListChiTiet] = useState([]);
  const [ListDonViTinh, setListDonViTinh] = useState([]);
  const [FileDinhKem, setFileDinhKem] = useState(null);
  const [DisableUploadFileDinhKem, setDisableUploadFileDinhKem] =
    useState(false);
  const [FileHinhAnh, setFileHinhAnh] = useState(null);
  const [FileAnh, setFileAnh] = useState(null);
  const [DisableUpload, setDisableUpload] = useState(false);
  const [OpenImage, setOpenImage] = useState(false);
  const [info, setInfo] = useState(null);
  const [fieldTouch, setFieldTouch] = useState(false);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getDonViTinh();
        getCongDoan();
        getChiTiet();
        getSanPham();
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getInfo(match.params.id);
          getSanPham();
          getCongDoan();
          getChiTiet();
          getDonViTinh();
        }
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_SanPham?page=-1",
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

  const getCongDoan = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CongDoan?donVi_Id=${INFO.donVi_Id}&page=-1`,
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
          setListCongDoan(res.data);
        } else {
          setListCongDoan([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getChiTiet = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ChiTiet?page=-1`,
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
          setListChiTiet(res.data);
        } else {
          setListChiTiet([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getDonViTinh = () => {
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
          `tits_qtsx_ChiTiet/${id}`,
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
            danhsachchitiet: {
              ...res.data,
            },
          });
          if (res.data.hinhAnh) {
            setFileHinhAnh(res.data.hinhAnh);
            setDisableUpload(true);
          }
          if (res.data.fileDinhKem) {
            setFileDinhKem(res.data.fileDinhKem);
            setDisableUploadFileDinhKem(true);
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
    uploadFile(values.danhsachchitiet);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.danhsachchitiet, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (danhsachchitiet, saveQuit) => {
    if (type === "new") {
      if (danhsachchitiet.hinhAnh && danhsachchitiet.fileDinhKem) {
        const formData = new FormData();
        formData.append("lstFiles", danhsachchitiet.hinhAnh.file);
        formData.append("lstFiles", danhsachchitiet.fileDinhKem.file);
        fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            danhsachchitiet.hinhAnh = data[0].path;
            danhsachchitiet.fileDinhKem = data[1].path;
            saveData(danhsachchitiet, saveQuit);
          })
          .catch(() => {
            console.log("upload failed.");
          });
      } else if (danhsachchitiet.hinhAnh || danhsachchitiet.fileDinhKem) {
        const formData = new FormData();
        danhsachchitiet.hinhAnh &&
          formData.append("lstFiles", danhsachchitiet.hinhAnh.file);
        danhsachchitiet.fileDinhKem &&
          formData.append("lstFiles", danhsachchitiet.fileDinhKem.file);

        fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (danhsachchitiet.hinhAnh) {
              danhsachchitiet.hinhAnh = data[0].path;
            } else {
              danhsachchitiet.fileDinhKem = data[0].path;
            }
            saveData(danhsachchitiet, saveQuit);
          })
          .catch(() => {
            console.log("upload failed.");
          });
      } else {
        saveData(danhsachchitiet, saveQuit);
      }
    } else {
      if (
        danhsachchitiet.hinhAnh &&
        danhsachchitiet.hinhAnh.file &&
        danhsachchitiet.fileDinhKem &&
        danhsachchitiet.fileDinhKem.file
      ) {
        const formData = new FormData();
        formData.append("lstFiles", danhsachchitiet.hinhAnh.file);
        formData.append("lstFiles", danhsachchitiet.fileDinhKem.file);

        fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            danhsachchitiet.hinhAnh = data[0].path;
            danhsachchitiet.fileDinhKem = data[1].path;
            saveData(danhsachchitiet, saveQuit);
          })
          .catch(() => {
            console.log("upload failed.");
          });
      } else if (
        (danhsachchitiet.hinhAnh && danhsachchitiet.hinhAnh.file) ||
        (danhsachchitiet.fileDinhKem && danhsachchitiet.fileDinhKem.file)
      ) {
        const formData = new FormData();
        danhsachchitiet.hinhAnh.file &&
          formData.append("lstFiles", danhsachchitiet.hinhAnh.file);
        danhsachchitiet.fileDinhKem.file &&
          formData.append("lstFiles", danhsachchitiet.fileDinhKem.file);

        fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (danhsachchitiet.hinhAnh.file) {
              danhsachchitiet.hinhAnh = data[0].path;
            } else {
              danhsachchitiet.fileDinhKem = data[0].path;
            }
            saveData(danhsachchitiet, saveQuit);
          })
          .catch(() => {
            console.log("upload failed.");
          });
      } else {
        saveData(danhsachchitiet, saveQuit);
      }
    }
  };

  const saveData = (danhsachchitiet, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_ChiTiet`,
            "POST",
            danhsachchitiet,
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
              setFileHinhAnh(null);
              setFileDinhKem(null);
              setFileAnh(null);
              setFieldTouch(false);
              setDisableUpload(false);
              setDisableUploadFileDinhKem(false);
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      danhsachchitiet.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_ChiTiet/${id}`,
            "PUT",
            danhsachchitiet,
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
   * Quay lại trang chi tiết
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

  const propsfiledinhkem = {
    beforeUpload: (file) => {
      const isFile = file.type === "application/pdf";
      if (!isFile) {
        Helpers.alertError(`${file.name} không phải là file pdf`);
      } else {
        setFileDinhKem(file);
        setDisableUploadFileDinhKem(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const handleViewFile = (file) => {
    if (file.type === "application/pdf") {
      renderPDF(file);
    } else {
      setOpenImage(true);
    }
  };

  const formTitle = type === "new" ? "Thêm mới chi tiết" : "Chỉnh sửa chi tiết";

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
              label="Mã chi tiết"
              name={["danhsachchitiet", "maChiTiet"]}
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
              <Input className="input-item" placeholder="Nhập mã chi tiết" />
            </FormItem>
            <FormItem
              label="Tên chi tiết"
              name={["danhsachchitiet", "tenChiTiet"]}
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
              <Input className="input-item" placeholder="Nhập tên chi tiết" />
            </FormItem>
            <FormItem
              label="Sản phẩm"
              name={["danhsachchitiet", "tits_qtsx_SanPham_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
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
              label="Đơn vị tính"
              name={["danhsachchitiet", "donViTinh_Id"]}
              rules={[
                {
                  type: "string",
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
              label="Công đoạn"
              name={["danhsachchitiet", "tits_qtsx_CongDoan_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListCongDoan ? ListCongDoan : []}
                placeholder="Chọn công đoạn"
                optionsvalue={["id", "tenCongDoan"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Thông số kỹ thuật"
              name={["danhsachchitiet", "thongSoKyThuat"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập thông số kỹ thuật"
              />
            </FormItem>
            <FormItem
              label="Chi tiết"
              name={["danhsachchitiet", "tits_qtsx_ChiTiet_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListChiTiet ? ListChiTiet : []}
                placeholder="Chọn chi tiết cha"
                optionsvalue={["id", "tenChiTiet"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Hình ảnh"
              name={["danhsachchitiet", "hinhAnh"]}
              rules={[
                {
                  type: "file",
                },
              ]}
            >
              {!DisableUpload ? (
                <Upload {...propshinhanh}>
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
                      setFieldsValue({
                        danhsachchitiet: {
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
                          danhsachchitiet: {
                            hinhAnh: null,
                          },
                        });
                      }}
                    />
                  )}
                </span>
              )}
            </FormItem>
            <FormItem
              label="File đính kèm"
              name={["danhsachchitiet", "fileDinhKem"]}
              rules={[
                {
                  type: "file",
                },
              ]}
            >
              {!DisableUploadFileDinhKem ? (
                <Upload {...propsfiledinhkem}>
                  <Button
                    style={{
                      marginBottom: 0,
                    }}
                    icon={<UploadOutlined />}
                    disabled={type === "detail" ? true : false}
                  >
                    Tải file đính kèm
                  </Button>
                </Upload>
              ) : FileDinhKem && FileDinhKem.name ? (
                <span>
                  <span
                    style={{ color: "#0469B9", cursor: "pointer" }}
                    onClick={() => handleViewFile(FileDinhKem)}
                  >
                    {FileDinhKem.name.length > 40
                      ? FileDinhKem.name.substring(0, 40) + "..."
                      : FileDinhKem.name}{" "}
                  </span>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    disabled={type === "new" || type === "edit" ? false : true}
                    onClick={() => {
                      setFileDinhKem(null);
                      setDisableUpload(false);
                      setFieldsValue({
                        danhsachchitiet: {
                          fileDinhKem: null,
                        },
                      });
                    }}
                  />
                </span>
              ) : (
                <span>
                  <a
                    target="_blank"
                    href={BASE_URL_API + FileDinhKem}
                    rel="noopener noreferrer"
                  >
                    {FileDinhKem && FileDinhKem.split("/")[5]}{" "}
                  </a>
                  {(type === "new" || type === "edit") && (
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      onClick={() => {
                        setFileDinhKem(null);
                        setDisableUpload(false);
                        setFieldsValue({
                          danhsachchitiet: {
                            fileDinhKem: null,
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

export default DanhSachChiTietForm;
