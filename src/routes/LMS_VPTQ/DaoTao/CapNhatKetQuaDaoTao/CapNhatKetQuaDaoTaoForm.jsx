import {
  Card,
  Col,
  Row,
  Button,
  Form,
  Input,
  Upload,
  DatePicker,
  Progress,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getTokenInfo, getLocalStorage } from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  BASE_URL_API,
  DEFAULT_FORM_ADD_170PX,
  HINHTHUCDAOTAO_TUHOC,
} from "src/constants/Config";
import Helpers from "src/helpers";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";

const FormItem = Form.Item;
const { TextArea } = Input;

function CapNhatKetQuaDaoTaoForm({ permission, history, match }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [IsQuanLyDaoTao, setIsQuanLyDaoTao] = useState(false);
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListChuyenDeDaoTao, setListChuyenDeDaoTao] = useState([]);
  const [ListDonViDaoTao, setListDonViDaoTao] = useState([]);
  const [GiayChungNhan, setGiayChungNhan] = useState(null);
  const [DisableUploadGiayChungNhan, setDisableUploadGiayChungNhan] =
    useState(false);
  const [Loading, setLoading] = useState(null);

  useEffect(() => {
    if (permission && permission.add) {
      getIsQuanLyDaoTao();
      getListDonVi();
      getListDonViDaoTao();
      getListChuyenDeDaoTao();
    } else if ((permission && !permission.add) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIsQuanLyDaoTao = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiTrucTuyen/isQLHocTrucTuyen?donViHienHanh_Id=${INFO.donVi_Id}`,
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
        if (res) {
          setIsQuanLyDaoTao(res.data);
        } else {
          setIsQuanLyDaoTao(false);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/don-vi-by-user?`,
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
          setListDonVi(res.data);
        } else {
          setListDonVi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListUser = (donVi_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/user-by-dv-pb?donVi_Id=${donVi_Id}`,
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
          const newData = res.data.map((dt) => {
            return {
              ...dt,
              user: `${dt.maNhanVien} - ${dt.fullName}`,
            };
          });
          setListUser(newData);
        } else {
          setListUser([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListChuyenDeDaoTao = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChuyenDeDaoTao?page=-1`,
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
          const newData = res.data.filter(
            (dt) => dt.vptq_lms_HinhThucDaoTao_Id === HINHTHUCDAOTAO_TUHOC
          );
          setListChuyenDeDaoTao(newData);
        } else {
          setListChuyenDeDaoTao([]);
        }
      })
      .catch((error) => console.error(error));
  };

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

  const props = {
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
      } else {
        setGiayChungNhan(file);
        setDisableUploadGiayChungNhan(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const onFinish = (values) => {
    uploadFile(values.formthemmoiketqua);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.formthemmoiketqua, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (formthemmoiketqua, saveQuit) => {
    if (formthemmoiketqua.giayChungNhan) {
      const formData = new FormData();
      formData.append("file", formthemmoiketqua.giayChungNhan.file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE_URL_API}/api/Upload`, true);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setLoading(progress);
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          formthemmoiketqua.giayChungNhan = data.path;
          saveData(formthemmoiketqua, saveQuit);
        } else {
          Helpers.alertError("Tải file không thành công.");
        }
      };

      xhr.onerror = () => {
        Helpers.alertError("Tải file không thành công.");
      };
      xhr.setRequestHeader("Authorization", "Bearer " + INFO.token);
      xhr.send(formData);
    } else {
      Helpers.alertError(`Vui lòng tải file cập nhật kết quả đào tạo!`);
    }
  };

  const saveData = (formthemmoiketqua, saveQuit) => {
    const newData = {
      ...formthemmoiketqua,
      donVi_Id: IsQuanLyDaoTao ? formthemmoiketqua.donVi_Id : INFO.donVi_Id,
      user_Id: IsQuanLyDaoTao ? formthemmoiketqua.user_Id : INFO.user_Id,
      thoiGianDaoTao:
        formthemmoiketqua.thoiGianDaoTao.format("DD/MM/YYYY HH:mm"),
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/ket-qua-dao-tao-khong-lop-hoc?donViHienHanh_Id=${INFO.donVi_Id}`,
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
            setFieldTouch(false);
            setListUser([]);
            setGiayChungNhan(null);
            setDisableUploadGiayChungNhan(false);
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
  };

  const handleSelectDonVi = (value) => {
    getListUser(value);
    setFieldsValue({
      formthemmoiketqua: {
        user_Id: null,
      },
    });
  };

  const handleViewFile = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  const goBack = () => {
    history.push(`${match.url.replace("/them-moi", "")}`);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader title={"Thêm mới kết quả đào tạo"} back={goBack} />
      <Form
        {...DEFAULT_FORM_ADD_170PX}
        form={form}
        name="nguoi-dung-control"
        onFinish={onFinish}
        onFieldsChange={() => setFieldTouch(true)}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row align={"center"} style={{ width: "100%" }}>
            {IsQuanLyDaoTao ? (
              <Col xxl={14} xl={16} lg={18} md={20} sm={22} xs={24}>
                <FormItem
                  label="Đơn vị"
                  name={["formthemmoiketqua", "donVi_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDonVi ? ListDonVi : []}
                    placeholder="Chọn đơn vị"
                    optionsvalue={["donVi_Id", "tenDonVi"]}
                    style={{ width: "100%" }}
                    optionFilterProp="name"
                    showSearch
                    onSelect={handleSelectDonVi}
                  />
                </FormItem>
              </Col>
            ) : null}
            {IsQuanLyDaoTao ? (
              <Col xxl={14} xl={16} lg={18} md={20} sm={22} xs={24}>
                <FormItem
                  label="Học viên"
                  name={["formthemmoiketqua", "user_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListUser ? ListUser : []}
                    placeholder="Chọn học viên"
                    optionsvalue={["user_Id", "user"]}
                    style={{ width: "100%" }}
                    optionFilterProp="name"
                    showSearch
                  />
                </FormItem>
              </Col>
            ) : null}
            <Col xxl={14} xl={16} lg={18} md={20} sm={22} xs={24}>
              <FormItem
                label="Chuyên đề đào tạo"
                name={["formthemmoiketqua", "vptq_lms_ChuyenDeDaoTao_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListChuyenDeDaoTao ? ListChuyenDeDaoTao : []}
                  placeholder="Chọn chuyên đề đào tạo"
                  optionsvalue={["id", "tenChuyenDeDaoTao"]}
                  style={{ width: "100%" }}
                  optionFilterProp="name"
                  showSearch
                />
              </FormItem>
            </Col>
            <Col xxl={14} xl={16} lg={18} md={20} sm={22} xs={24}>
              <FormItem
                label="Đơn vị đào tạo"
                name={["formthemmoiketqua", "vptq_lms_DonViDaoTao_Id"]}
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
                  placeholder="Chọn đơn vị đào tạo"
                  optionsvalue={["id", "tenDonViDaoTao"]}
                  style={{ width: "100%" }}
                  optionFilterProp="name"
                  showSearch
                />
              </FormItem>
            </Col>
            <Col xxl={14} xl={16} lg={18} md={20} sm={22} xs={24}>
              <FormItem
                label="Thời gian đào tạo"
                name={["formthemmoiketqua", "thoiGianDaoTao"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  showTime
                  format={"DD/MM/YYYY HH:mm"}
                  allowClear={false}
                />
              </FormItem>
            </Col>
            <Col xxl={14} xl={16} lg={18} md={20} sm={22} xs={24}>
              <FormItem
                label="Hình ảnh"
                name={["formthemmoiketqua", "giayChungNhan"]}
                rules={[
                  {
                    required: true,
                    type: "file",
                  },
                ]}
              >
                {!DisableUploadGiayChungNhan ? (
                  <Upload {...props}>
                    <Button
                      className="th-margin-bottom-0 btn-margin-bottom-0"
                      style={{
                        marginBottom: 0,
                      }}
                      icon={<UploadOutlined />}
                    >
                      Tải file hình ảnh
                    </Button>
                  </Upload>
                ) : GiayChungNhan && GiayChungNhan.name ? (
                  <span>
                    <span
                      style={{
                        color: "#0469B9",
                        cursor: "pointer",
                        whiteSpace: "break-spaces",
                      }}
                      onClick={() => handleViewFile(GiayChungNhan)}
                    >
                      {GiayChungNhan.name}{" "}
                    </span>
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      onClick={() => {
                        setGiayChungNhan(null);
                        setDisableUploadGiayChungNhan(false);
                        setFieldsValue({
                          formthemmoiketqua: {
                            giayChungNhan: null,
                          },
                        });
                      }}
                    />
                  </span>
                ) : (
                  <span>
                    <a
                      target="_blank"
                      href={BASE_URL_API + GiayChungNhan}
                      rel="noopener noreferrer"
                      style={{
                        whiteSpace: "break-spaces",
                        wordBreak: "break-all",
                      }}
                    >
                      {GiayChungNhan && GiayChungNhan.split("/")[5]}{" "}
                    </a>
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      onClick={() => {
                        setGiayChungNhan(null);
                        setDisableUploadGiayChungNhan(false);
                        setFieldsValue({
                          formthemmoiketqua: {
                            giayChungNhan: null,
                          },
                        });
                      }}
                    />
                  </span>
                )}
              </FormItem>
            </Col>
            <Col xxl={14} xl={16} lg={18} md={20} sm={22} xs={24}>
              <FormItem
                label="Ghi chú"
                name={["formthemmoiketqua", "moTa"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <TextArea
                  rows={2}
                  className="input-item"
                  placeholder="Nhập ghi chú"
                />
              </FormItem>
            </Col>
            <Col span={24} align="left">
              {Loading && (
                <Progress
                  percent={parseFloat(Loading.toFixed(2))}
                  type="line"
                />
              )}
            </Col>
          </Row>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Card>
      </Form>
    </div>
  );
}

export default CapNhatKetQuaDaoTaoForm;
