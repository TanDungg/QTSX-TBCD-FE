import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { Card, Form, Input, Row, Col, DatePicker, Button, Tag } from "antd";
import { includes, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  EditableTableRow,
  Modal,
  ModalDeleteConfirm,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_DENGHI_CVT } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import { useLocation } from "react-router-dom";
import ModalTuChoi from "./ModalTuChoi";
import ModalThemThanhPham from "./ModalThemThanhPham";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const PhieuXuatKhoThanhPhamForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListThanhPham, setListThanhPham] = useState([]);
  const [ListKhoThanhPham, setListKhoThanhPham] = useState([]);
  const [KhoVatTu, setKhoVatTu] = useState(null);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [ActiveModalThemThanhPham, setActiveModalThemThanhPham] =
    useState(false);
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getUserKy(INFO);
        getUserLap(INFO, null);
        getListKho();
        if (permission && permission.add) {
          setType("new");
          setFieldsValue({
            phieuxuatkhothanhpham: {
              ngay: moment(getDateNow(), "DD/MM/YYYY"),
            },
          });
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else if (includes(match.url, "chinh-sua")) {
        if (permission && permission.edit) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.edit) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&&isThanhPham=true`,
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
          setListKhoThanhPham(res.data);
        } else {
          setListKhoThanhPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getUserLap = (info, nguoiTao_Id) => {
    const params = convertObjectToUrlParams({
      id: nguoiTao_Id ? nguoiTao_Id : info.user_Id,
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${nguoiTao_Id ? nguoiTao_Id : info.user_Id}?${params}`,
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
        setListUser([res.data]);
        setFieldsValue({
          phieuxuatkhothanhpham: {
            nguoiTao_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      }
    });
  };

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

  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuXuatKhoVatTuPhu/${id}`,
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
          getListKho();
          getUserLap(INFO, res.data.nguoiTao_Id);
          setFieldsValue({
            phieuxuatkhothanhpham: {
              ...res.data,
              ngay: moment(res.data.ngay, "DD/MM/YYYY"),
            },
          });
          const chiTiet =
            res.data.list_ChiTiets && JSON.parse(res.data.list_ChiTiets);
          const newData =
            chiTiet &&
            chiTiet.map((data) => {
              const lstViTri = data.list_ChiTietLuuKhos.map((vt) => {
                const vitri = `${vt.maKe ? `${vt.maKe}` : ""}${
                  vt.maTang ? ` - ${vt.maTang}` : ""
                }${vt.maNgan ? ` - ${vt.maNgan}` : ""}`;
                return {
                  ...vt,
                  viTri: vitri ? vitri : null,
                };
              });
              return {
                ...data,
                list_ChiTietLuuKhos: lstViTri,
              };
            });
          setListThanhPham(newData && newData);
        }
      })
      .catch((error) => console.error(error));
  };

  const goBack = () => {
    if (type === "taophieuxuat") {
      history.push({
        pathname: `/quan-ly-kho-tpc/phieu-de-nghi-cap-vat-tu`,
      });
    } else {
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
    }
  };

  const deleteItemFunc = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  const deleteItemAction = (item) => {
    const newData = ListThanhPham.filter((d) => d.maVatTu !== item.maVatTu);
    setListThanhPham(newData);
    setFieldTouch(true);
  };

  const actionContent = (item) => {
    const deleteItemVal =
      permission && permission.del && type === "new"
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

  const renderLstViTri = (record) => {
    return (
      <div>
        {record.list_ChiTietLuuKhos.map((vt, index) => {
          if (!vt.viTri) {
            if (index === 0) {
              return (
                <Tag
                  key={index}
                  color={"blue"}
                  style={{
                    marginRight: 5,
                    marginBottom: 3,
                    fontSize: 14,
                  }}
                >
                  {`${vt.tenKho} (SL: ${vt.soLuong})`}
                </Tag>
              );
            } else {
              return null;
            }
          } else {
            return (
              <Tag
                key={index}
                color={"blue"}
                style={{
                  marginRight: 5,
                  marginBottom: 3,
                  fontSize: 14,
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {`${vt.viTri} (SL: ${vt.soLuong})`}
              </Tag>
            );
          }
        })}
      </div>
    );
  };

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Mã thành phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
    },
    {
      title: "tên thành phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Số lượng xuất",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Vị trí",
      key: "list_ChiTietLuuKhos",
      align: "center",
      render: (record) => renderLstViTri(record),
    },
    {
      title: "Đơn hàng",
      dataIndex: "maPhieu",
      key: "maPhieu",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
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

  const onFinish = (values) => {
    saveData(values.phieuxuatkhothanhpham);
  };

  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        if (ListThanhPham.length === 0) {
          Helpers.alertError("Danh sách thành phẩm rỗng");
        } else {
          saveData(values.phieuxuatkhothanhpham, value);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (data, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...data,
        ngay: data.ngay.format("DD/MM/YYYY"),
        list_ThanhPhams: ListThanhPham,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuXuatKhoThanhPham`,
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
              getUserKy(INFO);
              getUserLap(INFO, null);
              getListKho();
              setFieldsValue({
                phieuxuatkhothanhpham: {
                  ngay: moment(getDateNow(), "DD/MM/YYYY"),
                },
              });
              setFieldTouch(false);
              setListThanhPham([]);
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...data,
        id: id,
        tits_qtsx_PhieuYeuCauCapVatTu_Id: info.tits_qtsx_PhieuYeuCauCapVatTu_Id,
        ngay: data.ngay.format("DD/MM/YYYY"),
        list_ChiTiets: ListThanhPham,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuXuatKhoVatTuPhu/${id}`,
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
            getInfo(id);
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
          `tits_qtsx_PhieuXuatKhoVatTuPhu/duyet/${id}`,
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
          getInfo(id);
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận phiếu xuất kho thành phẩm",
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
          `tits_qtsx_PhieuXuatKhoVatTuPhu/duyet/${id}`,
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
        if (res.status !== 409) getInfo(id);
      })
      .catch((error) => console.error(error));
  };

  const DataThemThanhPham = (data) => {
    setListThanhPham([...ListThanhPham, ...data]);
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu xuất kho thành phẩm"
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu xuất kho thành phẩm"
    ) : (
      <span>
        Chi tiết phiếu xuất kho thành phẩm-{" "}
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.maPhieu}
        </Tag>
        <Tag
          color={
            info.tinhTrang === "Chưa duyệt"
              ? "orange"
              : info.tinhTrang === "Đã duyệt"
              ? "blue"
              : info.tinhTrang && info.tinhTrang.startsWith("Bị hủy")
              ? "red"
              : "cyan"
          }
          style={{
            fontSize: "14px",
          }}
        >
          {info.tinhTrang}
        </Tag>
      </span>
    );

  const handleSelectXuong = (val) => {
    setFieldsValue({
      phieuxuatkhothanhpham: {
        tits_qtsx_PhieuYeuCauCapVatTu_Id: null,
      },
    });
    setListThanhPham([]);
  };

  const handleSelectKho = (val) => {
    setKhoVatTu(val);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin phiếu xuất kho thành phẩm"}
      >
        <Form
          {...DEFAULT_FORM_DENGHI_CVT}
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
                label="Người lập"
                name={["phieuxuatkhothanhpham", "nguoiTao_Id"]}
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
                  optionsvalue={["Id", "fullName"]}
                  style={{ width: "100%" }}
                  disabled={true}
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
                label="Ban/Phòng"
                name={["phieuxuatkhothanhpham", "tenPhongBan"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input className="input-item" disabled={true} />
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
                label="Kho xuất"
                name={["phieuxuatkhothanhpham", "tits_qtsx_CauTrucKho_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  placeholder="Kho xuất"
                  className="heading-select slt-search th-select-heading"
                  data={ListKhoThanhPham ? ListKhoThanhPham : []}
                  optionsvalue={["id", "tenCauTrucKho"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                  onSelect={handleSelectKho}
                  disabled={ListThanhPham.length}
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
                label="Số R/O"
                name={["phieuxuatkhothanhpham", "soRO"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập số R/O"
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
                label="Ngày xuất"
                name={["phieuxuatkhothanhpham", "ngay"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  disabled={type === "new" ? false : true}
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
                label="Người nhận"
                name={["phieuxuatkhothanhpham", "nguoiNhan_Id"]}
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
                  placeholder="Chọn người nhận"
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
                label="PT Bộ phận"
                name={["phieuxuatkhothanhpham", "nguoiPTBoPhanDuyet_Id"]}
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
                  placeholder="Chọn phụ trách bộ phận"
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
                label="BP kế toán"
                name={["phieuxuatkhothanhpham", "nguoiKeToanDuyet_Id"]}
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
                  placeholder="Chọn bộ phận kế toán"
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
                label="Nội dung xuất"
                name={["phieuxuatkhothanhpham", "noiDung"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập nội dung xuất"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            {info.tinhTrang && info.tinhTrang.startsWith("Bị hủy") ? (
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem label="Lý do hủy">
                  <Input
                    className="input-item"
                    disabled={true}
                    value={
                      info.lyDoPTBoPhanTuChoi
                        ? info.lyDoPTBoPhanTuChoi
                        : info.lyDoKeToanTuChoi
                    }
                  />
                </FormItem>
              </Col>
            ) : null}
          </Row>
        </Form>
      </Card>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Danh sách thành phẩm"}
      >
        {(type === "new" || type === "edit") && (
          <div align={"end"}>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => setActiveModalThemThanhPham(true)}
              type="primary"
              disabled={!KhoVatTu}
            >
              Thêm thành phẩm
            </Button>
          </div>
        )}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListThanhPham)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
      </Card>
      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={onFinish}
          saveAndClose={saveAndClose}
          disabled={fieldTouch && ListThanhPham.length !== 0}
        />
      ) : null}
      {(type === "xacnhan" &&
        info.tinhTrang === "Chưa duyệt" &&
        info.nguoiPTBoPhanDuyet_Id === INFO.user_Id) ||
      (type === "xacnhan" &&
        info.tinhTrang === "Chờ kế toán duyệt" &&
        info.nguoiKeToanDuyet_Id === INFO.user_Id) ? (
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
      <ModalThemThanhPham
        openModal={ActiveModalThemThanhPham}
        openModalFS={setActiveModalThemThanhPham}
        itemData={{
          tits_qtsx_CauTrucKho_Id: KhoVatTu,
          ListThanhPham: ListThanhPham,
        }}
        DataThemThanhPham={DataThemThanhPham}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
};

export default PhieuXuatKhoThanhPhamForm;
