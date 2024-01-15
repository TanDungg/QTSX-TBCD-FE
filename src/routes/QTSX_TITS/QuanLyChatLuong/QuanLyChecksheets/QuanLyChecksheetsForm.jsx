import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  Row,
  Spin,
  Upload,
  Tag,
  Switch,
  Image,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { Input, Select, FormSubmit, Modal } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { BASE_URL_API, DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  DeleteOutlined,
  UploadOutlined,
  RollbackOutlined,
  SaveOutlined,
  CloseOutlined,
  CaretRightOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import Helpers from "src/helpers";
import ModalHangMuc from "./ModalHangMuc";
const FormItem = Form.Item;
const { Panel } = Collapse;
function QuanLyChecksheetsForm({ match, permission, history }) {
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
  const [ListCongDoan, setListCongDoan] = useState([]);
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [ListHangMucKiemTra, setListHangMucKiemTra] = useState([]);
  const [ListHinhAnh, setListHinhAnh] = useState([]);

  const [DataModal, setDataModal] = useState({
    tits_qtsx_LoaiSanPham_Id: "",
    tits_qtsx_SanPham_Id: "",
    tits_qtsx_CongDoan_Id: "",
    tenSanPham: "",
    tenCongDoan: "",
  });
  const [disableUpload, setDisableUpload] = useState(false);
  const [FileChat, setFileChat] = useState("");
  const [openImage, setOpenImage] = useState(false);
  const [File, setFile] = useState([]);
  const [info, setInfo] = useState({});
  const [ActiveModal, setActiveModal] = useState(false);

  const [fieldTouch, setFieldTouch] = useState(false);
  const { setFieldsValue, validateFields, resetFields } = form;

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getListLoaiSanPham();
        getListCongDoan();
        setFieldsValue({
          checkSheets: {
            isSuDung: true,
          },
        });
      }
    } else if (includes(match.url, "chinh-sua")) {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getInfo(match.params.id);
          getListLoaiSanPham();
        }
      }
    } else if (includes(match.url, "xac-nhan")) {
      if (permission && !permission.cof) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("xacnhan");
          setId(match.params.id);
          getInfo(match.params.id);
        }
      }
    } else if (includes(match.url, "chi-tiet")) {
      if (permission && !permission.cof) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("detail");
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

  const getListLoaiSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_LoaiSanPham?page=-1`,
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
          setListLoaiSanPham(
            res.data.map((sp) => {
              return {
                ...sp,
                name: sp.maLoaiSanPham + " - " + sp.tenLoaiSanPham,
              };
            })
          );
        } else {
          setListLoaiSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getListSanPham = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPham?page=-1&tits_qtsx_LoaiSanPham_Id=${id}`,
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
          setListSanPham(
            res.data.map((sp) => {
              return {
                ...sp,
                name: sp.maSanPham + " - " + sp.tenSanPham,
              };
            })
          );
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getListCongDoan = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CongDoan?page=-1`,
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
          setListCongDoan(
            res.data.map((sp) => {
              return {
                ...sp,
                name: sp.maCongDoan + " - " + sp.tenCongDoan,
              };
            })
          );
        } else {
          setListCongDoan([]);
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
          `tits_qtsx_CheckSheet/${id}`,
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
          getListLoaiSanPham();
          setFile(res.data.file);
          setDisableUpload(true);
          getListSanPham(res.data.tits_qtsx_LoaiSanPham_Id);
          setDataModal({
            tits_qtsx_LoaiSanPham_Id: res.data.tits_qtsx_LoaiSanPham_Id,
            tits_qtsx_SanPham_Id: res.data.tits_qtsx_SanPham_Id,
            tits_qtsx_CongDoan_Id: res.data.tits_qtsx_CongDoan_Id,
            tenSanPham: res.data.tenSanPham,
            tenCongDoan: res.data.tenCongDoan,
          });
          getListCongDoan();
          setListHangMucKiemTra(res.data.tits_qtsx_CheckSheetChiTiets);
          setFieldsValue({
            checkSheets: {
              ...res.data,
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const props = {
    accept: ".png, .jpg, .jpeg, .pdf",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      const isPDF = file.type === "application/pdf";
      if (!isPNG && !isPDF) {
        Helpers.alertError(`${file.name} không phải hình ảnh hoặc file pdf`);
      } else {
        setFile(file);
        setDisableUpload(true);
        const reader = new FileReader();
        reader.onload = (e) => setFileChat(e.target.result);
        reader.readAsDataURL(file);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.checkSheets);
  };
  const hanldeXacNhanTaiFile = (checkSheets, val) => {
    const formData = new FormData();
    formData.append("file", File);
    const url = info.file
      ? `${BASE_URL_API}/api/Upload?stringPath=${info.file}`
      : `${BASE_URL_API}/api/Upload`;
    fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: "Bearer ".concat(INFO.token),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        checkSheets.file = data.path;
        saveData(checkSheets, val);
      })
      .catch(() => {
        console.log("upload failed.");
      });
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListHangMucKiemTra.length === 0) {
          Helpers.alertError("Danh sách sản phẩm rỗng");
        } else {
          if (type === "new") {
            hanldeXacNhanTaiFile(values.checkSheets, val);
          } else if (type === "edit" && File.name) {
            hanldeXacNhanTaiFile(values.checkSheets, val);
          } else {
            values.checkSheets.file = info.file;
            saveData(values.checkSheets, val);
          }
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (checkSheets, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...checkSheets,
        tits_qtsx_CheckSheetChiTiets: ListHangMucKiemTra.map((ct) => {
          return {
            tits_qtsx_HangMucKiemTra_Id: ct.tits_qtsx_HangMucKiemTra_Id,
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_CheckSheet`,
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
              setDisableUpload(false);
              setListHangMucKiemTra([]);
              setListHinhAnh([]);
              setDataModal({
                tits_qtsx_LoaiSanPham_Id: "",
                tits_qtsx_SanPham_Id: "",
                tits_qtsx_CongDoan_Id: "",
                tenSanPham: "",
                tenCongDoan: "",
              });
            }
          } else {
          }
        })
        .catch((error) => console.error(error));
    } else if (type === "edit") {
      const newData = {
        ...info,
        ...checkSheets,
        tits_qtsx_CheckSheetChiTiets: ListHangMucKiemTra.map((ct) => {
          return {
            tits_qtsx_HangMucKiemTra_Id: ct.tits_qtsx_HangMucKiemTra_Id,
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_CheckSheet/${id}`,
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

  const saveDuyetTuChoi = (isDuyet) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_DinhMucVatTuThep/duyet/${id}`,
          "PUT",
          {
            id: id,
            lyDoTuChoi: !isDuyet ? "Từ chối" : undefined,
          },
          !isDuyet ? "TUCHOI" : "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(id);
          setFieldTouch(false);
        }
      })
      .catch((error) => console.error(error));
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận duyệt phiếu xuất kho",
    onOk: () => {
      saveDuyetTuChoi(true);
    },
  };
  const modalDuyet = () => {
    Modal(prop);
  };
  const prop1 = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận từ chối phiếu xuất kho",
    onOk: () => {
      saveDuyetTuChoi(false);
    },
  };
  const modalTuChoi = () => {
    Modal(prop1);
  };
  /**
   * Quay lại trang sản phẩm
   *
   */
  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new"
          ? "/them-moi"
          : type === "edit"
          ? `/${match.params.id}/chinh-sua`
          : type === "xacnhan"
          ? `/${match.params.id}/xac-nhan`
          : `/${match.params.id}/chi-tiet`,
        ""
      )}`
    );
  };
  const formTitle =
    type === "new" ? (
      "Thêm mới CheckSheets"
    ) : type === "edit" ? (
      "Chỉnh sửa CheckSheets"
    ) : type === "xacnhan" ? (
      <span>
        Duyệt CheckSheets{" "}
        <Tag style={{ fontSize: 14 }} color={"green"}>
          {info && info.maCheckSheet}
        </Tag>
      </span>
    ) : (
      <span>
        Chi tiết CheckSheets{" "}
        <Tag style={{ fontSize: 14 }} color="green">
          {info && info.maCheckSheet}
        </Tag>
      </span>
    );

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
            <Row>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Mã hồ sơ chất lượng"
                  name={["checkSheets", "maCheckSheet"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                      message: "Mã hồ sơ chất lượng không được quá 250 ký tự",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập mã hồ sơ chất lượng"
                    disabled={type !== "new" && type !== "edit"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Tên hồ sơ chất lượng"
                  name={["checkSheets", "tenCheckSheet"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                      message: "Tên hồ sơ chất lượng không được quá 250 ký tự",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên hồ sơ chất lượng"
                    disabled={type !== "new" && type !== "edit"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Loại sản phẩm"
                  name={["checkSheets", "tits_qtsx_LoaiSanPham_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListLoaiSanPham}
                    placeholder="Chọn loại sản phẩm"
                    optionsvalue={["id", "name"]}
                    style={{ width: "100%" }}
                    disabled={type !== "new"}
                    showSearch
                    optionFilterProp="name"
                    onSelect={(val) => {
                      getListSanPham(val);
                      const newData = { ...DataModal };
                      newData.tits_qtsx_LoaiSanPham_Id = val;
                      newData.tits_qtsx_SanPham_Id = "";
                      newData.tenSanPham = "";
                      setDataModal(newData);
                      setFieldsValue({
                        checkSheets: { tits_qtsx_SanPham_Id: null },
                      });
                      setListHangMucKiemTra([]);
                      setListHinhAnh([]);
                    }}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Sản phẩm"
                  name={["checkSheets", "tits_qtsx_SanPham_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListSanPham}
                    placeholder="Chọn sản phẩm"
                    optionsvalue={["id", "name"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={type !== "new"}
                    onSelect={(val) => {
                      const newData = { ...DataModal };
                      newData.tits_qtsx_SanPham_Id = val;
                      ListSanPham.forEach((sp) => {
                        if (sp.id === val) {
                          newData.tenSanPham =
                            sp.maSanPham + " - " + sp.tenSanPham;
                        }
                      });
                      setDataModal(newData);
                      setListHangMucKiemTra([]);
                      setListHinhAnh([]);
                    }}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Công đoạn"
                  name={["checkSheets", "tits_qtsx_CongDoan_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListCongDoan}
                    placeholder="Chọn công đoạn"
                    optionsvalue={["id", "name"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={type !== "new" && type !== "edit"}
                    onSelect={(val) => {
                      const newData = { ...DataModal };
                      newData.tits_qtsx_CongDoan_Id = val;
                      ListCongDoan.forEach((cd) => {
                        if (cd.id === val) {
                          newData.tenCongDoan = cd.tenCongDoan;
                        }
                      });
                      setDataModal(newData);
                      setListHangMucKiemTra([]);
                      setListHinhAnh([]);
                    }}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Sử dụng"
                  name={["checkSheets", "isSuDung"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch disabled={type === "detail"} />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Bảng vẽ kỹ thuật"
                  name={["checkSheets", "file"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  {!disableUpload ? (
                    <Upload {...props}>
                      <Button
                        className="th-margin-bottom-0"
                        style={{
                          marginBottom: 0,
                          height: 25,
                          lineHeight: "25px",
                        }}
                        icon={<UploadOutlined />}
                        disabled={type === "xacnhan" || type === "detail"}
                      >
                        Tải file
                      </Button>
                    </Upload>
                  ) : File.name ? (
                    <span>
                      <span
                        style={{ color: "#0469B9", cursor: "pointer" }}
                        onClick={() => setOpenImage(true)}
                      >
                        {File.name.length > 20
                          ? File.name.substring(0, 20) + "..."
                          : File.name}{" "}
                      </span>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        disabled={
                          type === "new" || type === "edit" ? false : true
                        }
                        onClick={() => {
                          setDisableUpload(false);
                          setFieldsValue({
                            checkSheets: {
                              file: undefined,
                            },
                          });
                        }}
                      />
                      <Image
                        width={100}
                        src={FileChat}
                        alt="preview"
                        style={{
                          display: "none",
                        }}
                        preview={{
                          visible: openImage,
                          scaleStep: 0.5,
                          src: FileChat,
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
                        href={BASE_URL_API + File}
                        rel="noopener noreferrer"
                      >
                        {File.split("/")[5]}{" "}
                      </a>
                      {!type === "detail" && (
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => {
                            setDisableUpload(false);
                          }}
                        />
                      )}
                    </span>
                  )}
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Ghi chú"
                  name={["checkSheets", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập ghi chú"
                    disabled={type !== "new" && type !== "edit"}
                  />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>
      <Row style={{ marginBottom: 15 }}>
        <Col span={24}>
          <h4 style={{ fontWeight: "bold", margin: 0 }}>
            Hạng mục kiểm tra chất lượng{" "}
            <a
              // style={{
              //   color: "#0469b9",
              //   cursor: "pointer",
              // }}
              onClick={() => setActiveModal(true)}
              disabled={
                DataModal.tits_qtsx_LoaiSanPham_Id === "" ||
                DataModal.tits_qtsx_SanPham_Id === "" ||
                DataModal.tits_qtsx_CongDoan_Id === "" ||
                type === "detail"
              }
            >
              <PlusCircleOutlined />
            </a>
          </h4>
        </Col>
      </Row>
      <Row>
        {ListHangMucKiemTra.length > 0 && (
          <Col span={12}>
            <Collapse
              accordion
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} />
              )}
              onChange={(val) => {
                ListHangMucKiemTra.forEach((hm) => {
                  if (hm.tits_qtsx_HangMucKiemTra_Id === val) {
                    setListHinhAnh(hm.list_HinhAnhs);
                  }
                });
              }}
            >
              {ListHangMucKiemTra.map((hm) => {
                return (
                  <Panel
                    header={hm.tenHangMucKiemTra}
                    key={hm.tits_qtsx_HangMucKiemTra_Id}
                  >
                    {hm.list_HangMucKiemTraTieuDePhus.length > 0 &&
                    hm.list_HangMucKiemTraTieuDePhus[0].tieuDePhu ? (
                      <Collapse
                        accordion
                        expandIcon={({ isActive }) => (
                          <CaretRightOutlined rotate={isActive ? 90 : 0} />
                        )}
                      >
                        {hm.list_HangMucKiemTraTieuDePhus.map((cthm) => {
                          return (
                            <Panel
                              header={cthm.tieuDePhu}
                              key={cthm.tits_qtsx_HangMucKiemTraTieuDePhu_Id}
                            >
                              {cthm.list_HangMucKiemTraChiTiets.length > 0 && (
                                <Collapse
                                  accordion
                                  expandIcon={({ isActive }) => (
                                    <CaretRightOutlined
                                      rotate={isActive ? 90 : 0}
                                    />
                                  )}
                                >
                                  {cthm.list_HangMucKiemTraChiTiets.map(
                                    (ct) => {
                                      return (
                                        <Panel
                                          header={ct.noiDungKiemTra}
                                          key={
                                            ct.tits_qtsx_HangMucKiemTraChiTiet_Id
                                          }
                                        ></Panel>
                                      );
                                    }
                                  )}
                                </Collapse>
                              )}
                            </Panel>
                          );
                        })}
                      </Collapse>
                    ) : (
                      hm.list_HangMucKiemTraTieuDePhus.length > 0 &&
                      !hm.list_HangMucKiemTraTieuDePhus[0].tieuDePhu && (
                        <Collapse
                          accordion
                          expandIcon={({ isActive }) => (
                            <CaretRightOutlined rotate={isActive ? 90 : 0} />
                          )}
                        >
                          {hm.list_HangMucKiemTraTieuDePhus[0].list_HangMucKiemTraChiTiets.map(
                            (ct) => {
                              return (
                                <Panel
                                  header={ct.noiDungKiemTra}
                                  key={ct.tits_qtsx_HangMucKiemTraChiTiet_Id}
                                ></Panel>
                              );
                            }
                          )}
                        </Collapse>
                      )
                    )}
                  </Panel>
                );
              })}
            </Collapse>
          </Col>
        )}
        {ListHinhAnh.length > 0 && (
          <Col span={12} align="center">
            <Card>
              {ListHinhAnh.map((ha) => {
                return (
                  <div style={{ border: "1px solid #333", marginBottom: 10 }}>
                    <Image
                      width={"100%"}
                      height={300}
                      src={BASE_URL_API + ha.hinhAnh}
                    />
                  </div>
                );
              })}
            </Card>
          </Col>
        )}
      </Row>

      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          saveAndClose={saveAndClose}
          handleSave={saveAndClose}
          disabled={fieldTouch}
        />
      ) : null}
      {type === "xacnhan" && info && info.trangThai === "Chưa duyệt" && (
        <>
          <Divider />
          <Row>
            <Col style={{ marginBottom: 8, textAlign: "center" }} span={24}>
              <Button
                className="th-margin-bottom-0"
                icon={<RollbackOutlined />}
                onClick={goBack}
                style={{ marginTop: 10 }}
              >
                Quay lại
              </Button>
              <Button
                className="th-margin-bottom-0"
                type="primary"
                onClick={() => modalDuyet()}
                icon={<SaveOutlined />}
                style={{ marginTop: 10 }}
              >
                Duyệt
              </Button>
              <Button
                className="th-margin-bottom-0"
                icon={<CloseOutlined />}
                style={{ marginTop: 10 }}
                onClick={() => modalTuChoi()}
                type="danger"
              >
                Từ chối
              </Button>
            </Col>
          </Row>
        </>
      )}
      <ModalHangMuc
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        DataModal={DataModal}
        setListHangMuc={setListHangMucKiemTra}
        listHangMuc={ListHangMucKiemTra}
      />
    </div>
  );
}

export default QuanLyChecksheetsForm;
