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

function LenhSanXuatForm({ match, permission, history }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { setFieldsValue, validateFields, resetFields } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListDonHang, setListDonHang] = useState([]);
  const [FileDinhKem, setFileDinhKem] = useState(null);
  const [DisableUpload, setDisableUpload] = useState(false);
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getListSanPham();
    getListDonHang();
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        setFieldsValue({
          lenhsanxuat: {
            thoiGianBatDau: moment(getDateNow(), "DD/MM/YYYY"),
            thoiGianKetThuc: moment(getDateNow(1), "DD/MM/YYYY"),
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

  const getListDonHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_DonHang?page=-1`,
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
          const newData = res.data.map((data) => {
            return {
              ...data,
              donHang: `${data.maPhieu} - ${data.tenDonHang}`,
            };
          });
          setListDonHang(newData);
        } else {
          setListDonHang([]);
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
          `tits_qtsx_LenhSanXuat/${id}`,
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
            lenhsanxuat: {
              ...res.data,
              thoiGianBatDau: moment(res.data.thoiGianBatDau, "DD/MM/YYYY"),
              thoiGianKetThuc: moment(res.data.thoiGianKetThuc, "DD/MM/YYYY"),
            },
          });
          if (res.data.fileDinhKem) {
            setFileDinhKem(res.data.fileDinhKem);
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
    uploadFile(values.lenhsanxuat);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.lenhsanxuat, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (lenhsanxuat, saveQuit) => {
    if (lenhsanxuat.fileDinhKem) {
      if (type === "new") {
        const formData = new FormData();
        formData.append("file", lenhsanxuat.fileDinhKem.file);
        fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            lenhsanxuat.fileDinhKem = data.path;
            saveData(lenhsanxuat, saveQuit);
          })
          .catch(() => {
            console.log("upload failed.");
          });
      }
      if (type === "edit") {
        if (lenhsanxuat.fileDinhKem.file) {
          const formData = new FormData();
          formData.append("file", lenhsanxuat.fileDinhKem.file);
          fetch(
            info.fileDinhKem
              ? `${BASE_URL_API}/api/Upload?stringPath=${info.fileDinhKem}`
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
              lenhsanxuat.fileDinhKem = data.path;
              saveData(lenhsanxuat, saveQuit);
            })
            .catch(() => {
              console.log("upload failed.");
            });
        } else {
          saveData(lenhsanxuat, saveQuit);
        }
      }
    } else {
      Helpers.alertError(`File đính kèm không được để trống`);
      setFieldTouch(false);
    }
  };

  const saveData = (lenhsanxuat, saveQuit = false) => {
    const newData = {
      ...lenhsanxuat,
      thoiGianBatDau: lenhsanxuat.thoiGianBatDau.format("DD/MM/YYYY"),
      thoiGianKetThuc: lenhsanxuat.thoiGianKetThuc.format("DD/MM/YYYY"),
    };
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_LenhSanXuat`,
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
              setFileDinhKem(null);
              setFieldTouch(false);
              setDisableUpload(false);
              setFieldsValue({
                lenhsanxuat: {
                  thoiGianBatDau: moment(getDateNow(), "DD/MM/YYYY"),
                  thoiGianKetThuc: moment(getDateNow(), "DD/MM/YYYY"),
                },
              });
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...lenhsanxuat,
        id: id,
        thoiGianBatDau: lenhsanxuat.thoiGianBatDau.format("DD/MM/YYYY"),
        thoiGianKetThuc: lenhsanxuat.thoiGianKetThuc.format("DD/MM/YYYY"),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_LenhSanXuat/${id}`,
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
    accept: ".pdf, .xlsx, .xls",
    beforeUpload: (file) => {
      const isPDF = file.type === "application/pdf";
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isPDF && !isExcel) {
        Helpers.alertError(`${file.name} không phải là tệp PDF hoặc Excel`);
      } else {
        setFileDinhKem(file);
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
    type === "new" ? "Thêm mới lệnh sản xuất" : "Chỉnh sửa lệnh sản xuất";

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
              label="Tên lệnh sản xuất"
              name={["lenhsanxuat", "tenLenhSanXuat"]}
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
              <Input
                className="input-item"
                placeholder="Nhập tên lệnh sản xuất"
              />
            </FormItem>
            <FormItem
              label="Sản phẩm"
              name={["lenhsanxuat", "tits_qtsx_SanPham_Id"]}
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
              label="Số lượng"
              name={["lenhsanxuat", "soLuong"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input
                type="number"
                className="input-item"
                placeholder="Nhập số lượng"
              />
            </FormItem>
            <FormItem
              label="Thời gian bắt đầu"
              name={["lenhsanxuat", "thoiGianBatDau"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <DatePicker format={"DD/MM/YYYY"} allowClear={false} />
            </FormItem>
            <FormItem
              label="Thời gian kết thúc"
              name={["lenhsanxuat", "thoiGianKetThuc"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <DatePicker format={"DD/MM/YYYY"} allowClear={false} />
            </FormItem>
            <FormItem
              label="Đơn hàng"
              name={["lenhsanxuat", "tits_qtsx_DonHang_Id"]}
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
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListDonHang ? ListDonHang : []}
                placeholder="Chọn đơn hàng"
                optionsvalue={["id", "donHang"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Ghi chú"
              name={["lenhsanxuat", "moTa"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập ghi chú" />
            </FormItem>
            <FormItem
              label="File đính kèm"
              name={["lenhsanxuat", "fileDinhKem"]}
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
                    Tải file đính kèm
                  </Button>
                </Upload>
              ) : FileDinhKem && FileDinhKem.name ? (
                <span>
                  <span
                    style={{ color: "#0469B9", cursor: "pointer" }}
                    onClick={() => handleViewFile(FileDinhKem)}
                  >
                    {FileDinhKem.name.length > 35
                      ? FileDinhKem.name.substring(0, 35) + "..."
                      : FileDinhKem.name}{" "}
                  </span>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    disabled={type === "new" || type === "edit" ? false : true}
                    onClick={() => {
                      setFileDinhKem(null);
                      setDisableUpload(false);
                      setFieldsValue({
                        lenhsanxuat: {
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
                          lenhsanxuat: {
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

export default LenhSanXuatForm;
