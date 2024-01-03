import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  RollbackOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Button,
  Tag,
  Image,
} from "antd";
import { includes, isEmpty, map } from "lodash";
import Helper from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  ModalDeleteConfirm,
  EditableTableRow,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API, DEFAULT_FORM_TWO_COL } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import DanhSachImport from "./DanhSachImport";
import ModalTuChoi from "./ModalTuChoi";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const OEMForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("new");
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [DataLoi, setDataLoi] = useState([]);
  const [listVatTu, setListVatTu] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [ListNguoiDuyet, setListNguoiDuyet] = useState([]);
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});
  const [ActiveModal, setActiveModal] = useState(false);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getSanPham();
          getNguoiDuyet(INFO);
          setFieldsValue({
            oem: {
              ngayBanHanh: moment(getDateNow(), "DD/MM/YYYY"),
              ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
            },
          });
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getSanPham();
          getNguoiDuyet(INFO);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.edit) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getSanPham();
          getNguoiDuyet(INFO);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
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

  const getNguoiDuyet = (info) => {
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
        setListNguoiDuyet(res.data);
      } else {
        setListNguoiDuyet([]);
      }
    });
  };

  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_OEM/${id}`,
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
          const data = res.data;
          setInfo(data);

          setFieldsValue({
            oem: {
              ...data,
              ngayBanHanh: moment(data.ngayBanHanh, "DD/MM/YYYY"),
              ngayApDung: moment(data.ngayApDung, "DD/MM/YYYY"),
            },
          });
          const chiTiet =
            data.list_ChiTiets &&
            data.list_ChiTiets.map((listchitiet) => {
              let stt = 0;
              return {
                ...listchitiet,
                key: "*",
                list_VatTus: listchitiet.list_VatTus.map((listvattu) => {
                  stt++;
                  return {
                    ...listvattu,
                    key: stt,
                  };
                }),
              };
            });
          const newData = chiTiet;

          chiTiet.forEach((chiTiet) => {
            if (chiTiet.list_VatTus) {
              newData.push(...chiTiet.list_VatTus);
            }
          });
          setListVatTu(newData);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Quay lại trang bộ phận
   *
   */
  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new"
          ? "/them-moi"
          : type === "edit"
          ? `/${id}/chinh-sua`
          : type === "detail"
          ? `/${id}/chi-tiet`
          : `/${id}/xac-nhan`,
        ""
      )}`
    );
  };

  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = listVatTu.filter(
      (d) =>
        d.tits_qtsx_PhieuMuaHangChiTiet_Id !==
        item.tits_qtsx_PhieuMuaHangChiTiet_Id
    );
    setListVatTu(newData);
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal =
      permission && permission.del && (type === "new" || type === "edit")
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
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
      align: "center",
      width: 50,
      onCell: (record) => ({
        className: record.key === "*" ? "total-row" : "",
      }),
    },
    {
      title: "Mã vật tư/chi tiết",
      dataIndex: "maVatTuChiTiet",
      key: "maVatTuChiTiet",
      align: "center",
      onCell: (record) => ({
        className: record.key === "*" ? "total-row" : "",
      }),
    },
    {
      title: "Tên vật tư/chi tiết",
      dataIndex: "tenVatTuChiTiet",
      key: "tenVatTuChiTiet",
      align: "center",
      onCell: (record) => ({
        className: record.key === "*" ? "total-row" : "",
      }),
    },
    {
      title: "Mã đơn vị tính",
      dataIndex: type === "new" ? "maDonViTinh" : "tenDonViTinh",
      key: type === "new" ? "maDonViTinh" : "tenDonViTinh",
      align: "center",
      onCell: (record) => ({
        className: record.key === "*" ? "total-row" : "",
      }),
    },
    {
      title: "Thông số kỹ thuật",
      dataIndex: "thongSoKyThuat",
      key: "thongSoKyThuat",
      align: "center",
      onCell: (record) => ({
        className: record.key === "*" ? "total-row" : "",
      }),
    },
    {
      title: "Vật liệu",
      dataIndex: "vatLieu",
      key: "vatLieu",
      align: "center",
      onCell: (record) => ({
        className: record.key === "*" ? "total-row" : "",
      }),
    },
    {
      title: "Số lượng",
      dataIndex: "dinhMuc",
      key: "dinhMuc",
      align: "center",
      width: 80,
      onCell: (record) => ({
        className: record.key === "*" ? "total-row" : "",
      }),
    },
    {
      title: "Mã xưởng nhận",
      dataIndex: type === "new" ? "maXuong" : "tenXuong",
      key: type === "new" ? "maXuong" : "tenXuong",
      align: "center",
      onCell: (record) => ({
        className: record.key === "*" ? "total-row" : "",
      }),
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ maxWidth: 80, maxHeight: 80 }}
            />
          </span>
        ),
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      onCell: (record) => ({
        className: record.key === "*" ? "total-row" : "",
      }),
    },
    {
      title: "Lỗi",
      dataIndex: "ghiChuImport",
      key: "ghiChuImport",
      align: "center",
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
    saveData(values.oem);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (listVatTu.length === 0) {
          Helper.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.oem, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (oem, saveQuit = false) => {
    if (type === "new") {
      const ListChiTiet = [];
      let children = null;

      listVatTu.forEach((data) => {
        if (data.key === "*") {
          children = { ...data, list_VatTus: [] };
          ListChiTiet.push(children);
        } else if (children) {
          children.list_VatTus.push(data);
        }
      });

      const newData = {
        ...oem,
        donVi_Id: INFO.donVi_Id,
        ngayBanHanh: oem.ngayBanHanh.format("DD/MM/YYYY"),
        ngayApDung: oem.ngayApDung.format("DD/MM/YYYY"),
        list_ChiTiets: ListChiTiet.map((listchitiet) => {
          return {
            ...listchitiet,
            dinhMuc: listchitiet.dinhMuc && parseFloat(listchitiet.dinhMuc),
            list_VatTus:
              listchitiet.list_VatTus &&
              listchitiet.list_VatTus.map((listvattu) => {
                return {
                  ...listvattu,
                  dinhMuc: listvattu.dinhMuc && parseFloat(listvattu.dinhMuc),
                };
              }),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_OEM`,
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
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              setListVatTu([]);
              setFieldsValue({
                oem: {
                  ngayBanHanh: moment(getDateNow(), "DD/MM/YYYY"),
                  ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
                },
              });
            }
          } else {
            setDataLoi(res.data);
            const newData = listVatTu.map((data) => {
              const dt = res.data.find(
                (item) =>
                  item.maVatTuChiTiet === data.maVatTuChiTiet &&
                  item.tenVatTuChiTiet === data.tenVatTuChiTiet
              );

              if (dt) {
                return {
                  ...data,
                  ghiChuImport: dt.ghiChuImport,
                };
              } else {
                return data;
              }
            });
            setListVatTu(newData);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleXacNhan = () => {
    const newData = {
      id: id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_OEM/duyet/${id}`,
          "PUT",
          newData,
          "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getSanPham();
          getNguoiDuyet(INFO);
          getInfo(id);
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận OEM",
    onOk: handleXacNhan,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const saveTuChoi = (data) => {
    const newData = {
      id: id,
      lyDoTuChoi: data,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_OEM/duyet/${id}`,
          "PUT",
          newData,
          "TUCHOI",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getSanPham();
          getNguoiDuyet(INFO);
          getInfo(id);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleSelectSanPham = (value) => {
    setSanPham(value);
    setListVatTu([]);
  };

  const DanhSachChiTiet = (data) => {
    setListVatTu(data);
    setFieldTouch(true);
    setDataLoi([]);
  };

  const RowStyle = (current, index) => {
    if (DataLoi && DataLoi.length > 0) {
      let check = false;
      DataLoi.forEach((dt) => {
        if (
          current.maVatTuChiTiet.toString() === dt.maVatTuChiTiet.toString() &&
          current.tenVatTuChiTiet.toString() === dt.tenVatTuChiTiet.toString()
        ) {
          check = true;
        }
      });
      if (check) {
        return "red-row";
      }
    } else {
      return;
    }
  };

  const formTitle =
    type === "new" ? (
      "Tạo OEM "
    ) : type === "edit" ? (
      "Chỉnh sửa OEM"
    ) : (
      <span>
        Chi tiết OEM -{" "}
        <Tag color={"blue"} style={{ fontSize: "15px" }}>
          {info.maOEM}
        </Tag>
        <Tag
          color={
            info.trangThai === "Chưa duyệt"
              ? "orange"
              : info.trangThai === "Đã duyệt"
              ? "blue"
              : "red"
          }
          style={{
            fontSize: "15px",
          }}
        >
          {info.trangThai}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin OEM"}
      >
        <Form
          {...DEFAULT_FORM_TWO_COL}
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
                label="Tên OEM"
                name={["oem", "tenOEM"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập tên OEM"
                  disabled={type === "new" || type === "edit" ? false : true}
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
                name={["oem", "tits_qtsx_SanPham_Id"]}
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
                  optionsvalue={["id", "tenSanPham"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  onSelect={handleSelectSanPham}
                  disabled={type === "new" || type === "edit" ? false : true}
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
                label="Ngày ban hành"
                name={["oem", "ngayBanHanh"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  disabled={type === "new" || type === "edit" ? false : true}
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
                name={["oem", "ngayApDung"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  disabled={type === "new" || type === "edit" ? false : true}
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
                name={["oem", "nguoiKiemTra_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNguoiDuyet}
                  placeholder="Chọn người kiểm tra"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
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
                label="Người phê duyệt"
                name={["oem", "nguoiPheDuyet_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNguoiDuyet}
                  placeholder="Chọn người phê duyệt"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            {info.trangThai === "Đã từ chối" && (
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
                  label="Lý do từ chối"
                  name={["oem", "lyDoTuChoi"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" disabled={true} />
                </FormItem>
              </Col>
            )}
          </Row>
        </Form>
      </Card>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Danh sách vật tư"}
      >
        {type === "new" || type === "edit" ? (
          <Row justify={"end"} style={{ padding: "0px 20px 10px 20px" }}>
            <Button
              icon={<UploadOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={() => setActiveModal(true)}
              disabled={!SanPham ? true : false}
            >
              File import
            </Button>
          </Row>
        ) : null}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 900, y: "35vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={listVatTu}
          size="small"
          rowClassName={DataLoi ? RowStyle : "editable-row"}
          pagination={false}
          // loading={loading}
        />
      </Card>
      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={saveAndClose}
          saveAndClose={saveAndClose}
          disabled={fieldTouch}
        />
      ) : null}
      {type === "xacnhan" &&
      info.trangThai === "Chưa duyệt" &&
      info.nguoiPheDuyet_Id === INFO.user_Id ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button icon={<RollbackOutlined />} type="default" onClick={goBack}>
            Quay lại
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            type="primary"
            onClick={modalXK}
          >
            Xác nhận
          </Button>
          <Button
            icon={<CloseCircleOutlined />}
            type="danger"
            onClick={() => setActiveModalTuChoi(true)}
          >
            Từ chối
          </Button>
        </div>
      ) : null}
      <DanhSachImport
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        DanhSachChiTiet={DanhSachChiTiet}
        itemData={SanPham}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
};

export default OEMForm;
