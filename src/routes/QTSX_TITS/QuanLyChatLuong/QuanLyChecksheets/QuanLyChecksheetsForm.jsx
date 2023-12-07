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
import { includes, map } from "lodash";
import {
  Input,
  Select,
  FormSubmit,
  ModalDeleteConfirm,
  Modal,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { BASE_URL_API, DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  RollbackOutlined,
  SaveOutlined,
  CloseOutlined,
  CaretRightOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
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
  const [ListChiTiet, setListChiTiet] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [SanPham, setSanPham] = useState("");
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
        getListSanPham();
        getUserKy(INFO);
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
          getListSanPham();
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
          getListSanPham();
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
          getListSanPham();
        }
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getUserKy = (info) => {
    const params = convertObjectToUrlParams({
      donviId: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${params}&key=1`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        setListUserKy(res.data);
      } else {
        setListUserKy([]);
      }
    });
  };
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

  /**
   * Lấy thông tin info
   *
   * @param {*} id
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_DinhMucVatTuThep/${id}`,
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
          getUserKy(INFO);
          setListChiTiet(
            res.data.list_ChiTiets.map((ct) => {
              return {
                ...ct,
                dai: ct.quyCach.dai,
                rong: ct.quyCach.rong,
                day: ct.quyCach.day,
                dn: ct.quyCach.dn,
                dt: ct.quyCach.dt,
                chung: ct.quyCach.chung,
              };
            })
          );
          setFieldsValue({
            checkSheets: {
              ...res.data,
              isThepTam: res.data.isThepTam ? "true" : "false",
              ngayBanHanh: moment(res.data.ngayBanHanh, "DD/MM/YYYY"),
              ngayApDung: moment(res.data.ngayApDung, "DD/MM/YYYY"),
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "chi tiết";
    ModalDeleteConfirm(deleteItemAction, item, item.maChiTiet, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = ListSanPham.filter((d) => d.key !== item.key);
    setListSanPham(newData);
  };
  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const editItemVal =
      type === "new" || type === "edit"
        ? {
            onClick: () => {
              // setActiveModalEdit(true);
              // setTypeAddTable("edit");
              // setInfoSanPham(item);
            },
          }
        : { disabled: true };
    const deleteItemVal =
      type === "new" || type === "edit"
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          <a {...editItemVal} title="Xóa">
            <EditOutlined />
          </a>
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  const props = {
    accept: ".png, .jpg, .jpeg",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
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

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        saveData(values.checkSheets, value);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (checkSheets, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...checkSheets,
        isThepTam: checkSheets.isThepTam === "true",
        ngayBanHanh: checkSheets.ngayBanHanh.format("DD/MM/YYYY"),
        ngayApDung: checkSheets.ngayApDung.format("DD/MM/YYYY"),
        list_ChiTiets: ListChiTiet.map((ct) => {
          return {
            ...ct,
            quyCach: {
              dai: ct.dai ? ct.dai : undefined,
              rong: ct.rong ? ct.rong : undefined,
              day: ct.day ? ct.day : undefined,
              dn: ct.dn ? ct.dn : undefined,
              dt: ct.dt ? ct.dt : undefined,
              chung: ct.chung ? ct.chung : undefined,
            },
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_DinhMucVatTuThep`,
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
              setListChiTiet([]);

              setFieldsValue({
                checkSheets: {
                  ngayBanHanh: moment(getDateNow(), "DD/MM/YYYY"),
                  ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
                },
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
        ngayBanHanh: checkSheets.ngayBanHanh.format("DD/MM/YYYY"),
        ngayApDung: checkSheets.ngayApDung.format("DD/MM/YYYY"),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_DinhMucVatTuThep/${id}`,
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
        <Tag
          style={{ fontSize: 14 }}
          color={
            info && info.trangThai === "Đã duyệt"
              ? "green"
              : info && info.trangThai === "Chưa duyệt"
              ? "blue"
              : "red"
          }
        >
          {info && info.maDinhMucVatTuThep} - {info && info.trangThai}
        </Tag>
      </span>
    ) : (
      <span>
        Chi tiết CheckSheets{" "}
        <Tag
          style={{ fontSize: 14 }}
          color={
            info && info.trangThai === "Đã duyệt"
              ? "green"
              : info && info.trangThai === "Chưa duyệt"
              ? "blue"
              : "red"
          }
        >
          {info && info.maDinhMucVatTuThep} - {info && info.trangThai}
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
                  name={["checkSheets", "tenDinhMucVatTuThep"]}
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
                  name={["checkSheets", "tenDinhMucVatTuThep"]}
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
                    data={[]}
                    placeholder="Chọn loại sản phẩm"
                    optionsvalue={["id", "name"]}
                    style={{ width: "100%" }}
                    disabled={type !== "new"}
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
                    onSelect={(val) => setSanPham(val)}
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
                    data={ListUserKy}
                    placeholder="Chọn công đoạn"
                    optionsvalue={["id", "fullName"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={type !== "new" && type !== "edit"}
                    onSelect={(val) => {}}
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
                >
                  <Switch />
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
                  label="Hình ảnh"
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
                        style={{
                          marginBottom: 0,
                          height: 25,
                          lineHeight: "25px",
                        }}
                        icon={<UploadOutlined />}
                        disabled={type === "xacnhan" || type === "detail"}
                      >
                        Tải hình ảnh
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
                      {!info.isXacNhan && (
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
            Hạng mục kiểm tra chất lượng {"  "}
            <a onClick={() => setActiveModal(true)}>
              <PlusCircleOutlined />
            </a>
          </h4>
        </Col>
      </Row>
      <Collapse
        accordion
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
      >
        <Panel header="This is panel header 1" key="1">
          <p>Tezxxt</p>
        </Panel>
        <Panel header="This is panel header 2" key="2">
          <p>Tezxxt</p>
        </Panel>
        <Panel header="This is panel header 3" key="3">
          <p>Tezxxt</p>
        </Panel>
      </Collapse>

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
                className="th-btn-margin-bottom-0"
                icon={<RollbackOutlined />}
                onClick={goBack}
                style={{ marginTop: 10 }}
              >
                Quay lại
              </Button>
              <Button
                className="th-btn-margin-bottom-0"
                type="primary"
                onClick={() => modalDuyet()}
                icon={<SaveOutlined />}
                style={{ marginTop: 10 }}
              >
                Duyệt
              </Button>
              <Button
                className="th-btn-margin-bottom-0"
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
      <ModalHangMuc openModal={ActiveModal} openModalFS={setActiveModal} />
    </div>
  );
}

export default QuanLyChecksheetsForm;
