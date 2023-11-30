import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Row,
  Spin,
  Upload,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes, map } from "lodash";
import {
  Input,
  Select,
  FormSubmit,
  ModalDeleteConfirm,
  EditableTableRow,
  Table,
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
import Helpers from "src/helpers";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import ImportBOM from "./ImportBOM";
const { EditableRow, EditableCell } = EditableTableRow;

const FormItem = Form.Item;

function BOMForm({ match, permission, history }) {
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

  const [FileThongSoKyThuat, setFileThongSoKyThuat] = useState(null);
  const [DisableUpload, setDisableUpload] = useState(false);
  const [ActiveModalImport, setActiveModalImport] = useState(false);

  const [info, setInfo] = useState(null);
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
          BOM: {
            ngayBanHanh: moment(getDateNow(), "DD/MM/YYYY"),
            ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
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
          `tits_qtsx_BOM/${id}`,
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
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "sản phẩm";
    ModalDeleteConfirm(deleteItemAction, item, item.tenSanPham, title);
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
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Mã chi tiết",
      dataIndex: "maChiTiet",
      key: "maChiTiet",
      align: "center",
      width: 150,
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "center",
      width: 150,
    },
    {
      title: "Vật liệu",
      dataIndex: "vatLieu",
      key: "vatLieu",
      align: "center",
      width: 120,
    },
    {
      title: "Xuất xứ",
      dataIndex: "xuatXu",
      key: "xuatXu",
      align: "center",
      width: 70,
    },
    {
      title: "Quy cách(mm)",
      key: "quyCach",
      align: "center",
      children: [
        {
          title: "Dài",
          dataIndex: "dai",
          key: "dai",
          align: "center",
          width: 50,
        },
        {
          title: "Rộng",
          dataIndex: "rong",
          key: "rong",
          align: "center",
          width: 50,
        },
        {
          title: "Dày",
          dataIndex: "day",
          key: "day",
          align: "center",
          width: 50,
        },
        {
          title: "Do",
          dataIndex: "dn",
          key: "dn",
          align: "center",
          width: 50,
        },
        {
          title: "Di",
          dataIndex: "dt",
          key: "dt",
          align: "center",
          width: 50,
        },
        {
          title: "Chung",
          dataIndex: "chung",
          key: "chung",
          align: "center",
          width: 55,
        },
      ],
    },
    {
      title: "SL/SP",
      dataIndex: "dinhMuc",
      key: "dinhMuc",
      align: "center",
      width: 55,
    },
    {
      title: "KL/SP",
      dataIndex: "xuatXu",
      key: "xuatXu",
      align: "center",
      width: 55,
    },

    {
      title: "Chuyển",
      key: "chuyen",
      align: "center",
      children: [
        {
          title: "THCK(CMC)",
          key: "THCK(CMC)",
          align: "center",
          children: [
            {
              title: "Gia công",
              dataIndex: "giaCong",
              key: "giaCong",
              align: "center",
              width: 55,
            },
            {
              title: "ED",
              dataIndex: "eD",
              key: "eD",
              align: "center",
              width: 50,
            },
            {
              title: "Xi mạ",
              key: "xiMa",
              dataIndex: "xiMa",
              align: "center",
              width: 50,
            },
          ],
        },
        {
          title: "NMK",
          dataIndex: "NMK",
          key: "NMK",
          align: "center",
          width: 50,
        },
        {
          title: "Công ty SMRM & Cấu kiện nặng(TITS)",
          key: "Công ty SMRM & Cấu kiện nặng(TITS)",
          align: "center",
          children: [
            {
              title: "Kho",
              dataIndex: "kho",
              key: "kho",
              align: "center",
              width: 50,
            },
            {
              title: "Xưởng GCCT",
              key: "xuongGCCT",
              align: "center",
              children: [
                {
                  title: "Lazer",
                  dataIndex: "lazer",
                  key: "lazer",
                  align: "center",
                  width: 50,
                },
                {
                  title: "Lazer Dầm H",
                  dataIndex: "lazerDamH",
                  key: "lazerDamH",
                  align: "center",
                  width: 50,
                },
                {
                  title: "Cưa vòng",
                  key: "cuaVong",
                  dataIndex: "cuaVong",
                  align: "center",
                  width: 50,
                },
                {
                  title: "Chấn/ Đột",
                  key: "chanDot",
                  dataIndex: "chanDot",
                  align: "center",
                  width: 50,
                },
                {
                  title: "Vát mép",
                  key: "vatMep",
                  dataIndex: "vatMep",
                  align: "center",
                  width: 50,
                },
                {
                  title: "Khoan lỗ",
                  key: "khoanLo",
                  dataIndex: "khoanLo",
                  align: "center",
                  width: 55,
                },
              ],
            },
            {
              title: "XHLKR",
              key: "xHLKR",
              dataIndex: "xHLKR",
              align: "center",
              width: 60,
            },
            {
              title: "XHKX",
              key: "xHKX",
              dataIndex: "xHKX",
              align: "center",
              width: 55,
            },
            {
              title: "Phun bi",
              key: "phunBi",
              dataIndex: "phunBi",
              align: "center",
              width: 55,
            },
            {
              title: "Sơn",
              key: "son",
              dataIndex: "son",
              align: "center",
              width: 55,
            },
            {
              title: "X - LR",
              key: "xLR",
              dataIndex: "xLR",
              align: "center",
              width: 55,
            },
            {
              title: "Kiểm định",
              key: "kiemDinh",
              dataIndex: "kiemDinh",
              align: "center",
              width: 55,
            },
            {
              title: "Đóng kiện",
              key: "dongKien",
              dataIndex: "dongKien",
              align: "center",
              width: 55,
            },
          ],
        },
      ],
    },

    {
      title: "Ghi chú",
      key: "ghiChu",
      align: "center",
      children: [
        {
          title: "Phương pháp gia công",
          dataIndex: "phuongPhapGiaCong",
          key: "phuongPhapGiaCong",
          align: "center",
          width: 100,
        },
      ],
    },
    {
      title: "Phân trạm",
      dataIndex: "maTram",
      key: "maTram",
      align: "center",
      width: 100,
    },
    {
      title: "Ghi chú kỹ thuật",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 150,
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });
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
  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        uploadFile(values.BOM, value);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (BOM, saveQuit) => {
    if (BOM.file) {
      if (type === "new") {
        const formData = new FormData();
        formData.append("file", BOM.file.file);
        fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            BOM.file = data.path;
            saveData(BOM, saveQuit);
          })
          .catch(() => {
            console.log("upload failed.");
          });
      }
      if (type === "edit") {
        if (BOM.file.file) {
          const formData = new FormData();
          formData.append("file", BOM.file.file);
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
              BOM.file = data.path;
              saveData(BOM, saveQuit);
            })
            .catch(() => {
              console.log("upload failed.");
            });
        } else {
          saveData(BOM, saveQuit);
        }
      }
    } else {
      Helpers.alertError(`File thông số kỹ thuật không được để trống`);
      setFieldTouch(false);
    }
  };

  const saveData = (BOM, saveQuit = false) => {
    const newData = {
      ...BOM,
      ngayBanHanh: BOM.ngayBanHanh.format("DD/MM/YYYY"),
      ngayHieuLuc: BOM.ngayHieuLuc.format("DD/MM/YYYY"),
    };
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_BOM`,
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
                BOM: {
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
        ...BOM,
        id: id,
        ngayBanHanh: BOM.ngayBanHanh.format("DD/MM/YYYY"),
        ngayHieuLuc: BOM.ngayHieuLuc.format("DD/MM/YYYY"),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_BOM/${id}`,
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

  const formTitle = type === "new" ? "Thêm mới BOM" : "Chỉnh sửa BOM";

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
                  label="Tên BOM"
                  name={["BOM", "tenBOM"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                      message: "Tên BOM không được quá 250 ký tự",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập tên BOM" />
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
                  label="Ngày ban hành"
                  name={["BOM", "ngayBanHanh"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    format={"DD/MM/YYYY"}
                    allowClear={false}
                    onChange={(dates, dateString) => {
                      setFieldsValue({
                        BOM: {
                          ngayBanHanh: moment(dateString, "DD/MM/YYYY"),
                        },
                      });
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
                  label="Ngày áp dụng"
                  name={["BOM", "ngayApDung"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    format={"DD/MM/YYYY"}
                    allowClear={false}
                    onChange={(dates, dateString) => {
                      setFieldsValue({
                        BOM: {
                          ngayApDung: moment(dateString, "DD/MM/YYYY"),
                        },
                      });
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
                  name={["BOM", "tits_qtsx_SanPham_Id"]}
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
                  label="Người kiểm tra"
                  name={["BOM", "nguoiKiemTra_Id"]}
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
                    placeholder="Chọn người kiểm tra"
                    optionsvalue={["id", "fullName"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={type !== "new"}
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
                  label="Người duyệt"
                  name={["BOM", "nguoiPheDuyet_Id"]}
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
                    placeholder="Chọn người duyệt"
                    optionsvalue={["id", "fullName"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={type !== "new"}
                    onSelect={(val) => {}}
                  />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>
      <Card
        className="th-card-margin-bottom"
        title="Thông tin vật tư BOM"
        headStyle={{
          textAlign: "center",
          backgroundColor: "#0469B9",
          color: "#fff",
        }}
      >
        {(type === "new" || type === "edit") && (
          <Col
            // xxl={12}
            // xl={12}
            // lg={24}
            // md={24}
            // sm={24}
            // xs={24}
            // style={{ marginBottom: 8 }}
            span={24}
            align="end"
          >
            {type === "new" && (
              <Button
                icon={<UploadOutlined />}
                onClick={() => setActiveModalImport(true)}
                type="primary"
                disabled={SanPham === ""}
              >
                Import
              </Button>
            )}
          </Col>
        )}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={ListChiTiet}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
      </Card>
      <FormSubmit
        goBack={goBack}
        saveAndClose={saveAndClose}
        handleSave={saveAndClose}
        disabled={fieldTouch}
      />
      <ImportBOM
        openModal={ActiveModalImport}
        openModalFS={setActiveModalImport}
        SanPham={SanPham}
      />
    </div>
  );
}

export default BOMForm;
